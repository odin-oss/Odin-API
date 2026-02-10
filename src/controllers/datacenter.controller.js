import * as datacenter_service from '../services/datacenter.service.js';
import { counter_get, counter } from '../middlewares/prometheus.js';
import { ApiResponse } from '../utils/response.util.js';

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
  await fns
    .datacenter_list()
    .then((dcs) =>
      ApiResponse.success(
        req,
        res,
        dcs.map((dc) => dc.public_format()),
        200,
        'List of datacenters transmitted.'
      )
    )
    .catch((err) => ApiResponse.error(req, res, err));
};
