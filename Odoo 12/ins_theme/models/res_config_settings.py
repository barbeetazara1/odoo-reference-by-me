import re
import uuid
import base64

from odoo import api, fields, models

XML_ID = "ins_theme._assets_primary_variables"
SCSS_URL = "/ins_theme/static/src/scss/colors.scss"

class ResConfigSettings(models.TransientModel):

    _inherit = 'res.config.settings'

    #----------------------------------------------------------
    # Database
    #----------------------------------------------------------
    
    theme_color_brand = fields.Char(
        string="Theme Brand Color")
    
    theme_color_primary = fields.Char(
        string="Theme Primary Color")
    
    theme_color_required = fields.Char(
        string="Theme Required Color")
    
    #----------------------------------------------------------
    # Functions
    #----------------------------------------------------------
    
    @api.multi 
    def set_values(self):
        res = super(ResConfigSettings, self).set_values()
        param = self.env['ir.config_parameter'].sudo()
        variables = [
            'o-brand-odoo',
            'o-brand-primary',
            'mk-required-color',
        ]
        colors = self.env['theme.utils'].get_values(
            SCSS_URL, XML_ID, variables
        )
        colors_changed = []
        colors_changed.append(self.theme_color_brand != colors['o-brand-odoo'])
        colors_changed.append(self.theme_color_primary != colors['o-brand-primary'])
        colors_changed.append(self.theme_color_required != colors['mk-required-color'])
        if(any(colors_changed)):
            variables = [
                {'name': 'o-brand-odoo', 'value': self.theme_color_brand or "#243742"},
                {'name': 'o-brand-primary', 'value': self.theme_color_primary or "#5D8DA8"},
                {'name': 'mk-required-color', 'value': self.theme_color_required or "#d1dfe6"},
            ]
            self.env['theme.utils'].replace_values(
                SCSS_URL, XML_ID, variables
            )
        return res

    @api.model
    def get_values(self):
        res = super(ResConfigSettings, self).get_values()
        params = self.env['ir.config_parameter'].sudo()
        variables = [
            'o-brand-odoo',
            'o-brand-primary',
            'mk-required-color',
        ]
        colors = self.env['theme.utils'].get_values(
            SCSS_URL, XML_ID, variables
        )
        res.update({
            'theme_color_brand': colors['o-brand-odoo'],
            'theme_color_primary': colors['o-brand-primary'],
            'theme_color_required': colors['mk-required-color'],
        })
        return res