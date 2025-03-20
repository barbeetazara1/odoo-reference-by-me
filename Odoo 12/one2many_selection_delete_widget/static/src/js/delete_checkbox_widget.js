odoo.define('one2many_selection_delete_widget.form_widgets', function (require) {
    "use strict";

    var core = require('web.core');
    var utils = require('web.utils');
    var _t = core._t;
    var QWeb = core.qweb;
    var fieldRegistry = require('web.field_registry');
    var ListRenderer = require('web.ListRenderer');
    var rpc = require('web.rpc');
    var FieldOne2Many = require('web.relational_fields').FieldOne2Many;

    ListRenderer.include({

        // Override ini agar pagination tetap menyimpan semua data yang telah dimuat
        _fetchMoreRecords: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                self._updateSelection();
            });
        },

        // Perbaikan seleksi record agar tetap bekerja saat pagination diperbesar
        _updateSelection: function () {
            this.selection = [];
            var self = this;
            var $inputs = this.$('tbody .o_list_record_selector input:visible:not(:disabled)');
            var allChecked = $inputs.length > 0;
            
            $inputs.each(function (index, input) {
                if (input.checked) {
                    self.selection.push($(input).closest('tr').data('id'));
                } else {
                    allChecked = false;
                }
            });

            if (this.selection.length > 0) {
                $('.button_delete_lines').show();
            } else {
                $('.button_delete_lines').hide();
            }

            this.$('thead .o_list_record_selector input').prop('checked', allChecked);
            this.trigger_up('selection_changed', { selection: this.selection });
            this._updateFooter();
        },
    });

    var One2ManySelectable = FieldOne2Many.extend({
        template: 'One2ManySelectable',
        events: {
            "click .button_delete_lines": "action_selected_lines",
        },

        start: function () {
            this._super.apply(this, arguments);
        },

        // Menghapus record yang dipilih dengan metode RPC
        action_selected_lines: function () {
            var self = this;
            var selected_ids = self.get_selected_ids_one2many();

            if (selected_ids.length === 0) {
                this.do_warn(_t("You must choose at least one record."));
                return false;
            }

            rpc.query({
                'model': this.value.model, // Menggunakan model dinamis
                'method': 'unlink',
                'args': [selected_ids],
            }).then(function (result) {
                self.trigger_up('reload');
            })
        },

        _getRenderer: function () {
            if (this.view.arch.tag === 'kanban') {
                return One2ManyKanbanRenderer;
            }
            if (this.view.arch.tag === 'tree') {
                return ListRenderer.extend({
                    init: function (parent, state, params) {
                        this._super.apply(this, arguments);
                        this.hasSelectors = true;
                    },
                });
            }
            return this._super.apply(this, arguments);
        },

        // Fungsi untuk mendapatkan semua ID record yang dipilih
        get_selected_ids_one2many: function () {
            var self = this;
            var ids = [];

            this.$el.find('td.o_list_record_selector input:checked')
                .closest('tr').each(function () {
                    var recordId = $(this).data('id');
                    var res_id = self._getResId(recordId);
                    if (res_id) {
                        ids.push(res_id);
                    }
                });

            return ids;
        },

        // Perbaikan pencarian res_id agar tetap bisa ditemukan meskipun pagination besar
        _getResId: function (recordId) {
            var record = this.value.data.find(r => r.id === recordId);
            return record ? record.res_id : false;
        },
    });

    // Mendaftarkan widget di fieldRegistry Odoo
    fieldRegistry.add('one2many_selectable', One2ManySelectable);
});
