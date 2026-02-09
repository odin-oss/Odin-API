import {
  BadTypeArgumentError,
  MissingArgumentError,
  ParameterMisformed
} from './errors.util.js';
import logs from '../middlewares/winston.js';

export default class Guard {
  /**
   * Validate the properties of an object with a zod schema and throw an error if the validation fails.
   * @param {ZodSchema} schema 
   * @param {Object} props 
   * @returns 
   */
  static validateProps = function (schema, props) {
    const result = schema.safeParse(props);
    if (!result.success) {
      const isMissing = result.error.issues.some(
        (i) => i.code === 'invalid_type'
      );
      if (isMissing)
        throw new MissingArgumentError(
          `Missing arguments: ${result.error.issues.map((i) => i.path).join(', ')}`
        );
      throw new ParameterMisformed(result.error.errors[0].message);
    }
    return result.data;
  };


  /**
   * Check what arguments you have into the request's query & get list of missing ones.
   * @param {HttpRequest} req
   * @param {Array<string>} expectedKeys
   * @returns
   */
  static check_query = function (req, expectedKeys) {
    if (
      !Array.isArray(expectedKeys) ||
      !expectedKeys.every((item) => typeof item === 'string')
    )
      throw new BadTypeArgumentError(
        'The argument expectedKeys must be an array of string.'
      );
    try {
      const keys = Object.keys(req.query);
      const missing_keys = [];
      expectedKeys.forEach((key) => {
        if (!keys.includes(key)) {
          missing_keys.push(key);
        }
      });
      if (missing_keys.length !== 0) {
        logs.error(
          `[MissingArgumentError][${req.method}][400] ${req.originalUrl} : The query parameter (${missing_keys.join(',')}) is missing.`
        );
        throw new MissingArgumentError(
          'The query parameter (' + missing_keys.join(',') + ') is missing.'
        );
      }
      return true;
    } catch (err) {
      if (err instanceof MissingArgumentError) throw err;
      throw new BadTypeArgumentError(
        'The argument req must be a conventional request from http of string.'
      );
    }
  };

  /**
   * Check what arguments you have into the request's body & get list of missing ones.
   * @param {HttpRequest} req
   * @param {Array<string>} expectedKeys
   * @returns
   */
  static check_body = function (req, expectedKeys) {
    if (
      !Array.isArray(expectedKeys) ||
      !expectedKeys.every((item) => typeof item === 'string')
    )
      throw new BadTypeArgumentError(
        'The argument expectedKeys must be an array of string.'
      );
    try {
      const keys = Object.keys(req.body);
      const missing_keys = [];
      expectedKeys.forEach((key) => {
        if (!keys.includes(key)) {
          missing_keys.push(key);
        }
      });
      if (missing_keys.length !== 0) {
        logs.error(
          `[MissingArgumentError][${req.method}][400] ${req.originalUrl} : The body parameter (${missing_keys.join(',')}) is missing.`
        );
        throw new MissingArgumentError(
          'The body parameter (' + missing_keys.join(',') + ') is missing.'
        );
      }
      return true;
    } catch (err) {
      if (err instanceof MissingArgumentError) throw err;
      throw new BadTypeArgumentError(
        'The argument req must be a conventional request from http of string.'
      );
    }
  };

  /**
   * Check what arguments you have into the request's params & get list of missing ones.
   * @param {HttpRequest} req
   * @param {Array<string>} expectedKeys
   * @returns
   */
  static check_params = function (req, expectedKeys) {
    if (
      !Array.isArray(expectedKeys) ||
      !expectedKeys.every((item) => typeof item === 'string')
    )
      throw new BadTypeArgumentError(
        'The argument expectedKeys must be an array of string.'
      );
    try {
      const keys = Object.keys(req.params);
      const missing_keys = [];
      expectedKeys.forEach((key) => {
        if (!keys.includes(key)) {
          missing_keys.push(key);
        }
      });
      if (missing_keys.length !== 0) {
        logs.error(
          `[MissingArgumentError][${req.method}][400] ${req.originalUrl} : The params parameter (${missing_keys.join(',')}) is missing.`
        );
        throw new MissingArgumentError(
          'The params parameter (' + missing_keys.join(',') + ') is missing.'
        );
      }
      return true;
    } catch (err) {
      if (err instanceof MissingArgumentError) throw err;
      throw new BadTypeArgumentError(
        'The argument req must be a conventional request from http of string.'
      );
    }
  };
}
