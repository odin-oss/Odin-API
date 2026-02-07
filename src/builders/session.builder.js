import CONFIG from '../config/config.js';
import dbManager from '../config/db.config.js';
import * as parametres from '../utils/parametres.service.js';
import {
  MissingArgumentError,
  ParameterMisformed,
  ProfessorIsNotAttributed,
  UserIsNeitherProfOrAdmin,
} from '../utils/errors.service.js';
import { Session } from '../objects/Session.js';
import * as user_builder from './user.builder.js';
import * as application_builder from './applications.builder.js';
import { Environment } from '../objects/Environment.js';
import { Datacenter } from '../objects/Datacenter.js';
import { User } from '../objects/User.js';
import { Application } from '../objects/Application.js';
import moment from 'moment-timezone';

/**
 * Attribute the session to a professor in the database
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const attribute_professor = async function (
  props = {
    id_user: undefined,
    id_session: undefined,
  },
  fns = {
    user_get: user_builder.get,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_user: undefined,
    id_session: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_user))
    throw new ParameterMisformed('The props.id_user parameter is misformed.');
  if (!parametres.check_id(props.id_session))
    throw new ParameterMisformed(
      'The props.id_session parameter is misformed.'
    );

  try {
    const user = await Promise.resolve(
      fns.user_get({ id_user: props.id_user })
    );
    // We prepare the creation of the application
    const options = {
      id_user: props.id_user,
      id_session: props.id_session,
    };
    return await Promise.resolve(
      dbManager.models.SESSION_HAS_PROFESSOR.create(options)
    ).then((r) => {
      return { id_session: r.id_session, user };
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Attribute the session to a user and its application in the database
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const attribute_user_and_application = async function (
  props = {
    id_user: undefined,
    id_session: undefined,
    id_application: undefined,
  },
  fns = {
    user_get: user_builder.get,
    application_get: application_builder.get,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_user: undefined,
    id_session: undefined,
    id_application: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_user))
    throw new ParameterMisformed('The props.id_user parameter is misformed.');
  if (!parametres.check_id(props.id_session))
    throw new ParameterMisformed(
      'The props.id_session parameter is misformed.'
    );
  if (!parametres.check_id(props.id_application))
    throw new ParameterMisformed(
      'The props.id_application parameter is misformed.'
    );

  try {
    await fns.application_get({ id_application: props.id_application });
    const user = await fns.user_get({ id_user: props.id_user });

    // We prepare the creation of the application
    const options = {
      id_user: props.id_user,
      id_session: props.id_session,
      id_application: props.id_application,
    };
    return await Promise.resolve(
      dbManager.models.SESSION_HAS_USER.create(options)
    ).then((r) => {
      return {
        id_application: r.id_application,
        id_session: r.id_session,
        user,
      };
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Create a session in the database
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const create = async function (
  props = {
    label: undefined,
    begin_date: undefined,
    end_date: undefined,
    id_environment: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    label: undefined,
    begin_date: undefined,
    end_date: undefined,
    id_environment: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_environment))
    throw new ParameterMisformed(
      'The props.id_environment parameter is misformed.'
    );
  if (typeof props.label !== 'string')
    throw new ParameterMisformed('The props.label parameter is misformed.');
  if (!parametres.check_date(props.begin_date))
    throw new ParameterMisformed(
      'The props.begin_date parameter is misformed.'
    );
  if (!parametres.check_date(props.end_date))
    throw new ParameterMisformed('The props.end_date parameter is misformed.');
  try {
    // We prepare the creation of the application
    const options = {
      label: props.label,
      begin_date: moment(props.begin_date).tz(CONFIG.APP_TZ).utc().format(),
      end_date: moment(props.end_date).tz(CONFIG.APP_TZ).utc().format(),
      id_environment: props.id_environment,
    };
    return await Promise.resolve(dbManager.models.SESSION.create(options)).then(
      (r) => {
        return new Session({
          id_session: r.id_session,
          label: props.label,
          begin_date: moment(props.begin_date).tz(CONFIG.APP_TZ),
          id_environment: props.id_environment,
          end_date: moment(props.end_date).tz(CONFIG.APP_TZ),
        });
      }
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * List attributed session from database.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const list = async function (
  props = {
    id_user: undefined,
  },
  fns = {
    user_get: user_builder.get,
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

  try {
    const user_role = await fns.user_get({ id_user: props.id_user });

    if (!['PROFESSEUR', 'ADMINISTRATEUR'].includes(user_role.role))
      throw new UserIsNeitherProfOrAdmin(
        'The user is neither PROFESSEUR or ADMINISTRATEUR.'
      );
    let promise;
    if (user_role.role !== 'PROFESSEUR') {
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
    } else {
      promise = dbManager.models.SESSION_HAS_PROFESSOR.findAll({
        where: {
          id_user: props.id_user,
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
    }
    return await Promise.resolve(promise).then((r) => {
      const tmp = [];
      for (let i = 0; i < r.length; i++) {
        let result;
        if (user_role.role != 'PROFESSEUR') {
          result = {
            id_session: r[i].id_session,
            label: r[i].label,
            begin_date: moment(r[i].begin_date).tz(CONFIG.APP_TZ),
            id_environment: r[i].id_environment,
            end_date: moment(r[i].end_date).tz(CONFIG.APP_TZ),
            environment: new Environment(r[i].ENVIRONMENT),
            users: r[i].SESSION_HAS_USERs.map((user) => new User(user)),
            applications: r[i].SESSION_HAS_USERs.map(
              (app) => new Application(app.APPLICATION)
            ),
            professors: r[i].SESSION_HAS_PROFESSORs.map(
              (user) => new User(user)
            ),
          };
          for (let j = 0; j < result.applications.length; j++) {
            result.applications[j].datacenter = new Datacenter(
              r[i].SESSION_HAS_USERs[j].APPLICATION.DATACENTER
            );
            result.applications[j].environment = result.environment;
            result.datacenter = result.applications[j].datacenter;
          }
        }
        if (user_role.role === 'PROFESSEUR') {
          result = {
            id_session: r[i].id_session,
            label: r[i].SESSION.label,
            begin_date: moment(r[i].SESSION.begin_date).tz(CONFIG.APP_TZ),
            id_environment: r[i].SESSION.id_environment,
            end_date: moment(r[i].SESSION.end_date).tz(CONFIG.APP_TZ),
            environment: new Environment(r[i].SESSION.ENVIRONMENT),
            users: r[i].SESSION.SESSION_HAS_USERs.map((user) => new User(user)),
            applications: r[i].SESSION.SESSION_HAS_USERs.map(
              (app) => new Application(app.APPLICATION)
            ),
            professors: r[i].SESSION.SESSION_HAS_PROFESSORs.map(
              (user) => new User(user)
            ),
          };
          for (let j = 0; j < result.applications.length; j++) {
            result.applications[j].datacenter = new Datacenter(
              r[i].SESSION.SESSION_HAS_USERs[j].APPLICATION.DATACENTER
            );
            result.applications[j].environment = result.environment;
            result.datacenter = result.applications[j].datacenter;
          }
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
 * @param {*} props
 */
