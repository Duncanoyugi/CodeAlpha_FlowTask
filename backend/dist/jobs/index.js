"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const due_date_job_1 = require("./due-date.job");
const invite_cleanup_job_1 = require("./invite-cleanup.job");
const logger_1 = __importDefault(require("../lib/logger"));
// Run every hour
node_cron_1.default.schedule('0 * * * *', async () => {
    logger_1.default.info('Running due date check job...');
    await (0, due_date_job_1.checkDueDates)();
});
// Run daily at midnight
node_cron_1.default.schedule('0 0 * * *', async () => {
    logger_1.default.info('Running invite cleanup job...');
    await (0, invite_cleanup_job_1.cleanupExpiredInvites)();
});
logger_1.default.info('Cron jobs scheduled');
