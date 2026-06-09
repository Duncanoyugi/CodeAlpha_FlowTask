import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

export const cleanupExpiredInvites = async () => {
  try {
    const result = await prisma.invite.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        acceptedAt: null,
      },
    });
    
    if (result.count > 0) {
      logger.info(`Cleaned up ${result.count} expired invites`);
    }
  } catch (error) {
    logger.error('Invite cleanup error:', error);
  }
};