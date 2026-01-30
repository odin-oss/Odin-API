import logs from '../../config/winston.config.js';
import moment from 'moment-timezone';
import * as storage_service from '../../services/application/storage.service.js';
import * as token from '../../utils/token.service.js';
import * as parametres from '../../utils/parametres.service.js';
import {
  counter_delete,
  counter_get,
  counter,
  counter_put,
} from '../../utils/health.service.js';
import CONFIG from '../../config/config.js';
import { MissingArgumentError } from '../../utils/errors.service.js';

/**
 * Controller that checks parameters and create the export.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const exportStorage = async (
  req,
  res,
  fns = {
    storage_export: storage_service.exportStorage,
  }
) => {
  // Prometheus
  counter_delete.inc();
  counter.inc();

  //Request
  try {
    parametres.check_query(req, ['id_application']);
    parametres.check_body(req, ['export_platform']);
    const id_user = token.getUserId({ token: req.headers['authorization'] });
    return await Promise.resolve(
      fns.storage_export({
        id_user,
        id_application: req.query.id_application,
        export_platform: req.body.export_platform,
        delete_existing_export: (() => {
          if (typeof req.body.delete_existing_export === 'string') {
            const lowerValue = req.body.delete_existing_export.toLowerCase();
            if (lowerValue === 'true') return true;
            if (lowerValue === 'false') return false;
          }
          return req.body.delete_existing_export;
        })(),
      })
    ).then((application_export) => {
      logs.info(`[${req.method}][200] ${req.originalUrl} : Export launched.`);
      return res.status(200).json({
        result: application_export.public_format(),
      });
    });
  } catch (err) {
    logs.error(
      `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}`
    );
    return res.status(err.code).json({
      result: {
        error: err.name,
        message: err.message,
      },
    });
  }
};

/**
 * Controller that checks parameters and deletes the export.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const deleteStorage = async (
  req,
  res,
  fns = {
    storage_delete: storage_service.deleteStorage,
  }
) => {
  // Prometheus
  counter_delete.inc();
  counter.inc();

  //Request
  try {
    parametres.check_query(req, ['id_application']);
    parametres.check_body(req, ['id_export', 'export_platform']);
    const id_user = token.getUserId({ token: req.headers['authorization'] });
    return await Promise.resolve(
      fns.storage_delete({
        id_user,
        id_application: req.query.id_application,
        id_export: req.body.id_export,
        export_platform: req.body.export_platform,
      })
    ).then((export_deletion) => {
      logs.info(`[${req.method}][200] ${req.originalUrl} : Storage deleted.`);
      return res.status(200).json({
        result: export_deletion, //.public_format(),
      });
    });
  } catch (err) {
    logs.error(
      `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}`
    );
    return res.status(err.code).json({
      result: {
        error: err.name,
        message: err.message,
      },
    });
  }
};

export const getStorage = async (
  req,
  res,
  fns = {
    storage_get: storage_service.getStorage,
  }
) => {
  // Prometheus
  counter_get.inc();
  counter.inc();

  //Request
  try {
    if (!Object.keys(req.query).includes('id_application'))
      throw new MissingArgumentError(
        'The query parameter id_application is missing.'
      );

    return await Promise.resolve(
      fns.storage_get({
        id_application: req.query.id_application,
      })
    ).then((storage_information) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : Storage informations.`
      );
      return res.status(200).json({
        result: storage_information.public_format(),
      });
    });
  } catch (err) {
    logs.error(
      `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}`
    );
    return res.status(err.code).json({
      result: {
        error: err.name,
        message: err.message,
      },
    });
  }
};
