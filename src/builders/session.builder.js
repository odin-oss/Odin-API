import CONFIG from '../config/config.js';
import dbManager from '../config/db.config.js';
import {
  ProfessorIsNotAttributed,
  UserIsNeitherProfOrAdmin,
} from '../utils/errors.util.js';
import { Session } from '../objects/Session.js';
import * as user_builder from './user.builder.js';
import * as application_builder from './applications.builder.js';
import { Environment } from '../objects/Environment.js';
import { Datacenter } from '../objects/Datacenter.js';
import { User } from '../objects/User.js';
import { Application } from '../objects/Application.js';
import moment from 'moment-timezone';
import Guard from '../utils/guard.util.js';
import z, { int } from 'zod';

/**
 * Attribute the session to a professor in the database
 * @param {Number} id_user id of the user that will be prof
 * @param {Number} id_session id of the session
 * @param {Array<Function>} fns functions to overwrite when testing.
 * @returns
 */
export const attribute_professor = async function (
  props,
  fns = {
    user_get: user_builder.get,
  }
) {
  try {
    const schema = z.object({
      id_user: z.coerce.number().int().positive(),
      id_session: z.coerce.number().int().positive(),
    });
    const data = Guard.validateProps(schema, props);
    const user = await Promise.resolve(fns.user_get({ id_user: data.id_user }));
    return await dbManager.models.SESSION_HAS_PROFESSOR.create({
      ...data,
    }).then((r) => ({ id_session: r.id_session, user }));
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Attribute the session to a user and its application in the database
 * @param {Number} id_user id of the user.
 * @param {Number} id_session id of the session.
 * @param {Number} id_application id of the application.
 * @param {Function} fns functions for unit tests overwriting
 * @returns
 */
export const attribute_user_and_application = async function (
  props,
  fns = {
    user_get: user_builder.get,
    application_get: application_builder.get,
  }
) {
  try {
    const schema = z.object({
      id_user: z.coerce.number().int().positive(),
      id_session: z.coerce.number().int().positive(),
      id_application: z.coerce.number().int().positive(),
    });
    const data = Guard.validateProps(schema, props);
    await fns.application_get({ id_application: data.id_application });
    const user = await fns.user_get({ id_user: data.id_user });
    return await dbManager.models.SESSION_HAS_USER.create({ ...data }).then(
      (r) => ({ ...r, user })
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Create a session in the database
 * @param {Number} id_environment id of the environment of the session.
 * @param {String} label label of the session
 * @param {moment || String} begin_date datetime when the session will start.
 * @param {moment || String} end_date datetime when the session will stop.
 * @param {*} fns
 * @returns {Session} new session created.
 */
export const create = async function (props) {
  try {
    const schema = z.object({
      id_environment: z.number().positive().optional(),
      label: z.string(),
      begin_date: z
        .refine((val) => moment(val).isValid(), {
          message: 'Invalid date format',
        })
        .transform((val) => moment(val).tz(CONFIG.APP_TZ).utc().format()),

      end_date: z
        .refine((val) => moment(val).isValid(), {
          message: 'Invalid date format',
        })
        .transform((val) => moment(val).tz(CONFIG.APP_TZ).utc().format()),
    });
    const data = Guard.validateProps(schema, props);
    return await dbManager.models.SESSION.create({ ...data }).then(
      (r) =>
        new Session({
          ...r.dataValues,
          label: data.label,
          begin_date: moment(data.begin_date).tz(CONFIG.APP_TZ),
          id_environment: data.id_environment,
          end_date: moment(data.end_date).tz(CONFIG.APP_TZ),
        })
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * List attributed session from database.
 * @param {Number} id_user id of the user
 * @param {Function} fns functions to overwrite in unit tests
 * @returns {Array<Session>} List of the sessions
 */
export const list = async function (
  props,
  fns = {
    user_get: user_builder.get,
  }
) {
  try {
    const schema = z.object({
      id_user: z.number().positive(),
    });
    const data = Guard.validateProps(schema, props);
    const user_role = await fns.user_get({ ...data });
    if (!['PROFESSEUR', 'ADMINISTRATEUR'].includes(user_role.role))
      throw new UserIsNeitherProfOrAdmin(
        'The user is neither PROFESSEUR or ADMINISTRATEUR.'
      );
    let promise;
    if (user_role.role === 'PROFESSEUR') {
      promise = dbManager.models.SESSION_HAS_PROFESSOR.findAll({
        where: {
          id_user: data.id_user,
        },
        include: [
          {
            model: dbManager.models.SESSION,
            required: true,
            include: [
              {
                model: dbManager.models.ENVIRONMENT,
                required: true,
              },
              {
                model: dbManager.models.SESSION_HAS_PROFESSOR,
                required: false,
              },
              {
                model: dbManager.models.SESSION_HAS_USER,
                required: false,
                include: [
                  {
                    model: dbManager.models.APPLICATION,
                    required: true,
                    include: [
                      {
                        model: dbManager.models.DATACENTER,
                        required: false,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
    } else {
      promise = dbManager.models.SESSION.findAll({
        include: [
          {
            model: dbManager.models.ENVIRONMENT,
            required: true,
          },
          {
            model: dbManager.models.SESSION_HAS_PROFESSOR,
            required: false,
          },
          {
            model: dbManager.models.SESSION_HAS_USER,
            required: false,
            include: [
              {
                model: dbManager.models.APPLICATION,
                required: true,
                include: [
                  {
                    model: dbManager.models.DATACENTER,
                    required: false,
                  },
                ],
              },
            ],
          },
        ],
      });
    }
    return await promise.then((r) => {
      const tmp = [];
      for (const item of r) {
        let result;
        const source = user_role.role === 'PROFESSEUR' ? item.SESSION : item;
        result = {
          ...source.dataValues,
          environment: new Environment(source.ENVIRONMENT),
          users: source.SESSION_HAS_USERs.map((user) => new User(user)),
          applications: source.SESSION_HAS_USERs.map(
            (app) => new Application(app.APPLICATION)
          ),
          professors: source.SESSION_HAS_PROFESSORs.map(
            (user) => new User(user)
          ),
        };
        for (const [index, app] of result.applications.entries()) {
          const rawUserSession = source.SESSION_HAS_USERs[index];
          app.datacenter = new Datacenter(
            rawUserSession.APPLICATION.DATACENTER
          );
          app.environment = result.environment;
          result.datacenter = app.datacenter;
        }
        tmp.push(new Session(result));
      }
      return tmp;
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Get session if user is PROFESSEUR.
 * @param {Number} id_user id of the user
 * @param {Number} id_session id of the session
 * @return {Session} sessions of the user.
 */
export const get_on_professeur = async function (props) {
  try {
    const schema = z.object({
      id_user: z.number().positive(),
      id_session: z.number().positive(),
    });
    const data = Guard.validateProps(schema, props);

    await dbManager.models.SESSION_HAS_PROFESSOR.findOne({
      where: { ...data },
    }).then((r) => {
      if (r === null)
        throw new ProfessorIsNotAttributed(
          `The session is not attributed to the current user.`
        );
    });

    const promise = dbManager.models.SESSION_HAS_PROFESSOR.findOne({
      where: {
        id_session: data.id_session,
      },
      include: [
        {
          model: dbManager.models.SESSION,
          required: true,
          include: [
            {
              model: dbManager.models.ENVIRONMENT,
              required: true,
            },
            {
              model: dbManager.models.SESSION_HAS_PROFESSOR,
              required: false,
            },
            {
              model: dbManager.models.SESSION_HAS_USER,
              required: false,
              include: [
                {
                  model: dbManager.models.APPLICATION,
                  required: true,
                  include: [
                    {
                      model: dbManager.models.DATACENTER,
                      required: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    return await promise.then((result) => {
      const session = new Session({
        ...result.SESSION,
        environment: new Environment(result.SESSION.ENVIRONMENT),
        users: result.SESSION.SESSION_HAS_USERs.map((user) => new User(user)),
        applications: result.SESSION.SESSION_HAS_USERs.map(
          (app) => new Application(app.APPLICATION)
        ),
        professors: result.SESSION.SESSION_HAS_PROFESSORs.map(
          (user) => new User(user)
        ),
      });
      for (const [i, app] of session.applications.entries()) {
        app.datacenter = new Datacenter(
          result.SESSION.SESSION_HAS_USERs[i].APPLICATION.DATACENTER
        );
        app.environment = session.environment;
        session.datacenter = app.datacenter;
      }
      return session;
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Get session if user is ADMINISTRATEUR.
 * @param {*} props
 */
export const get_on_administrateur = async function (props) {
  const schema = z.object({
    id_session: z.number().positive(),
  });
  const data = Guard.validateProps(schema, props);

  const promise = dbManager.models.SESSION.findOne({
    where: {
      id_session: data.id_session,
    },
    include: [
      {
        model: dbManager.models.ENVIRONMENT,
        required: true,
      },
      {
        model: dbManager.models.SESSION_HAS_PROFESSOR,
        required: false,
      },
      {
        model: dbManager.models.SESSION_HAS_USER,
        required: false,
        include: [
          {
            model: dbManager.models.APPLICATION,
            required: true,
            include: [
              {
                model: dbManager.models.DATACENTER,
                required: false,
              },
            ],
          },
        ],
      },
    ],
  });
  return await promise
    .then((result) => {
      const session = new Session({
        ...result.dataValues,
        environment: new Environment(result.ENVIRONMENT.dataValues),
        users: result.SESSION_HAS_USERs.map(
          (user) => new User(user.dataValues)
        ),
        applications: result.SESSION_HAS_USERs.map(
          (app) => new Application(app.APPLICATION.dataValues)
        ),
        professors: result.SESSION_HAS_PROFESSORs.map(
          (user) => new User(user.dataValues)
        ),
      });
      for (const [i, app] of session.applications.entries()) {
        app.datacenter = new Datacenter(
          result.SESSION_HAS_USERs[i].APPLICATION.DATACENTER
        );
        app.environment = session.environment;
        session.datacenter = app.datacenter;
      }
      return session;
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};
