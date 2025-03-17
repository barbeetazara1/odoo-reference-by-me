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
                console.log("❌ Filter tidak ditampilkan karena ada o_x2m_control_panel.");
                return $thead;
            }

            var $filterRow = $('<tr class="o_list_view_filter"></tr>');
            this.filter_values = this.filter_values || {};

            var hasEmptyColumn = false;  // Untuk cek apakah ada kolom kosong

            $thead.find('th').each(function () {
                var $th = $(this);
                var fieldName = $th.data('name');
                var fieldType = self.state.fields[fieldName]?.type;

                if (!fieldName) {
                    // Jika tidak ada fieldName, gunakan kolom ini untuk tombol Apply & Clear
                    if (!hasEmptyColumn) {
                        hasEmptyColumn = true;

                        var $searchButton = $('<button>', {
                            class: 'btn btn-sm btn-primary o_list_filter_button',
                            text: 'Apply',
                        });

                        var $clearButton = $('<button>', {
                            class: 'btn btn-sm btn-danger o_list_filter_clear_button',
                            text: 'Clear',
                        });

                        var $buttonGroup = $('<div>', { class: 'btn-group' }).append($searchButton, $clearButton);
                        var $buttonContainer = $('<th></th>').append($buttonGroup).css({ "text-align": "center", "vertical-align": "middle" });
                        $filterRow.append($buttonContainer);

                        // Tambahkan event handler
                        $searchButton.on('click', function () {
                            var filters = {};
                            $filterRow.find('.o_list_filter_input').each(function () {
                                var field = $(this).data('field');
                                var value = $(this).val().trim();
                                if (value) {
                                    filters[field] = value;
                                }
                            });

                            console.log("📢 filter_data event triggered!", filters);
                            self.trigger_up('filter_data', { filters: filters });
                        });

                        $clearButton.on('click', function () {
                            console.log("🔄 reset_filters event triggered!");
                            self.trigger_up('reset_filters');
                        });

                        return;
                    } else {
                        $filterRow.append('<th></th>');
                        return;
                    }
                }

                if (fieldType === 'boolean' || fieldType === 'integer') {
                    $filterRow.append('<th></th>');
                    return;
                }

                var inputType = (fieldType === 'date' || fieldType === 'datetime') ? 'date' : 'text';
                var $input = $('<input>', {
                    type: inputType,
                    class: 'o_list_filter_input form-control',
                    placeholder: 'Filter...',
                    value: self.filter_values[fieldName] || '',
                    'data-field': fieldName
                });
                
                $input.on('keydown', function (e) {
                    if (e.key === "Enter") {
                        e.preventDefault();  // Hindari submit form jika ada
                        $('.o_list_filter_button').trigger('click');
                    }
                });

                var $filterTh = $('<th></th>').append($input);
                $filterRow.append($filterTh);
            });

            $thead.append($filterRow);

            // Halaman kosong jika tidak ada hasil
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
            var filters = event.data.filters || {};
            var domain = [];
        
            console.log("📩 ListController menerima event:", filters);
        
            Object.entries(filters).forEach(([field, value]) => {
                var fieldType = self.renderer.state.fields[field]?.type;
                domain.push(
                    fieldType === 'date' || fieldType === 'datetime' ?
                    [field, '=', value] :
                    [field, 'ilike', value]
                );
            });
        
            console.log("📌 Domain filter yang digunakan:", domain);
        
            self.renderer.filter_values = filters;
        
            this._rpc({
                model: this.modelName,
                method: 'search_count',
                args: [domain],
            }).then(function (count) {
                if (count === 0) {
                    self.renderer._updateNoResults(true);
                } else {
                    self.renderer._updateNoResults(false);
                    self.reload({ domain }).then(function () {
                        console.log("🔄 Data berhasil diperbarui!");
                    });
                }
            });
        },

        _onResetFilters: function () {
            var self = this;
            this.renderer.filter_values = {};
            this.renderer.$el.find('.o_list_filter_input').val('');

            console.log("🔄 Reset semua filter ke domain awal:", this.initialDomain);
            this.reload({ domain: this.initialDomain }).then(function () {
                self.renderer._updateNoResults(false);
            });
        }
    });
});
