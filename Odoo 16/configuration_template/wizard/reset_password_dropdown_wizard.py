from odoo import fields, models, api, _
from odoo.exceptions import UserError, ValidationError


class ResetPasswordDropdownWizard(models.TransientModel):
    _name = 'reset.password.dropdown.wizard'
    _description = 'Drop Down Menu Change Password'

    user_id = fields.Many2one('res.users', default=lambda self: self.env.user)
    old_password = fields.Char(_('Old Password'), required=True)
    new_password = fields.Char(_('New Password'), required=True)
    verify_password = fields.Char(_('Verify Password'), required=True)

    def change_password_button(self):
        for line in self:
            user_id = self.env['res.users'].browse(line.user_id.id)
            if not line.new_password:
                raise ValidationError(_("Before clicking on 'Change Password', you have to write a new password."))
            if line.new_password != line.verify_password:
                raise ValidationError(_("Verify password doesn't match with new password! Please try again!"))
            if len(line.verify_password) < 12:
                raise ValidationError(_("Password must be at least 12 characters long!"))
            if not any(char.isdigit() for char in line.verify_password):
                raise ValidationError("Password must contain at least one digit!")
            if not any(char.isalpha() for char in line.verify_password):
                raise ValidationError("Password must contain at least one letter!")
            if not any(char.islower() or char.isupper() for char in line.verify_password):
                raise ValidationError("Password must contain at least one letter case!")
            if all(char.isalnum() for char in line.verify_password):
                raise ValidationError("Password must contain at least one symbol!")

            user_id.write({
                'password': line.verify_password
            })
        # don't keep temporary passwords in the database longer than necessary
        self.write({
            'new_password': '',
            'old_password': '',
            'verify_password': ''
        })
        # automatic logout after changing the password
        return {
            'type': 'ir.actions.client',
            'tag': 'logout',
        }


