import swagger from './swagger.js';
import init from './src/config/db-init.config.js';

/* Génération des models cirrus et caelus */
init().then((r) => {});
/* Génération de la configuration swagger */
swagger.generateSwagger();
