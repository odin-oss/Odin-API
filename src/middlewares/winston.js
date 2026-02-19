import { createLogger, format, transports } from 'winston';
import { logger } from 'express-winston';
import winston from 'winston';
import moment from 'moment-timezone';
import CONFIG from '../config/config.js';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, printf } = format;
const logPath = CONFIG.LOG_PATH;
let colorBoolean = false;

const config = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
  colors: {
    debug: 'cyan',
    info: 'green',
    warn: 'yellow',
    error: 'red',
  },
};

if (CONFIG.APP_ENVIRONMENT === 'local') {
  colorBoolean = true;
  winston.addColors(config.colors);
}

const myFormat = printf((info) => {
  const stack = info.stack ? `\n${info.stack}` : '';
  const message =
    typeof info.message === 'object'
      ? JSON.stringify(info.message, null, 2)
      : info.message;
  return `${info.timestamp} [${info.level}]: ${message}${stack}`;
});
const appendTimestamp = format((info, opts) => {
  if (opts.tz) info.timestamp = moment().tz(opts.tz).format();
  return info;
});

const rotateTransportExceptions = new DailyRotateFile({
  dirname: logPath,
  level: CONFIG.LOG_LEVEL_EXCEPTIONS,
  filename: 'exceptions-pvc.log',
  frequency: '24h',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  handleExceptions: true,
  prettyPrint: true,
  json: true,
  colorize: colorBoolean,
  tailable: true,
});

const consoleTransport = new transports.Console({
  level: CONFIG.LOG_LEVEL,
  format: format.combine(
    format.colorize(),
    format.simple(),
    appendTimestamp({ tz: CONFIG.APP_TZ }),
    myFormat
  ),
  prettyPrint: true,
  handleExceptions: true,
});

const rotateTransportAll = new transports.DailyRotateFile({
  dirname: logPath,
  level: CONFIG.LOG_LEVEL,
  filename: 'log-pvc.log',
  frequency: '24h',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  handleExceptions: true,
  prettyPrint: true,
  json: true,
  tailable: true,
});

const logs = createLogger({
  levels: config.levels,
  format: combine(
    format.errors({ stack: true }),
    appendTimestamp({ tz: CONFIG.APP_TZ }),
    myFormat
  ),
  transports: [consoleTransport, rotateTransportAll],
  exceptionHandlers: [
    rotateTransportExceptions,
    consoleTransport,
    rotateTransportAll,
  ],
  exitOnError: false,
});

export const expressLogger = logger({
  meta: true,
  expressFormat: true,
  colorize: colorBoolean,
  format: winston.format.combine(winston.format.json()),
  winstonInstance: logs,
});
export default logs;
