import logs from '../middlewares/winston.js';
import * as application_builder from '../builders/applications.builder.js';
import * as auth_service from '../services/auth.service.js';
import * as history_builder from '../builders/history.builder.js';
import jwt from 'jsonwebtoken';
import * as parametres from '../utils/parametres.service.js';
import CONFIG from '../config/config.js';
import {
  BadContentTokenError,
  MissingArgumentError,
  ParameterMisformed,
  UserIsNeitherProfOrAdmin,
  UserIsNotAdmin,
  UserIsNotOwner,
  UserIsNotProfessor,
} from './errors.service.js';
const { sign, decode, verify, TokenExpiredError } = jwt;

/**
 * Method used to generate a new token for user.
 * @param {*} props {id_user}
 * @param {*} fns overwriting functions for tests.
 * @returns token
 */
export const generateToken = function (
  props = {
    id_user: undefined,
  },
  fns = {
    jwt_sign: sign,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_user: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_user))
    throw new ParameterMisformed('The props.id_user parameter is misformed.');
  return fns.jwt_sign(
    {
      id_user: props.id_user,
    },
    CONFIG.APP_TOKEN_KEYPASS,
    {
      expiresIn: CONFIG.APP_TOKEN_EXPIRATION_HOURS,
    }
  );
};

/**
 * Method used to decode the user's token.
 * @param {*} props {token}
 * @param {*} fns overwriting function for tests.
 * @returns {id_user}
 */
