import dotenv from 'dotenv';

// ENVIRONMENT = local || dev || prod
const envFile = process.env.ENVIRONMENT
  ? `.env.${process.env.ENVIRONMENT}`
  : '.env.local';
dotenv.config({
  path: envFile,
});

// Function to validate mandatory environment variables
function validateMandatoryEnvVariables() {
  const mandatoryVariables = [
    'APP_PORT',
    'DB_DIALECT',
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_CIRRUS_NAME',
    'DB_CAELUS_NAME',
    'JWT_KEYPASS',
    'SMASH_STORAGE_CARRIER_IMAGE',
    'SMASH_STORAGE_CARRIER_IMAGE_TAG',
    'SMASH_STORAGE_CARRIER_API_KEY',
    'SMASH_STORAGE_CARRIER_REGION',
    'SMASH_STORAGE_CARRIER_TEAMID',
  ];

  const missingVariables = mandatoryVariables.filter(
    (varName) => !process.env[varName]
  );

  if (missingVariables.length > 0) {
    console.error(
      '[SYSTEM][500] / : Missing mandatory environment variables: ' +
        missingVariables.join(', ')
    );
    process.exit(1);
  }
}

// Validate mandatory environment variables
validateMandatoryEnvVariables();

const CONFIG = {}; // Make this global to use all over the application
CONFIG.env = process.env.ENVIRONMENT;
CONFIG.app = process.env.APP_ADRESS;
CONFIG.port = process.env.APP_PORT;

CONFIG.swagger_url = process.env.SWAGGER_URL;
CONFIG.swagger_method = process.env.SWAGGER_METHOD;

CONFIG.log_path = 'log';
CONFIG.log_level = 'info';
CONFIG.log_level_exceptions = 'debug';

// set environment docker-compose
CONFIG.db_dialect = process.env.DB_DIALECT;
CONFIG.db_host = process.env.DB_HOST;
CONFIG.db_port = process.env.DB_PORT;
CONFIG.db_user = process.env.DB_USER;
CONFIG.db_password = process.env.DB_PASSWORD;
CONFIG.db_cirrus_name = process.env.DB_CIRRUS_NAME;
CONFIG.db_caelus_name = process.env.DB_CAELUS_NAME;

CONFIG.ms_deployment_activated =
  process.env.MS_DEPLOYMENT_ACTIVATED.toLocaleLowerCase() === 'true';
CONFIG.mtls_ms_deployment_port = process.env.MTLS_MS_DEPLOYMENT_PORT;
CONFIG.unsafe_ms_deployment_adress = process.env.UNSAFE_MS_DEPLOYMENT_ADRESS;
CONFIG.unsafe_ms_deployment_method = process.env.UNSAFE_MS_DEPLOYMENT_METHOD;
CONFIG.unsafe_ms_deployment_port = process.env.UNSAFE_MS_DEPLOYMENT_PORT;
CONFIG.ms_deployment_base_url = process.env.MS_DEPLOYMENT_BASE_URL;

// authentifications process
//CONFIG.oidc_enabled = process.env.OIDC_ENABLED;
CONFIG.oidc_enabled = false;
CONFIG.credentials_enabled = process.env.CREDENTIALS_ENABLED;
CONFIG.oidc_discovery_link = process.env.OIDC_DISCOVERY_LINK;
CONFIG.oidc_client_id = process.env.OIDC_CLIENT_ID;
CONFIG.oidc_client_secret = process.env.OIDC_CLIENT_SECRET;
CONFIG.oidc_redirect_uris = process.env.OIDC_REDIRECT_URIS;
CONFIG.oidc_redirect_logout_uris = process.env.OIDC_REDIRECT_LOGOUT_URIS;
CONFIG.public_url = process.env.PUBLIC_URL;
CONFIG.front_end_url = process.env.FRONT_END_URL;

CONFIG.ms_apps_url = process.env.APPS_CRRS_URL ?? 'launch.getodin.fake';

// Timezone
CONFIG.timezone = process.env.TZ;

// JWT TOKEN
CONFIG.jwt_token = process.env.JWT_KEYPASS;
CONFIG.duration_token = process.env.DURATION_TOKEN ?? '1d';

// EXPIRATION TIME FOR USERS APPS
CONFIG.expiration = 60 * 60 * process.env.EXPIRATION_HOURS; // 12h in seconds

// Global storage Configuration
CONFIG.storage_carrier_sender_email =
  process.env.STORAGE_CARRIER_SENDER_EMAIL ?? 'noreply-odin@getcaelus.cloud';
CONFIG.storage_carrier_sender_name =
  process.env.STORAGE_CARRIER_SENDER_NAME ?? 'noreply Odin by Caelus';

// Smash Storage Configuration
CONFIG.smash_storage_carrier_image = process.env.SMASH_STORAGE_CARRIER_IMAGE;
CONFIG.smash_storage_carrier_image_tag =
  process.env.SMASH_STORAGE_CARRIER_IMAGE_TAG;
CONFIG.smash_storage_carrier_api_key =
  process.env.SMASH_STORAGE_CARRIER_API_KEY;
CONFIG.smash_storage_carrier_region = process.env.SMASH_STORAGE_CARRIER_REGION;
CONFIG.smash_storage_carrier_teamid = process.env.SMASH_STORAGE_CARRIER_TEAMID;

export default CONFIG;
