import moment from 'moment-timezone';
import logs from '../middlewares/winston.js';
import CONFIG from '../config/config.js';

export class ApiResponse {
  /**
   * @param {boolean} success - Quick check for the frontend
   * @param {any} data - The actual payload (User, Token, History, etc.)
   * @param {object|null} error - Error details if success is false
   * @param {moment} timestamp - Timestamp for when the response was created
   */
  constructor(success, data = null, error = null, message = null) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = moment.tz(CONFIG.APP_TZ);
  }

  /**
   * Static helper for 2xx responses
   */
  static success(req, res, data, status = 200, message = 'Request successful') {
    logs.info(`[${req.method}][200] ${req.originalUrl} : ${message}`);
    res.status(status).json(new ApiResponse(true, data, null, message));
  }

  /**
   * Static helper for 4xx/5xx responses
   */
  static error(req, res, err) {
    const status = Number.isInteger(err.code) ? err.code : 500;
    const errorBody = {
      type: err.name || 'InternalError',
      message: err.message || 'An unexpected error occurred',
    };
    logs.error(
      `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}`
    );
    res
      .status(status)
      .json(new ApiResponse(false, null, errorBody, err.message));
  }
}