export const get_on_professeur = async function (
  props = {
    id_user: undefined,
    id_session: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_user: undefined,
    id_session: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_user))
    throw new ParameterMisformed('The props.id_user parameter is misformed.');
  if (!parametres.check_id(props.id_session))
    throw new ParameterMisformed(
      'The props.id_session parameter is misformed.'
    );

  // Checking the attribution
  await Promise.resolve(
    dbManager.models.SESSION_HAS_PROFESSOR.findOne({
      where: {
        id_user: props.id_user,
        id_session: props.id_session,
      },
    })
  ).then((r) => {
    if (r === null)
      throw new ProfessorIsNotAttributed(
        `The session is not attributed to the current user.`
      );
  });

  const promise = dbManager.models.SESSION_HAS_PROFESSOR.findOne({
    where: {
      id_session: props.id_session,
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
  return await Promise.resolve(promise).then((result) => {
    const session = new Session({
      id_session: result.id_session,
      label: result.SESSION.label,
      begin_date: moment(result.SESSION.begin_date).tz(CONFIG.APP_TZ),
      id_environment: result.SESSION.id_environment,
      end_date: moment(result.SESSION.end_date).tz(CONFIG.APP_TZ),
      environment: new Environment(result.SESSION.ENVIRONMENT),
      users: result.SESSION.SESSION_HAS_USERs.map((user) => new User(user)),
      applications: result.SESSION.SESSION_HAS_USERs.map(
        (app) => new Application(app.APPLICATION)
      ),
      professors: result.SESSION.SESSION_HAS_PROFESSORs.map(
        (user) => new User(user)
      ),
    });

    for (let i = 0; i < session.applications.length; i++) {
      session.applications[i].datacenter = new Datacenter(
        result.SESSION.SESSION_HAS_USERs[i].APPLICATION.DATACENTER
      );
      session.applications[i].environment = session.environment;
      session.datacenter = session.applications[i].datacenter;
    }

    return session;
  });
};

/**
 * Get session if user is ADMINISTRATEUR.
 * @param {*} props
 */
export const get_on_administrateur = async function (
  props = {
    id_session: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_session: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_session))
    throw new ParameterMisformed(
      'The props.id_session parameter is misformed.'
    );

  const promise = dbManager.models.SESSION.findOne({
    where: {
      id_session: props.id_session,
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
  return await Promise.resolve(promise).then((result) => {
    const session = new Session({
      id_session: result.id_session,
      label: result.label,
      begin_date: moment(result.begin_date).tz(CONFIG.APP_TZ),
      id_environment: result.id_environment,
      end_date: moment(result.end_date).tz(CONFIG.APP_TZ),
      environment: new Environment(result.ENVIRONMENT),
      users: result.SESSION_HAS_USERs.map((user) => new User(user)),
      applications: result.SESSION_HAS_USERs.map(
        (app) => new Application(app.APPLICATION)
      ),
      professors: result.SESSION_HAS_PROFESSORs.map((user) => new User(user)),
    });

    for (let i = 0; i < session.applications.length; i++) {
      session.applications[i].datacenter = new Datacenter(
        result.SESSION_HAS_USERs[i].APPLICATION.DATACENTER
      );
      session.applications[i].environment = session.environment;
      session.datacenter = session.applications[i].datacenter;
    }

    return session;
  });
};
