import logs from '../config/winston.config.js';
import db from '../config/db.config.js';
import client from 'prom-client';

export const test_health = async () => {
  const promises = [db.sequelizeCirrus.sync(), db.sequelizeCaelus.sync()];
  return await Promise.all(promises)
    .then((r) => {
      const result = [];
      if (r[0].status === 'rejected')
        result.push({ ms: 'db.cirrus', state: false, reason: r[0].reason });
      else result.push({ ms: 'db.cirrus', state: true });
      if (r[1].status === 'rejected')
        result.push({ ms: 'db.caelus', state: false, reason: r[1].reason });
      else result.push({ ms: 'db.caelus', state: true });
      return result;
    })
    .catch((err) => {
      logs.error(`[${err.name}][${err.code}] on start : ${err.message}.`);
      process.exit(1);
    });
};

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

export const counter = new client.Counter({
  name: 'app_requests_total',
  help: 'Total number of requests',
});
export const counter_post = new client.Counter({
  name: 'app_post_requests_total',
  help: 'Total number of post requests',
});
export const counter_put = new client.Counter({
  name: 'app_put_requests_total',
  help: 'Total number of put requests',
});
export const counter_get = new client.Counter({
  name: 'app_get_requests_total',
  help: 'Total number of get requests',
});
export const counter_delete = new client.Counter({
  name: 'app_delete_requests_total',
  help: 'Total number of delete requests',
});
export const health_client = client;