export const decodeToken = function (
  props = {
    token: undefined,
  },
  fns = {
    jwt_decode: decode,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    token: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (props.token.slice(0, 7) !== 'Bearer ')
    throw new ParameterMisformed('The props.token parameter is misformed.');
  return fns.jwt_decode(props.token.slice(7));
};

/**
 * Get id_user from the token.
 * @param {*} props {token}
 * @param {*} fns overwriting functions for tests.
 * @returns id_user
 */
export const getUserId = function (
  props = {
    token: undefined,
  },
  fns = {
    decode_token: decodeToken,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    token: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (props.token.slice(0, 7) !== 'Bearer ')
    throw new ParameterMisformed('The props.token parameter is misformed.');
  return fns.decode_token({ token: props.token }).id_user;
};

/**
 * Method that checks if the token is valid.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} next HTTP next method.
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const isTokenValid = async (
  req,
  res,
  next,
  fns = {
    jwt_verify: verify,
    generate_token: generateToken,
  }
) => {
  try {
    if (req.headers['authorization'] === undefined)
      throw new MissingArgumentError('The token is missing.');
    if (req.headers['authorization'].slice(0, 7) !== 'Bearer ')
      throw new ParameterMisformed('The props.token parameter is misformed.');

    const token = req.headers['authorization'].slice(7);
    const verifiedToken = fns.jwt_verify(token, CONFIG.APP_TOKEN_KEYPASS);
    if (!verifiedToken.id_user)
      throw new BadContentTokenError(
        'The token does not have proper attribute.'
      );
    const regeneratedToken = fns.generate_token({
      id_user: verifiedToken.id_user,
    });

    res.set('authorization', 'Bearer ' + regeneratedToken);
    next();
  } catch (error) {
    logs.error(
      `[${req.method}][401][${error.name}] ${req.originalUrl} : ${error.message}`
    );
    return res.status(401).json({
      result: {
        error: error.name,
        message: error.message,
      },
    });
  }
};

/**
 * Checks if the User's application.
 * First, it looks for token in headers[OdinToken] and if nothing is found, it goes on token parameters.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const app_access_granted = async (
  req,
  res,
  fns = {
    jwt_verify: verify,
    application_get: application_builder.get,
    auth_role: auth_service.role,
    history_create: history_builder.create,
  }
) => {
  const regex = /^\/[a-z]+(-[a-z]+){2}\/.+$/;
  try {
    if (req.headers['authorization'] === undefined)
      throw new MissingArgumentError('The token is missing.');
    if (req.headers['authorization'].slice(0, 7) !== 'Bearer ')
      throw new ParameterMisformed('The props.token parameter is misformed.');

    const token = req.headers['authorization'].slice(7);

    // lets verify token
    const verifiedToken = fns.jwt_verify(token, CONFIG.APP_TOKEN_KEYPASS);
    if (!verifiedToken.id_user)
      throw new BadContentTokenError(
        'The token does not have proper attribute.'
      );

    // is the user admin ?
    const role = await Promise.resolve(
      fns.auth_role({ id_user: verifiedToken.id_user })
    );

    // is the user the owner ?
    let app = await Promise.resolve(
      fns.application_get({ hash: req.params.hash })
    );

    // save record in history
    if (role === 'ADMINISTRATEUR' || app.id_user === verifiedToken.id_user) {
      logs.info(
        `[${req.method}][200] ${
          regex.test(req.url) ? '/apps-ingress-encrypted' : req.originalUrl
        } : Authentication succeeded.`
      );
      history_builder.create({
        id_user: app.id_user,
        id_application: app.id_application,
      });
      application_builder.renew_expiration({
        id_application: app.id_application,
      });
    }

    // send response
    if (role === 'ADMINISTRATEUR' || app.id_user === verifiedToken.id_user)
      return res.status(200).json({ result: true });
    else return res.status(403).json({ result: false });
  } catch (error) {
    logs.error(
      `[${req.method}][${error.code}][${error.name}] ${
        regex.test(req.url) ? '/apps-ingress-encrypted' : req.originalUrl
      } : ${error.message}.`
    );
    return res.status(error.code).json({ result: false });
  }
};

/**
 * Check is the User is an admin or a prof.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} next HTTP next.
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const isProfOrAdmin = async function (
  req,
  res,
  next,
  fns = {
    getUserId: getUserId,
    getRole: auth_service.role,
  }
) {
  try {
    const id_user = fns.getUserId({
      token: req.headers['authorization'],
    });
    return await Promise.resolve(fns.getRole({ id_user })).then((role) => {
      if (role !== 'ADMINISTRATEUR' && role !== 'PROFESSEUR')
        throw new UserIsNeitherProfOrAdmin(
          'The user is neither PROFESSEUR or ADMINISTRATEUR.'
        );
      else next();
    });
  } catch (error) {
    return res.status(error.code).json({
      result: {
        error: error.name,
        message: error.message,
      },
    });
  }
};

/**
 * Check is the User is an admin or not.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} next HTTP next.
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const isAdmin = async function (
  req,
  res,
  next,
  fns = {
    getUserId: getUserId,
    getRole: auth_service.role,
  }
) {
  try {
    const id_user = fns.getUserId({
      token: req.headers['authorization'],
    });
    return await Promise.resolve(fns.getRole({ id_user })).then((role) => {
      if (role !== 'ADMINISTRATEUR')
        throw new UserIsNotAdmin('The user is not admin.');
      else next();
    });
  } catch (error) {
    return res.status(error.code).json({
      result: {
        error: error.name,
        message: error.message,
      },
    });
  }
};

/**
 * Check is the User is a prof or not.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} next HTTP next.
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const isProf = async function (
  req,
  res,
  next,
  fns = {
    getUserId: getUserId,
    getRole: auth_service.role,
  }
) {
  try {
    const id_user = fns.getUserId({
      token: req.headers['authorization'],
    });
    return await Promise.resolve(fns.getRole({ id_user })).then((role) => {
      if (role !== 'PROFESSEUR')
        throw new UserIsNotProfessor('The user is not professor.');
      else next();
    });
  } catch (error) {
    return res.status(error.code).json({
      result: {
        error: error.name,
        message: error.message,
      },
    });
  }
};

/**
 * Method to check if the application is owned by the user.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} next HTTP next.
 * @param {*} fns overwriting function for tests.
 * @returns
 */
export const isOwner = async (
  req,
  res,
  next,
  fns = {
    getUserId: getUserId,
    isOwner: application_builder.is_owner,
    getRole: auth_service.role,
  }
) => {
  try {
    if (req.query.key === undefined && req.query.id_application === undefined)
      throw new MissingArgumentError(
        'One or more arguments (key,id_application) are missing.'
      );

    const id_user = fns.getUserId({
      token: req.headers['authorization'],
    });
    const promises = [
      fns.isOwner(
        req.query.key !== undefined
          ? { id_user: id_user, key: req.query.key }
          : {
              id_user: id_user,
              id_application: req.query.id_application,
            }
      ),
      fns.getRole({ id_user }),
    ];
    return await Promise.all(promises).then((response) => {
      if (response[1] === 'ADMINISTRATEUR' || response[0]) next();
      else
        throw new UserIsNotOwner(
          'The user is not the owner of this application.'
        );
    });
  } catch (err) {
    return res.status(err.code).json({
      result: {
        error: err.name,
        message: err.message,
      },
    });
  }
};
