import * as application_service from '../services/applications.service.js';
import * as session_builder from '../builders/session.builder.js';
import * as user_service from '../services/user.service.js';
import * as user_builder from '../builders/user.builder.js';
import * as parametres from '../utils/parametres.service.js';
import {
  MissingArgumentError,
  ParameterMisformed,
  UserIsNeitherProfOrAdmin,
} from '../utils/errors.service.js';
import { Session } from '../objects/Session.js';

/**
 * Service that execute the creation workflow of an application.
 * @param {*} props {label,begin_date,end_date,id_environment,id_datacenter,users,professors}
 * @param {*} fns overwriting functions for tests
 * @returns Application {}
 */
export const create = async function (
  props = {
    label_session: undefined,
    label_application: undefined,
    begin_date: undefined,
    end_date: undefined,
    id_environment: undefined,
    id_datacenter: undefined,
    users: undefined,
    professors: undefined,
  },
  fns = {
    application_create: application_service.create,
    session_create: session_builder.create,
    session_attribute_professor: session_builder.attribute_professor,
    session_attribute_user_and_application:
      session_builder.attribute_user_and_application,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    label_session: undefined,
    label_application: undefined,
    begin_date: undefined,
    end_date: undefined,
    id_environment: undefined,
    id_datacenter: undefined,
    users: undefined,
    professors: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_environment))
    throw new ParameterMisformed(
      'The props.id_environment parameter is misformed.'
    );
  if (!parametres.check_id(props.id_datacenter))
    throw new ParameterMisformed(
      'The props.id_datacenter parameter is misformed.'
    );
  if (!parametres.check_ids(props.professors))
    throw new ParameterMisformed(
      'The props.professors parameter is misformed.'
    );
  if (!parametres.check_ids(props.users))
    throw new ParameterMisformed('The props.users parameter is misformed.');
  if (typeof props.label_session !== 'string')
    throw new ParameterMisformed(
      'The props.label_session parameter is misformed.'
    );
  if (typeof props.label_application !== 'string')
    throw new ParameterMisformed(
      'The props.label_application parameter is misformed.'
    );
  if (!parametres.check_date(props.begin_date))
    throw new ParameterMisformed(
      'The props.begin_date parameter is misformed.'
    );
  if (!parametres.check_date(props.end_date))
    throw new ParameterMisformed('The props.end_date parameter is misformed.');

  // We schedule all applications for all users
  let promises = [];
  promises.push(
    fns.session_create({
      label: props.label_session,
      begin_date: props.begin_date,
      end_date: props.end_date,
      id_environment: props.id_environment,
    })
  );
  props.users.forEach((id_user) => {
    promises.push(
      fns.application_create({
        id_user,
        id_environment: props.id_environment,
        id_datacenter: props.id_datacenter,
        label: props.label_application,
        state_changed_date: props.begin_date,
      })
    );
  });

  const session = await Promise.all(promises).then((r) => {
    r[0].applications = r.slice(1);
    r[0].datacenter = r[1].datacenter;
    r[0].environment = r[1].environment;
    return r[0];
  });

  promises = [];
  props.professors.forEach((id_user) => {
    promises.push(
      fns.session_attribute_professor({
        id_session: session.id_session,
        id_user,
      })
    );
  });

  session.applications.forEach((app) => {
    promises.push(
      fns.session_attribute_user_and_application({
        id_session: session.id_session,
        id_user: app.id_user,
        id_application: app.id_application,
      })
    );
  });

  return await Promise.all(promises).then((r) => {
    r.forEach((att) => {
      if (att.id_application) session.users = [...session.users, att.user];
      else session.professors = [...session.professors, att.user];
    });
    return new Session(session);
  });
};

/**
 * Service that checks role of the user and then give the list of attributed sessions.
 * @param {*} props
 */
