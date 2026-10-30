/*
==========================================================
Sarprasin 2.0
Automation Module
File : src/services/automation/index.js
Version : 2.0.0
==========================================================

Automation Layer

==========================================================
*/

import workflowService from "./workflow.service.js";
import webhookService from "./webhook.service.js";
import triggerService from "./trigger.service.js";
import schedulerService from "./scheduler.service.js";
import notificationService from "./notification.service.js";

/* ======================================================
   SERVICES
====================================================== */

export {

    workflowService,

    webhookService,

    triggerService,

    schedulerService,

    notificationService

};

/* ======================================================
   DEFAULT
====================================================== */

export default {

    workflowService,

    webhookService,

    triggerService,

    schedulerService,

    notificationService

};
