import cron from 'node-cron';
import { checkDueDates } from './due-date.job';
import { cleanupExpiredInvites } from './invite-cleanup.job';
import logger from '../lib/logger';

// Run every hour
cron.schedule('0 * * * *', async () => {
  logger.info('Running due date check job...');
  await checkDueDates();
});

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  logger.info('Running invite cleanup job...');
  await cleanupExpiredInvites();
});

logger.info('Cron jobs scheduled');