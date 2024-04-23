/** @odoo-module **/
import { registry } from "@web/core/registry";
import { preferencesItem } from "@web/webclient/user_menu/user_menu_items";
import { routeToUrl } from "@web/core/browser/router_service";
import { browser } from "@web/core/browser/browser";
const usersMenuRegistry = registry.category("user_menuitems");
function resetPassword(env) {
        return {
            type: "item",
            id: "resetPassword",
            description: env._t("Reset Password"),

            callback: () => {
            env.services.action.doAction({
                type: 'ir.actions.act_window',
                name: env._t('Reset Password'),
                res_model: 'reset.password.dropdown.wizard',
                views: [[false, 'form']],
                target: 'new',
                });
            },
            sequence: 60,
    };
}
registry.category("user_menuitems").add("resetPassword", resetPassword)