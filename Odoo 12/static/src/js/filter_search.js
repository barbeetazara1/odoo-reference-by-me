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
            var $filterRow = $('<tr class="o_list_view_filter"></tr>');

            this.filter_values = this.filter_values || {};

            $thead.find('th').each(function () {
                var $th = $(this);
                var fieldName = $th.data('name');
                var fieldType = self.state.fields[fieldName]?.type;

                if (fieldName) {
                    var inputType = (fieldType === 'date' || fieldType === 'datetime') ? 'date' : 'text';
                    var $input = $('<input>', {
                        type: inputType,
                        class: 'o_list_filter_input',
                        placeholder: 'Filter...',
                        value: self.filter_values[fieldName] || ''
                    });

                    var $filterTh = $('<th></th>').append($input);
                    $filterRow.append($filterTh);

                    $input.on('change keyup', function () {
                        var searchText = $(this).val().trim();
                        self.filter_values[fieldName] = searchText;
                        self.trigger_up('filter_data', { fieldName: fieldName, searchText: searchText, fieldType: fieldType });
                    });
                } else {
                    $filterRow.append('<th></th>');
                }
            });

            $thead.append($filterRow);

            // Elemen untuk halaman "No Results Found"
            this.$noResultsPage = $(
                '<div class="o_list_no_results_page" style="display: none; text-align: center; padding: 50px;">' +
                '<h3>🚀 Oops! No Results Found</h3>' +
                '<p>Try adjusting your filter criteria or searching with different keywords.</p>' +
                '<button class="btn btn-primary reset-filters">Reset Filters</button>' +
                '</div>'
            );

            this.$el.append(this.$noResultsPage);

            this.$noResultsPage.find('.reset-filters').on('click', function () {
                self._resetFilters();
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
        },

        _resetFilters: function () {
            var self = this;
            this.filter_values = {};
            this.$el.find('.o_list_filter_input').val('');
            this.trigger_up('filter_data', { fieldName: null, searchText: null });
        }
    });

    ListController.include({
        custom_events: _.extend({}, ListController.prototype.custom_events, {
            filter_data: '_onFilterData',
        }),

        _onFilterData: function (event) {
            var self = this;
            var fieldName = event.data.fieldName;
            var searchText = event.data.searchText;
            var fieldType = event.data.fieldType;

            this.renderer.filter_values = this.renderer.filter_values || {};

            if (searchText) {
                this.renderer.filter_values[fieldName] = searchText;
            } else if (fieldName === null) {
                this.renderer.filter_values = {}; // Reset semua filter
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
                    self.reload({ domain: domain });
                }
            });
        }
    });
});
