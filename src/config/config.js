import dotenv from 'dotenv';
import { z } from 'zod';

// ENVIRONMENT = local || dev || prod
const envFile = process.env.ENVIRONMENT
  ? `.env.${process.env.ENVIRONMENT}`
  : '.env.local';
dotenv.config({
  path: envFile,
});

const envSchema = z.object({
  // GENERAL APP CONFIGURATION
  APP_ADDRESS: z.string().default('localhost'),
  APP_PORT: z.string().transform(Number).default(3000),
  APP_ENVIRONMENT: z.string().default('local'),
  APP_MODE: z.string().default('debug'),
  APP_TOKEN_KEYPASS: z
    .string()
    .min(36)
    .max(36)
    .default('YOJUSTTRYINGSOMETHINGTOKNOWIFITWORKS'),
  APP_TOKEN_EXPIRATION_HOURS: z.string().transform(Number).default(24),
  APP_TZ: z.string().default('Europe/Paris'),
  USER_APPS_EXPIRATION_HOURS: z.string().transform(Number).default(6),
  TLS_ODIN_DASHBOARD: z.string().default('app.getodin.cloud'),
  TLS_ODIN_MONOLITH: z.string().default('api.app.getodin.cloud'),

  // ICON OF IMAGES
  MAX_CONTENT_SIZE: z.string().default('5mb'),

  // SWAGGER CONFIGURATION
  SWAGGER_URL: z.string().default('localhost:3000'),
  SWAGGER_METHOD: z.string().default('http'),

  // PSQL DATABASE CONFIGURATION
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default(5432),
  DB_USER: z.string().default('odin'),
  DB_PASSWORD: z.string().default('odin'),
  DB_DIALECT: z.string().default('postgres'),
  DB_NAME: z.string().default('odin'),

  // WINSTON LOGGER CONFIGURATION
  LOG_PATH: z.string().default('log'),
  LOG_LEVEL: z.string().default('info'),
  LOG_LEVEL_EXCEPTIONS: z.string().default('debug'),

  // REGISTRY
  REGISTRY_URL: z.string().default('registry.gitlab.com'),
  REGISTRY_USERNAME: z.string().default('odin'),
  REGISTRY_PASSWORD: z.string().default('odin'),

  // SMASH STORAGE
  STORAGE_CARRIER_SENDER_EMAIL: z
    .string()
    .default('noreply-odin@getodin.cloud'),
  STORAGE_CARRIER_SENDER_NAME: z.string().default('noreply Odin'),
  SMASH_STORAGE_CARRIER_IMAGE: z
    .string()
    .default(
      'registry.gitlab.com/caelus-team/application-cirrus/storage-carrier'
    ),
  SMASH_STORAGE_CARRIER_IMAGE_TAG: z.string().default('test-7'),
  SMASH_STORAGE_CARRIER_API_KEY: z.string().default('none'),
  SMASH_STORAGE_CARRIER_REGION: z.string().default('eu-west-3'),
  SMASH_STORAGE_CARRIER_TEAMID: z.string().default('none'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    '[SYSTEM][ERROR] Zod found an issue in your environment :',
    JSON.stringify(parsed.error.format(), null, 2)
  );
  process.exit(1);
}
const CONFIG = parsed.data;
export default CONFIG;
