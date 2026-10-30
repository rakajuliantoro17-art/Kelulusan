/*
==========================================================
Sarprasin 2.0
UI Manager
File : src/components/ui/ui-manager.js
Version : 2.0.0
==========================================================
*/

import * as Alerts from "./alerts/alert.js";
import * as Avatar from "./avatar/avatar.js";
import * as Badge from "./badges/badge.js";
import * as Button from "./buttons/button.js";
import * as Card from "./cards/card.js";
import * as Dropdown from "./dropdown/dropdown.js";
import * as Form from "./forms/form.js";
import * as Loader from "./loaders/loader.js";
import * as Tabs from "./tabs/tabs.js";
import * as Tooltip from "./tooltip/tooltip.js";

/* ======================================================
   UI MANAGER
====================================================== */

class UIManager {

    constructor() {

        this.initialized = false;

    }

    /* ==================================================
       INIT
    ================================================== */

    init(container = document) {

        if (this.initialized) return;

        try {

            Alerts.initAlert?.(container);

            Avatar.initAvatar?.(container);

            Badge.initBadge?.(container);

            Button.initButton?.(container);

            Card.initCard?.(container);

            Dropdown.initDropdown?.(container);

            Form.initForm?.(container);

            Loader.initLoader?.(container);

            Tabs.initTabs?.(container);

            Tooltip.initTooltip?.(container);

            this.initialized = true;

            document.dispatchEvent(

                new CustomEvent(

                    "ui:ready"

                )

            );

            console.info(

                "Sarprasin UI initialized."

            );

        }

        catch (error) {

            console.error(

                "UI initialization failed:",

                error

            );

        }

    }

    /* ==================================================
       RELOAD
    ================================================== */

    reload(container = document) {

        Tooltip.bindTriggers?.(container);

        Dropdown.initDropdown?.(container);

        Tabs.initTabs?.(container);

        Form.initForm?.(container);

    }

    /* ==================================================
       DESTROY
    ================================================== */

    destroy() {

        Tooltip.destroyTooltip?.();

        Tabs.destroyTabs?.();

        this.initialized = false;

    }

}

/* ======================================================
   SINGLETON
====================================================== */

const ui = new UIManager();

/* ======================================================
   AUTO INIT
====================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        ui.init();

    }

);

/* ======================================================
   RE-EXPORT COMPONENTS
====================================================== */

export {

    ui,

    Alerts,

    Avatar,

    Badge,

    Button,

    Card,

    Dropdown,

    Form,

    Loader,

    Tabs,

    Tooltip

};

export default ui;
