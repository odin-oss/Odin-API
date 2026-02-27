import moment from 'moment-timezone';
import logs from '../middlewares/winston.js';
import CONFIG from '../config/config.js';
import z from 'zod';
import Guard from './guard.util.js';

export class ApiResponse {
  /**
   * @param {boolean} success - Quick check for the frontend
   * @param {any} data - The actual payload (User, Token, History, etc.)
   * @param {object|null} error - Error details if success is false
   * @param {moment} timestamp - Timestamp for when the response was created
   */
  constructor(success, data = null, error = null, message = null) {
    const validated = Guard.validateProps(ApiResponse.schema, {
      success,
      data,
      error,
      message,
    });
    this.success = validated.success;
    this.message = validated.message;
    this.data = validated.data;
    this.error = validated.error;
    this.timestamp = moment.tz(CONFIG.APP_TZ).utc().format();
  }

  // Zod Schema for object validation
  static schema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.any().nullable().optional(),
    error: z.any().nullable().optional(),
  });

  /**
   * Static helper for 2xx responses
   */
  static success(req, res, data, status = 200, message = 'Request successful') {
    logs.info(`[${req.method}][${status}] ${req.originalUrl} : ${message}`);
    res.status(status).json(new ApiResponse(true, data, null, message));
  }

  /**
   * Static helper for 4xx/5xx responses
   */
  static error(req, res, err) {
    const status = Number.isInteger(err.code) ? err.code : 500;
    const errorMessage = err.message || 'An unexpected error occurred';
    const errorBody = {
      type: err.name || 'InternalError',
      message: errorMessage,
    };
    logs.error(
      `[${req.method}][${status}][${err.name || 'Error'}] ${req.originalUrl} : ${errorMessage}`
    );
    res
      .status(status)
      .json(new ApiResponse(false, null, errorBody, errorMessage));
  }
}
