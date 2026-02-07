import app from './app.js';

const server = app.listen(app.get('config').port, () => {
  app.locals.logger.info(
    `[SYSTEM][200] / : 1/5. ODIN launched. Waiting for the first request on port ${app.get('config').port} ...`
  );
});

process.on('SIGTERM', () => {
  app.locals.logger.info('[SYSTEM][200] SIGTERM : clean shutdown...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  app.locals.logger.info('[SYSTEM][200] SIGINT : clean shutdown...');
  server.close(() => {
    process.exit(0);
  });
});

export default server;
