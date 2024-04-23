# # -*- coding: utf-8 -*-
#
# from odoo import models, fields, api, _
#
#
# class configuration_template(models.Model):
#     _name = 'configuration_template.configuration_template'
#     _description = 'configuration_template.configuration_template'
#
#     name = fields.Char()
#     value = fields.Integer()
#     value2 = fields.Float(compute="_value_pc", store=True)
#     description = fields.Text()
#
#     @api.depends('value')
#     def _value_pc(self):
#         for record in self:
#             record.value2 = float(record.value) / 100