export const list = async function (
  props = {
    id_user: undefined,
  },
  fns = {
    user_get: user_service.get,
    session_list: session_builder.list,
    user_list: user_builder.get_list,
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

  // we check the role of the user
  const user_role = await fns.user_get({ id_user: props.id_user });
  if (!['PROFESSEUR', 'ADMINISTRATEUR'].includes(user_role.role))
    throw new UserIsNeitherProfOrAdmin(
      'The user is neither PROFESSEUR or ADMINISTRATEUR.'
    );

  const sessions = await Promise.resolve(
    fns.session_list({ id_user: props.id_user })
  );
  const unique_ids = [
    ...new Set([
      ...sessions.flatMap((session) =>
        session.users.map((user) => user.id_user)
      ),
      ...sessions.flatMap((session) =>
        session.professors.map((user) => user.id_user)
      ),
    ]),
  ];
  return await Promise.resolve(fns.user_list({ ids: unique_ids })).then(
    (result) => {
      for (const session of sessions) {
        for (let idx = 0; idx < session.users.length; idx++) {
          const user_id = session.users[idx].id_user;
          const corresponding_user = result.find((u) => u.id_user === user_id);
          if (corresponding_user) session.users[idx] = corresponding_user;
        }
      }
      for (const session of sessions) {
        for (let idx = 0; idx < session.professors.length; idx++) {
          const user_id = session.professors[idx].id_user;
          const corresponding_user = result.find((u) => u.id_user === user_id);
          if (corresponding_user) session.professors[idx] = corresponding_user;
        }
      }
      return sessions;
    }
  );
};

/**
 * Service that checks role of the user - and attribution for professeur- and then give informations about the session.
 * @param {*} props
 */
export const get = async function (
  props = {
    id_user: undefined,
    id_session: undefined,
  },
  fns = {
    user_get: user_service.get,
    session_get_on_professeur: session_builder.get_on_professeur,
    session_get_on_administrateur: session_builder.get_on_administrateur,
    user_list: user_builder.get_list,
    application_get: application_service.get,
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

  // we check the role of the user
  const user_role = await fns.user_get({ id_user: props.id_user });
  if (!['PROFESSEUR', 'ADMINISTRATEUR'].includes(user_role.role))
    throw new UserIsNeitherProfOrAdmin(
      'The user is neither PROFESSEUR or ADMINISTRATEUR.'
    );

  let promise;
  if (user_role.role === 'PROFESSEUR') {
    promise = fns.session_get_on_professeur({
      id_user: props.id_user,
      id_session: props.id_session,
    });
  } else {
    promise = fns.session_get_on_administrateur({
      id_session: props.id_session,
    });
  }

  const session = await Promise.resolve(promise);
  // Fetching users
  const unique_ids = [
    ...new Set([
      ...session.users.map((user) => user.id_user),
      ...session.professors.map((user) => user.id_user),
    ]),
  ];

  await Promise.resolve(fns.user_list({ ids: unique_ids })).then((result) => {
    for (let idx = 0; idx < session.users.length; idx++) {
      const user_id = session.users[idx].id_user;
      const corresponding_user = result.find((u) => u.id_user === user_id);
      if (corresponding_user) session.users[idx] = corresponding_user;
    }
    for (let idx = 0; idx < session.professors.length; idx++) {
      const user_id = session.professors[idx].id_user;
      const corresponding_user = result.find((u) => u.id_user === user_id);
      if (corresponding_user) session.professors[idx] = corresponding_user;
    }
  });

  // Fetching the applications
  const unique_ids_applications = [
    ...new Set([...session.applications.map((app) => app.id_application)]),
  ];
  const promises = unique_ids_applications.map((id) =>
    Promise.resolve(fns.application_get({ id_application: id }))
  );
  return await Promise.all(promises).then((apps) => {
    for (let idx = 0; idx < session.applications.length; idx++) {
      const app_id = session.applications[idx].id_application;
      const corresponding_app = apps.find(
        (app) => app.id_application === app_id
      );
      if (corresponding_app) session.applications[idx] = corresponding_app;
    }
    return session;
  });
};
