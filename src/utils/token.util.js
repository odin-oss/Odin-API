import logs from '../middlewares/winston.js';
import * as application_builder from '../builders/applications.builder.js';
import * as auth_service from '../services/auth.service.js';
import * as history_builder from '../builders/history.builder.js';
import * as whitelist_builder from '../builders/whitelist.builder.js';
import jwt from 'jsonwebtoken';
import CONFIG from '../config/config.js';
import {
  BadContentTokenError,
  MissingArgumentError,
  ParameterMisformed,
  UserIsNeitherProfOrAdmin,
  UserIsNotAdmin,
  UserIsNotOwner,
  UserIsNotProfessor,
} from './errors.util.js';
import Guard from './guard.util.js';
import z from 'zod';
import { ApiResponse } from './response.util.js';
const { sign, decode, verify } = jwt;
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

/**
 * Method used to generate a new token for user.
 * @param {Number} id_user id of the user we need to generate a token for.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {String}
 */
export const generateToken = async function (
  props,
  fns = {
    jwt_sign: sign,
  }
) {
  const schema = z.object({
    id_user: z.union([z.string(), z.number()]),
    is_agent: z.boolean().default(false),
  });
  const data = Guard.validateProps(schema, props);
  const content_part = (data.is_agent && { uuid: `agent-${data.id_user}` }) || {
    id_user: data.id_user,
  };
  content_part.jti = crypto.randomBytes(16).toString('hex');
  content_part.iat = Math.floor(Date.now() / 1000);
  const options = data.is_agent
    ? {}
    : { expiresIn: CONFIG.APP_TOKEN_EXPIRATION_HOURS + 'h' };
  const token = fns.jwt_sign(content_part, CONFIG.APP_TOKEN_KEYPASS, options);
  const hashed_token = bcrypt.hashSync(token, 11);
  await whitelist_builder.create({
    uuid: data.is_agent ? `agent-${data.id_user}` : `user-${data.id_user}`,
    hash_token: hashed_token,
  });
  return token;
};

/**
 * Method used to decode the user's token.
 * @param {String} token token to decode.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Number}
 */
export const decodeToken = function (
  props,
  fns = {
    jwt_decode: decode,
  }
) {
  const schema = z.object({
    token: z
      .string()
      .startsWith('Bearer ', { message: 'The token should begin with Bearer.' })
      .transform((val) => val.slice(7)),
  });
  const data = Guard.validateProps(schema, props);
  return fns.jwt_decode(data.token);
};

/**
 * Get id_user from the token.
 * @param {String} token token to decode.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Number}
 */
export const getUserId = function (
  props,
  fns = {
    decode_token: decodeToken,
  }
) {
  const schema = z.object({
    token: z.string().startsWith('Bearer ', {
      message: 'The token should begin with Bearer.',
    }),
  });
  const data = Guard.validateProps(schema, props);
  return fns.decode_token({ ...data }).id_user;
};

/**
 * Get id_user from the token.
 * @param {String} token token to decode.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Number}
 */
export const getAgentId = function (
  props,
  fns = {
    decode_token: decodeToken,
  }
) {
  const schema = z.object({
    token: z.string().startsWith('Bearer ', {
      message: 'The token should begin with Bearer.',
    }),
  });
  const data = Guard.validateProps(schema, props);
  return fns.decode_token({ ...data }).uuid?.slice(6);
};

/**
 * Method that checks if the token is valid.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {NextFunction} next HTTP next method.
 * @param {Function} fns overwriting functions for tests.
 * @returns {Boolean}
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
    const hashed_token = await whitelist_builder.get({
      uuid: `user-${verifiedToken.id_user}`,
    });
    if (!bcrypt.compareSync(token, hashed_token))
      throw new BadContentTokenError('The token is not valid anymore.');
    next();
    /*await fns
      .generate_token({
        id_user: verifiedToken.id_user,
      })
      .then((newToken) => {
        
        console.log(token, newToken, bcrypt.compareSync(newToken, hashed_token));
        res.set('authorization', 'Bearer ' + newToken);
        next();
      });*/
    // We can decide to generate a new token at each request, but it is not really necessary and it can cause some issues with the current whitelist system.
  } catch (error) {
    ApiResponse.error(req, res, new BadContentTokenError(error.message));
  }
};

/**
 * Checks if the User's application.
 * First, it looks for token in headers[OdinToken] and if nothing is found, it goes on token parameters.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 * @returns {Boolean}
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
    if (role === 'ADMINISTRATOR' || app.id_user === verifiedToken.id_user) {
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
    if (role === 'ADMINISTRATOR' || app.id_user === verifiedToken.id_user)
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
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {NextFunction} next HTTP next.
 * @param {Function} fns overwriting functions for tests.
 * @returns {Boolean}
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
    return await fns.getRole({ id_user }).then((role) => {
      if (!['ADMINISTRATOR', 'TEACHER'].includes(role))
        throw new UserIsNeitherProfOrAdmin(
          'The user is neither TEACHER or ADMINISTRATOR.'
        );
      else next();
    });
  } catch (error) {
    ApiResponse.error(req, res, error);
  }
};

/**
 * Check is the User is an admin or not.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {NextFunction} next HTTP next.
 * @param {Function} fns overwriting functions for tests.
 * @returns {Boolean}
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
    return await fns.getRole({ id_user }).then((role) => {
      if (role !== 'ADMINISTRATOR')
        throw new UserIsNotAdmin('The user is not admin.');
      else next();
    });
  } catch (error) {
    ApiResponse.error(req, res, error);
  }
};

/**
 * Check is the User is a prof or not.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {NextFunction} next HTTP next.
 * @param {Function} fns overwriting functions for tests.
 * @returns {Boolean}
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
      if (role !== 'TEACHER')
        throw new UserIsNotProfessor('The user is not professor.');
      else next();
    });
  } catch (error) {
    ApiResponse.error(req, res, error);
  }
};

/**
 * Method to check if the application is owned by the user.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {NextFunction} next HTTP next.
 * @param {Function} fns overwriting functions for tests.
 * @returns {Boolean}
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
        req.query.key === undefined
          ? {
              id_user: id_user,
              id_application: req.query.id_application,
            }
          : { id_user: id_user, key: req.query.key }
      ),
      fns.getRole({ id_user }),
    ];
    return await Promise.all(promises).then((response) => {
      if (response[1] === 'ADMINISTRATOR' || response[0]) next();
      else
        throw new UserIsNotOwner(
          'The user is not the owner of this application.'
        );
    });
  } catch (err) {
    ApiResponse.error(req, res, err);
  }
};
