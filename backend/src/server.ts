import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import logger from './lib/logger';
import { initializeSocket } from './config/socket';

const PORT = env.PORT;

const startServer = async () => {
  try {
    await connectDatabase();
    
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
      logger.info(`🔌 WebSocket server ready on /socket.io`);
    });
    
    // Initialize Socket.IO
    initializeSocket(server);
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();