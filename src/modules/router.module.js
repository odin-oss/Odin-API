/**
 * Package module
 *
 * Module servant de base aux différentes routes.
 */
import AUTH from '../routes/auth.route.js';
import BASE from '../routes/base.route.js';
import APPLICATION from '../routes/applications.route.js';
import APPLICATION_STORAGE from '../routes/storage.route.js';
import DATACENTER from '../routes/datacenter.route.js';
import ENVIRONMENT from '../routes/environment.route.js';
import CATEGORY from '../routes/category.route.js';
import IMAGES from '../routes/images.route.js';
import USER from '../routes/user.route.js';
import SESSION from '../routes/sessions.route.js';
import logs from '../middlewares/winston.js';

export default (app) => {
  app.use('/application', APPLICATION);
  app.use('/application/storage', APPLICATION_STORAGE);
  app.use('/auth', AUTH);
  app.use('/category', CATEGORY);
  app.use('/datacenter', DATACENTER);
  app.use('/environment', ENVIRONMENT);
  app.use('/img', IMAGES);
  app.use('/session', SESSION);
  app.use('/user', USER);
  app.use('/', BASE);
  app.use('/*', function (req, res) {
    logs.error(`[404] : ${req.originalUrl} not found.`);
    return res.status(404).json({ result: 'URL not found.' });
  });
};
