/*
==========================================================
Sarprasin 2.0
Scheduler Service
File : src/services/automation/scheduler.service.js
Version : 2.0.0
==========================================================

Automation Scheduler Manager

Scheduler dijalankan oleh n8n Cloud.
Service ini hanya mengelola konfigurasi,
sinkronisasi, dan eksekusi manual.

==========================================================
*/

import workflowService from "./workflow.service.js";

class SchedulerService {

    constructor() {

        this.jobs = new Map();

    }

    /* ==================================================
       REGISTER
    ================================================== */

    register(job) {

        if (!job?.name) {

            throw new Error(

                "Job harus memiliki nama."

            );

        }

        this.jobs.set(

            job.name,

            {

                enabled: true,

                ...job

            }

        );

    }

    /* ==================================================
       REMOVE
    ================================================== */

    remove(name) {

        this.jobs.delete(name);

    }

    /* ==================================================
       ENABLE
    ================================================== */

    enable(name) {

        const job =

            this.jobs.get(name);

        if (job) {

            job.enabled = true;

        }

    }

    /* ==================================================
       DISABLE
    ================================================== */

    disable(name) {

        const job =

            this.jobs.get(name);

        if (job) {

            job.enabled = false;

        }

    }

    /* ==================================================
       GET
    ================================================== */

    get(name) {

        return this.jobs.get(name);

    }

    /* ==================================================
       GET ALL
    ================================================== */

    list() {

        return

        Array.from(

            this.jobs.values()

        );

    }

    /* ==================================================
       RUN MANUAL
    ================================================== */

    async run(

        name,

        payload = {}

    ) {

        const job =

            this.jobs.get(name);

        if (!job) {

            return {

                success: false,

                message:

                    "Job tidak ditemukan."

            };

        }

        if (!job.enabled) {

            return {

                success: false,

                message:

                    "Job dinonaktifkan."

            };

        }

        return workflowService.custom(

            job.workflow,

            payload

        );

    }

    /* ==================================================
       DEFAULT JOBS
    ================================================== */

    registerDefaults() {

        this.register({

            name:

                "backup",

            workflow:

                "backup",

            schedule:

                "0 23 * * *"

        });

        this.register({

            name:

                "daily-report",

            workflow:

                "daily-report",

            schedule:

                "0 18 * * *"

        });

        this.register({

            name:

                "weekly-report",

            workflow:

                "weekly-report",

            schedule:

                "0 7 * * MON"

        });

        this.register({

            name:

                "monthly-report",

            workflow:

                "monthly-report",

            schedule:

                "0 8 1 * *"

        });

        this.register({

            name:

                "maintenance",

            workflow:

                "maintenance"

        });

    }

}

const schedulerService =

    new SchedulerService();

schedulerService.registerDefaults();

export default schedulerService;

export {

    SchedulerService

};
