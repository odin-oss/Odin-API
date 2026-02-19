import APPLICATION from '../routes/applications.route.js';
import APPLICATION_STORAGE from '../routes/storage.route.js';
import ARGUMENT from '../routes/argument.route.js';
import AUTH from '../routes/auth.route.js';
import BASE from '../routes/base.route.js';
import CATEGORY from '../routes/category.route.js';
import DATACENTER from '../routes/datacenter.route.js';
import ENVIRONMENT from '../routes/environment.route.js';
import IMAGES from '../routes/images.route.js';
import IMAGETYPE from '../routes/imageType.route.js';
import SESSION from '../routes/sessions.route.js';
import USER from '../routes/user.route.js';
import { ApiResponse } from '../utils/response.util.js';
import { URLNotFound } from '../utils/errors.util.js';

export default (app) => {
  app.use('/application', APPLICATION);
  app.use('/application/storage', APPLICATION_STORAGE);
  app.use('/argument', ARGUMENT);
  app.use('/auth', AUTH);
  app.use('/category', CATEGORY);
  app.use('/datacenter', DATACENTER);
  app.use('/environment', ENVIRONMENT);
  app.use('/imageType', IMAGETYPE);
  app.use('/img', IMAGES);
  app.use('/session', SESSION);
  app.use('/user', USER);
  app.use('/', BASE);
  app.use('/*', (req, res) =>
    ApiResponse.error(req, res, new URLNotFound('URL not found.'))
  );
};
