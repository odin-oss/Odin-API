import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import pkg from './package.json' with { type: 'json' };
import CONFIG from './src/config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateSwagger = function () {
  const optionsJSdoc = {
    swaggerDefinition: {
      swagger: '2.0',
      info: {
        title: pkg.name,
        version: pkg.version,
        description: pkg.description,
      },
      host: `${CONFIG.swagger_url}`, // Host (optional)
      basePath: '/', // Base path (optional)
      schemes: [CONFIG.swagger_method],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          scheme: 'bearer',
          name: 'Authorization',
          in: 'header',
          description: `Don't forget to add 'Bearer ' for example : Bearer xxxx.`,
        },
      },
    },
    apis: ['./src/config/db.config.js', './src/routes/**/*.route.js'],
  };

  const specs = swaggerJSDoc(optionsJSdoc);

  const outputPath = path.resolve(__dirname, 'swagger.json');
  // Write the JSON file
  fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2), 'utf-8');
};
const swagger = {
  generateSwagger: generateSwagger,
};

export default swagger;
