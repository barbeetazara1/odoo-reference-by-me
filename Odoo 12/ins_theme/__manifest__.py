# -*- coding: utf-8 -*-
{
    'name': "Theme Custom",

    'summary': """
        Theme Custom by BSR
    """,

    'description': """
        Theme Custom by BSR
    """,

    'author': "PT BSR Indonesia",
    'website': "https://www.bsrindonesia.com/",

    'category': 'Theme',
    'version': '1.0',

    'depends': [
        'base_setup',
        'web_editor',
    ],

    'data': [
        'views/res_config_settings_views.xml',
        'views/templates.xml',
    ],
    "qweb": [
        "static/src/xml/*.xml",
    ],
    'installable': True,
    'application': False,
}
