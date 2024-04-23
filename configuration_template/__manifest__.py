# -*- coding: utf-8 -*-


{
    'name': "Configuration Template",

    'summary': """
        Configuration Template v.16""",

    'description': """
        Configuration Template v.16
    """,

    'author': "Baron",
    'website': "",
    'category': 'Configuration',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base', 'web', 'base_setup'],

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        'wizard/views/reset_password_dropdown_wizard.xml',
    ],
    'assets': {
        'web.assets_backend': [
            '/configuration_template/static/src/js/reset_password.js',
        ],
    },

    # Module icon
    "images": ["static/description/icon.png"],
}
