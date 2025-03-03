odoo.define('ins_base_bsr.ListViewColumnFilter', function (require) {
    "use strict";

    var ListRenderer = require('web.ListRenderer');
    var ListController = require('web.ListController');
    var core = require('web.core');
    var _t = core._t;

    ListRenderer.include({
        _renderHeader: function () {
            var $thead = this._super.apply(this, arguments);
            var self = this;
        
            var $tableContainer = this.$el.closest('.table-responsive');
            var $prevElement = $tableContainer.prev('.o_x2m_control_panel');
            var $prevElementButton = $tableContainer.prev('.button_delete_lines');
        
            if ($prevElement.length > 0 || $prevElementButton.length > 0) {
                console.log("Filter tidak ditampilkan karena ada o_x2m_control_panel.");
                return $thead;
            }
        
            var $filterRow = $('<tr class="o_list_view_filter"></tr>');
            this.filter_values = this.filter_values || {};
        
            $thead.find('th').each(function () {
                var $th = $(this);
                var fieldName = $th.data('name');
                var fieldType = self.state.fields[fieldName]?.type;

                // Abaikan fields dengan tipe boolean
                if (!fieldName || fieldType === 'boolean') {
                    $filterRow.append('<th></th>');
                    return;
                }
        
                var inputType = (fieldType === 'date' || fieldType === 'datetime') ? 'date' : 'text';
                var $input = $('<input>', {
                    type: inputType,
                    class: 'o_list_filter_input form-control',
                    placeholder: 'Filter...',
                    value: self.filter_values[fieldName] || ''
                });
        
                var $searchButton = $('<button>', {
                    class: 'btn btn-sm btn-primary o_list_filter_button',
                    html: '<i class="fa fa-search"></i>',
                    'data-field': fieldName
                });

                var $clearButton = $('<button>', {
                    class: 'btn btn-sm btn-danger o_list_filter_clear_button',
                    html: '<i class="fa fa-times"></i>',
                    'data-field': fieldName
                });
        
                var $filterTh = $('<th></th>').append(
                    $('<div>', { class: 'input-group' }).append($input, $searchButton, $clearButton)
                );
        
                $filterRow.append($filterTh);
        
                // Event pencarian saat tombol search ditekan
                $searchButton.on('click', function () {
                    var searchText = $input.val().trim();
                    self.filter_values[fieldName] = searchText;
                    self.trigger_up('filter_data', { fieldName, searchText, fieldType });
                });
        
                // Event pencarian saat menekan Enter
                $input.on('keyup', function (event) {
                    if (event.key === 'Enter') {
                        var searchText = $input.val().trim();
                        self.filter_values[fieldName] = searchText;
                        self.trigger_up('filter_data', { fieldName, searchText, fieldType });
                    }
                });

                $clearButton.on('click', function () {
                    self.trigger_up('reset_filters');
                });
            });
        
            $thead.append($filterRow);
        
            this.$noResultsPage = $(
                '<div class="o_list_no_results_page" style="display: none; text-align: center; padding: 50px;">' +
                '<h3>🚀 Oops! Hasil Tidak Ditemukan</h3>' +
                '<p>Coba sesuaikan kriteria filter Anda atau cari dengan kata kunci yang berbeda.</p>' +
                '<button class="btn btn-primary reset-filters">Reset Filters</button>' +
                '</div>'
            );
        
            this.$el.append(this.$noResultsPage);
        
            this.$noResultsPage.find('.reset-filters').on('click', function () {
                self.trigger_up('reset_filters');
            });
        
            return $thead;
        },

        _updateNoResults: function (isVisible) {
            if (isVisible) {
                this.$el.find('tbody').hide();
                this.$noResultsPage.show();
            } else {
                this.$el.find('tbody').show();
                this.$noResultsPage.hide();
            }
        }
    });

    ListController.include({
        custom_events: _.extend({}, ListController.prototype.custom_events, {
            filter_data: '_onFilterData',
            reset_filters: '_onResetFilters',
        }),

        willStart: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                self.initialDomain = self.initialState.domain || [];
            });
        },

        _onFilterData: function (event) {
            var self = this;
            var fieldName = event.data.fieldName;
            var searchText = event.data.searchText;
            var fieldType = event.data.fieldType;

            this.renderer.filter_values = this.renderer.filter_values || {};

            if (searchText) {
                this.renderer.filter_values[fieldName] = searchText;
            } else if (fieldName === null) {
                this.renderer.filter_values = {};
            } else {
                delete this.renderer.filter_values[fieldName];
            }

            var domain = Object.entries(this.renderer.filter_values).map(([field, value]) => {
                var type = this.renderer.state.fields[field]?.type;
                return (type === 'date' || type === 'datetime') ? [field, '=', value] : [field, 'ilike', value];
            });

            this._rpc({
                model: this.modelName,
                method: 'search_count',
                args: [domain],
            }).then(function (count) {
                if (count === 0) {
                    self.renderer._updateNoResults(true);
                } else {
                    self.renderer._updateNoResults(false);
                    self.reload({ domain });
                }
            });
        },

        _onResetFilters: function () {
            var self = this;
            this.renderer.filter_values = {};
            this.renderer.$el.find('.o_list_filter_input').val('');

            this.reload({ domain: this.initialDomain }).then(function () {
                self.renderer._updateNoResults(false);
            });
        }
    });
});
