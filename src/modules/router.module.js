/**
 * Package module
 *
 * Module servant de base aux différentes routes.
 */
import AUTH from '../routes/auth.route.js';
import BASE from '../routes/base.route.js';
import APPLICATION from '../routes/applications.route.js';
import APPLICATION_STORAGE from '../routes/application/storage.route.js';
import DATACENTER from '../routes/datacenter.route.js';
import ENVIRONMENT from '../routes/environment.route.js';
import CATEGORY from '../routes/category.route.js';
import USER from '../routes/user.route.js';
import SESSION from '../routes/sessions.route.js';
import { setup, serve } from 'swagger-ui-express';
import swaggerFile from '../../swagger.json' with { type: 'json' };
import logs from '../config/winston.config.js';

const options = {
  explorer: true,
  customJsStr: `
    let favicon = document.querySelector('link[rel="icon"][sizes="16x16"]');
    favicon.href = "https://crrs.cloud/favicon.ico";
    favicon = document.querySelector('link[rel="icon"][sizes="32x32"]');
    favicon.href = "https://crrs.cloud/favicon.ico";
    document.title = "Odin (by Caelus)";
    addEventListener("load", (event) => {
      document.querySelector('img[alt="Swagger UI"]').src="https://crrs.cloud/favicon.ico";
      document.querySelector('img[alt="Swagger UI"]').height="30";
      document.querySelector('a[rel="noopener noreferrer"]').appendChild(document.createElement('p')).textContent="Swagger officiel de Odin (by Caelus)";
    });

  `,
  customCss: `
  .swagger-ui .topbar { background-color: #45c481; height: 50px;}
  .swagger-ui .topbar a {color: white; flex: 1; max-width:100%;}
  .swagger-ui .topbar a > p {margin:0; padding-left: 2.5%; font-weight:300;}
  .swagger-ui .topbar .download-url-wrapper .download-url-button {background:#015931;}
  .swagger-ui .topbar .download-url-wrapper input[type=text] {border: 2px solid #015931;}
  .swagger-ui .opblock.opblock-get .opblock-summary {border-color: #98D2CB;}
  .swagger-ui .opblock.opblock-get {background: #98D2CB10;border-color: #98D2CB;}
  .swagger-ui .opblock.opblock-get .opblock-summary-method {background: #98D2CB;}

  .swagger-ui .opblock.opblock-delete .opblock-summary {border-color: #F27244;}
  .swagger-ui .opblock.opblock-delete {background: #F2724410;border-color: #F27244;}
  .swagger-ui .opblock.opblock-delete .opblock-summary-method {background: #F27244;}

  .swagger-ui .opblock.opblock-put .opblock-summary {border-color: #F2B47E;}
  .swagger-ui .opblock.opblock-put {background: #F2B47E10;border-color: #F2B47E;}
  .swagger-ui .opblock.opblock-put .opblock-summary-method {background: #F2B47E;}

  .swagger-ui .opblock.opblock-post .opblock-summary {border-color: #D9ADD2;}
  .swagger-ui .opblock.opblock-post {background: #D9ADD210;border-color: #D9ADD2;}
  .swagger-ui .opblock.opblock-post .opblock-summary-method {background: #D9ADD2;}

  ::-webkit-scrollbar {width: 7px;}
  ::-webkit-scrollbar-track {background: #00000000;}
  ::-webkit-scrollbar-thumb {background: #45c481;border-radius: 5px;}
  ::-webkit-scrollbar-thumb:hover {background: #00864b;}

  .swagger-ui .topbar .download-url-wrapper {max-width: 40%;}
  .swagger-ui .btn.authorize {border-color: #015931; color: #015931;}
  .swagger-ui .btn.authorize svg {fill: #015931;}
  @media screen and (max-width: 700px) {
    .swagger-ui .topbar .download-url-wrapper {display:none;}
  }
  .swagger-ui section.models  {display:none;}

  `,
};

export default (app) => {
  app.use('/application', APPLICATION);
  app.use('/application/storage', APPLICATION_STORAGE);
  app.use('/auth', AUTH);
  app.use('/category', CATEGORY);
  app.use('/datacenter', DATACENTER);
  app.use('/doc', serve, setup(swaggerFile, options));
  app.use('/environment', ENVIRONMENT);
  app.use('/session', SESSION);
  app.use('/user', USER);
  app.use('/', BASE);
  app.use('/*', function (req, res) {
    logs.error(`[404] : ${req.originalUrl} n'existe pas.`);
    return res.status(404).json({ result: "L'adresse demandée n'existe pas." });
  });
};
