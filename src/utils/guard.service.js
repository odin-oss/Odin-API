import {
  MissingArgumentError,
  ParameterMisformed,
  PasswordIsTooShort,
  PasswordMissingNumber,
  PasswordMissingSpecialChars,
} from '../utils/errors.service.js';
import logs from '../middlewares/winston.js';

export default class Guard {
  /**
   * Function that checks if the array of args is well formed.
   * @param {*} args
   */
  static check_args = function (args) {
    if (!Array.isArray(args))
      throw new ParameterMisformed('Args should be an array of string.');
    args.forEach((arg) => {
      Guard.check_string(arg);
    });
  };
  /**
   * Function that checks that the bandwidth is well formed/
   * @param {*} value
   */
  static check_bandwidth = function (value) {
    if (typeof value !== 'string')
      throw new ParameterMisformed('The bandwidth must be sent in string.');
    if (!/^\d+[MG]$/.test(value))
      throw new ParameterMisformed(
        'The bandwidth should be like xxM or xxG, xx being your number value.'
      );
  };
  /**
   * Check if the variable is a boolean.
   * @param {*} value
   * @returns
   */
  static check_boolean = function (value) {
    if (typeof value !== 'boolean' && (!value) instanceof Boolean)
      throw new ParameterMisformed('The value needs to be a boolean.');
  };

  /**
   * Function that checks if the cpu value is well formed.
   * @param {*} value
   */
  static check_cpu = function (value) {
    if (typeof value === 'string') {
      if (!/^\d+m?$/.test(value))
        throw new ParameterMisformed(
          'The string value of the CPU must be xx or xxm, xx being the integer.'
        );
    } else if (!Number.isInteger(value))
      throw new ParameterMisformed('The CPU must be a string or an integer.');
  };

  /**
   * Function that checks if the envs array is well formed.
   * @param {*} array
   */
  static check_envs_object = function (array) {
    if (!Array.isArray(array))
      throw new ParameterMisformed('Envs should be an array of string.');
    array.forEach((env) => {
      if (
        !['id_variable_environment'].every((key) => Object.hasOwn(env, key)) &&
        !['key', 'value'].every((key) => Object.hasOwn(env, key))
      )
        throw new ParameterMisformed(
          'The env object should have : key and value OR id_variable_environment.'
        );
    });
  };

  /**
   * Function used to know if the id is well formed.
   * @param {*} replica
   * @returns
   */
  static check_id = function (id = 0) {
    if (!/^\d+$/.test(id))
      throw new ParameterMisformed('The id must be an integer upper 0.');
  };
  /**
   * Function that checks if the array of ids is well formed.
   * @param {*} array
   */
  static check_ids_array = function (array) {
    if (!Array.isArray(array))
      throw new ParameterMisformed(
        'Arrays of ids should be an array of string.'
      );
    array.forEach((id) => {
      Guard.check_id(id);
    });
  };

  /**
   * Function used to check is object is a JSON or not
   * @param {*} value
   * @returns
   */
  static check_JSON = function (object) {
    if (typeof object !== 'object' || object == null)
      throw new ParameterMisformed(
        'The object is not a well formed JSON object.'
      );
  };

  /**
   * This function is used to know if the mail adress is well formed.
   * @param {*} mail
   * @returns true if it's ok
   */
  static check_mail = function (mail = '') {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (regex.test(mail))
      throw new ParameterMisformed('The mail adress is not well formed.');
  };

  /**
   * This function is used to know if the password is well formed.
   * @param {*} password password to test.
   * @returns true if password is valid
   */
  static check_password = function (password = '') {
    const minLength = /.{8,}/;
    if (!minLength.test(password))
      throw new PasswordIsTooShort(
        'The password must contains at least 8 characters.'
      );
    const hasNumber = /\d/;
    if (!hasNumber.test(password))
      throw new PasswordMissingNumber(
        'The password must contains at least 1 number.'
      );
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    if (!hasSpecialChar.test(password))
      throw new PasswordMissingSpecialChars(
        'The password must contains at least 1 special char.'
      );
  };

  /**
   * Function used to check is object is a JSON or not
   * @param {*} value
   * @returns
   */
  static check_ports_object = function (ports) {
    if (!Array.isArray(ports))
      throw new ParameterMisformed('Ports should be an array of port objects');
    ports.forEach((port) => {
      if (
        !['port', 'id_port_type', 'icon', 'label', 'display_name'].every(
          (key) => Object.hasOwn(port, key)
        )
      )
        throw new ParameterMisformed(
          'The port object should have : port, id_port_type, icon, label and display_name.'
        );
    });
  };

  /**
   * Function that checks if the RAM value is well formed.
   * @param {*} value
   */
  static check_ram = function (value) {
    if (typeof value !== 'string')
      throw new ParameterMisformed('The RAM value must be a string.');
    if (!/^\d+(Gi|Mi)$/.test(value))
      throw new ParameterMisformed(
        'The RAM value must be as xxGi or xxMi, xx being the integer.'
      );
  };

  /**
   * This function checks if a proper existing status has been sent.
   * @param {*} value
   * @returns
   */
  static check_status = function (value) {
    if (
      ![
        100, 101, 102, 103, 200, 201, 202, 203, 204, 205, 206, 207, 208, 226,
        300, 301, 302, 303, 304, 305, 306, 307, 308, 400, 401, 402, 403, 404,
        405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418,
        421, 422, 423, 424, 425, 426, 428, 429, 431, 451, 500, 501, 502, 503,
        504, 505, 506, 507, 508, 510, 511,
      ].includes(value)
    )
      throw new ParameterMisformed('The status code does not exist.');
  };

  /**
   * This function is used to know if the value is a string.
   * @param {*} value
   * @returns
   */
  static check_string = function (value) {
    if (typeof value !== 'string' && !(value instanceof String))
      throw new ParameterMisformed('The string is not a String object.');
  };

  /**
   * Function used to check if the user_role is in the valid values.
   * @param {*} value
   * @returns
   */
  static check_user_role = function (value = '') {
    if (!['ETUDIANT', 'PROFESSEUR', 'ADMINISTRATEUR'].includes(value))
      throw new ParameterMisformed('The user_role does not exists.');
  };

  /**
   * Used to check the props that are sent to a function and send back the list of useful fields.
   * @param {*} props
   * @param {*} control
   */
  static control(props = {}, control = {}, optional = {}) {
    // Checking for missing fields in props
    if (!Object.keys(control).every((key) => Object.hasOwn(props, key)))
      throw new MissingArgumentError(
        `One or multiple arguments (${Object.keys(control)
          .filter((key) => !Object.hasOwn(props, key))
          .join(',')}) are missing.`
      );

    // Checking for undefined values in props
    const missingKeys = Object.keys(control).filter(
      (key) => props[key] === undefined
    );
    if (missingKeys.length > 0)
      throw new MissingArgumentError(
        `One or multiple arguments (${missingKeys.join(',')}) are undefined.`
      );

    // Executing check functions
    Object.entries(control).forEach(([key, checkFn]) => {
      checkFn(props[key]);
    });

    let verifiedKeys = Object.keys(control).filter((key) =>
      Object.hasOwn(props, key)
    );

    // Optional fields
    Object.entries(optional).forEach(([key, checkFn]) => {
      // Only check if key exists AND is not undefined
      if (Object.hasOwn(props, key) && props[key] !== undefined) {
        try {
          checkFn(props[key]);
          verifiedKeys.push(key);
        } catch (err) {
          logs.warn(
            `[IGNORED][${err.code}][${err.name}] Guard : ${err.message}.`
          );
        }
      }
    });
    return verifiedKeys;
  }
}
