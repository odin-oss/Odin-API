import client from 'prom-client';

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
