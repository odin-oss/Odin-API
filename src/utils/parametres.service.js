import CONFIG from '../config/config.js';
import logs from '../config/winston.config.js';
import {
  BadTypeArgumentError,
  MissingArgumentError,
  PasswordIsTooShort,
  PasswordMissingNumber,
  PasswordMissingSpecialChars,
} from './errors.service.js';
import moment from 'moment-timezone';

/**
 * Check what arguments you have into the request's query & get list of missing ones.
 * @param {*} req
 * @param {*} URI
 * @param {*} expectedKeys
 * @returns
 */
export const check_query = function (req, expectedKeys) {
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
 * @param {*} req
 * @param {*} URI
 * @param {*} expectedBody
 * @returns
 */
export const check_body = function (req, expectedKeys) {
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
 * This function is used to compare the default object attributes and the actual ones in order to identify which are missing.
 * @param {*} expected_props
 * @param {*} actual_props
 * @returns
 */
export const check_props = function (expected_props = {}, actual_props = {}) {
  const merged = { ...expected_props, ...actual_props };
  return Object.keys(merged).filter((key) => merged[key] === undefined);
};

/**
 * Function used to know if the id is well formed.
 * @param {*} replica
 * @returns
 */
export const check_id = function (id = 0) {
  const num = Number.parseInt(id);
  return num > 0;
};

/**
 * Function used to check if the state_changed_date is in good format & is in the past.
 * @param {*} value
 * @returns
 */
export const state_changed_date = function (
  value = moment.tz(CONFIG.timezone)
) {
  return moment(value)
    .tz(CONFIG.timezone)
    .isSameOrBefore(moment.tz(CONFIG.timezone));
};

/**
 * Function used to check the application key is well formed.
 * @param {*} value
 * @returns
 */
export const check_key = function (value = '') {
  const regex = /^[a-z]+-[a-z]+-[a-z]+$/;
  return regex.test(value);
};

/**
 * Function used to check if the user_role is in the valid values.
 * @param {*} value
 * @returns
 */
export const check_user_role = function (value = '') {
  return ['ETUDIANT', 'PROFESSEUR', 'ADMINISTRATEUR'].includes(value);
};

/**
 * This function is used to know if the hash is well formed.
 * @param {*} hash
 * @returns true if it's ok
 */
export const check_hash = function (hash = '') {
  const regex = /^[a-zA-Z0-9]{6}$/;
  return regex.test(hash);
};

/**
 * This function is used to know if the mail adress is well formed.
 * @param {*} mail
 * @returns true if it's ok
 */
export const check_email = function (mail = '') {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(mail);
};

/**
 * This function is used to know if the password is well formed.
 * @param {*} password password to test.
 * @returns true if password is valid
 */
export const check_password = function (password = '') {
  const minLength = /.{8,}/;
  if (!minLength.test(password))
    throw new PasswordIsTooShort(
      'The password must contains at least 8 characters.'
    );
  const hasNumber = /[0-9]/;
  if (!hasNumber.test(password))
    throw new PasswordMissingNumber(
      'The password must contains at least 1 number.'
    );
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
  if (!hasSpecialChar.test(password))
    throw new PasswordMissingSpecialChars(
      'The password must contains at least 1 special char.'
    );
  return true;
};
/**
 * Function to check if the input is an array of valid IDs.
 * @param {*} ids
 * @returns {boolean}
 */
export const check_ids = function (ids = []) {
  if (!Array.isArray(ids)) return false;

  return ids.every((id) => {
    const num = Number.parseInt(id);
    return Number.isInteger(num) && num > 0;
  });
};
/**
 * Function to check if a value is a valid date.
 * @param {*} value
 * @returns {boolean}
 */
export const check_date = function (value) {
  if (!value) return false;

  const date = value instanceof Date ? value : new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Function used to know if the var is a true boolean or not.
 * @param {*} bool
 * @returns
 */
export const check_boolean = function (bool = false) {
  return typeof bool === 'boolean' || bool instanceof Boolean;
};
