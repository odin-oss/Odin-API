import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs/promises';
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
  APP_ADRESS: z.string().default('localhost'),
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

  // KAFKA CLUSTER
  KAFKA_BROKER: z.string().default('broker:29092'),
  KAFKA_ACTIVATED: z
    .preprocess((val) => String(val).toLocaleLowerCase(), z.string())
    .transform((val) => val === 'true')
    .default(true),
  KAFKA_TOPIC: z.string().default('upload-logs'),

  // KONG - APPS INGRESS
  APPS_INGRESS_ACTIVATED: z
    .preprocess((val) => String(val).toLocaleLowerCase(), z.string())
    .transform((val) => val === 'true')
    .default(true),
  APPS_INGRESS_URL: z.string().default('localhost:8001'),

  // KUBERNETES API
  KUBERNETES_VOLUME_TYPE: z.string().default('Block'),
  KUBERNETES_STORAGE_CLASSNAME: z.string().default('sbs-default'),
  KUBERNETES_ACTIVATED: z
    .preprocess((val) => String(val).toLocaleLowerCase(), z.string())
    .transform((val) => val === 'true')
    .default(true),
  KUBERNETES_URL: z.string().default('http://127.0.0.1:8080'),
  KUBERNETES_TOKEN: z.string().default(''),
  KUBERNETES_MASTER_IP: z.string(),
  KUBERNETES_TOKEN_PATH: z
    .string()
    .default('/var/run/secrets/kubernetes.io/serviceaccount/token'),
  KUBERNETES_CA_CERT_PATH: z
    .string()
    .default('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'),
  KUBERNETES_AGENT: z.any().default(undefined),
  KUBERNETES_ISTIO_ACTIVATED: z
    .preprocess((val) => String(val).toLocaleLowerCase(), z.string())
    .transform((val) => val === 'true')
    .default(true),

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

if (
  !['test'].includes(CONFIG.APP_ENVIRONMENT) &&
  process.env.KUBERNETES_CA_CERT_PATH
) {
  const token =
    (process.env.KUBERNETES_TOKEN_PATH &&
      (await fs.readFile(CONFIG.KUBERNETES_TOKEN_PATH, 'utf-8'))) ||
    CONFIG.KUBERNETES_TOKEN;
  CONFIG.KUBERNETES_TOKEN = token;
  const ca = await fs.readFile(CONFIG.KUBERNETES_CA_CERT_PATH, 'utf-8');
  CONFIG.KUBERNETES_AGENT = new https.Agent({ ca });
}

export default CONFIG;
