import app from './app.js';
import { shutdown } from './modules/kafka.module.js';

const server = app.listen(app.get('config').APP_PORT, () => {
  app.locals.logger.info(
    `[SYSTEM][200] / : 5/5. ODIN launched. Waiting for the first request on port ${app.get('config').APP_PORT} ...`
  );
});

process.on('SIGTERM', () => {
  app.locals.logger.info('[SYSTEM][200] SIGTERM : clean shutdown...');
  server.close(() => {
    shutdown();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  app.locals.logger.info('[SYSTEM][200] SIGINT : clean shutdown...');
  server.close(() => {
    shutdown();
    process.exit(0);
  });
});

export default server;
