# -*- coding: utf-8 -*-
# from odoo import http


# class ConfigurationPasswordTemplate(http.Controller):
#     @http.route('/configuration_template/configuration_template', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/configuration_template/configuration_template/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('configuration_template.listing', {
#             'root': '/configuration_template/configuration_template',
#             'objects': http.request.env['configuration_template.configuration_template'].search([]),
#         })

#     @http.route('/configuration_template/configuration_template/objects/<model("configuration_template.configuration_template"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('configuration_template.object', {
#             'object': obj
#         })
