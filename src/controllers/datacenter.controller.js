import logs from '../middlewares/winston.js';
import * as datacenter_service from '../services/datacenter.service.js';
import { counter_get, counter } from '../middlewares/prometheus.js';

/**
 * Controller that checks requets content before fetching all the datacenters in db.
 * @param {*} req
 * @param {*} res
 * @param {*} fns functions for test
 * @returns
 */
export const list = async (
  req,
  res,
  fns = {
    datacenter_list: datacenter_service.list,
  }
) => {
  // Prometheus
  counter_get.inc();
  counter.inc();

  //Request
  return await Promise.resolve(fns.datacenter_list())
    .then((dcs) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : List of datacenters transmitted.`
      );
      return res
        .status(200)
        .json({ result: dcs.map((dc) => dc.public_format()) });
    })
    .catch((err) => {
      logs.error(
        `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}`
      );
      return res.status(err.code).json({
        result: {
          error: err.name,
          message: err.message,
        },
      });
    });
};
