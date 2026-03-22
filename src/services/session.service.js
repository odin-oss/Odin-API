import * as application_service from '../services/applications.service.js';
import * as session_builder from '../builders/session.builder.js';
import * as user_service from '../services/user.service.js';
import * as user_builder from '../builders/user.builder.js';
import { UserIsNeitherProfOrAdmin } from '../utils/errors.util.js';
import { Session } from '../objects/Session.js';
import Guard from '../utils/guard.util.js';
import z from 'zod';
import moment from 'moment-timezone';
import CONFIG from '../config/config.js';

/**
 * Service that execute the creation workflow of an application.
 * @param {Number} id_environment id of environment to attach to this session.
 * @param {Number} id_datacenter id of datacenter that will host this session.
 * @param {String} label_session label of the session.
 * @param {String} label_application label of the application.
 * @param {String || moment} begin_date date when the session will be starting.
 * @param {String || moment} end_date date when the session will be ending.
 * @param {Array<Number>} users ids of users that will owned an application in this session.
 * @param {Array<Number>} professors ids of users that will act as professor in the session.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Session}
 */
export const create = async function (
  props,
  fns = {
    application_create: application_service.create,
    session_create: session_builder.create,
    session_attribute_professor: session_builder.attribute_professor,
    session_attribute_user_and_application:
      session_builder.attribute_user_and_application,
  }
) {
  const schema = z.object({
    id_environment: z.number().positive(),
    id_datacenter: z.number().positive(),
    label_session: z.string(),
    label_application: z.string(),
    begin_date: z
      .refine((val) => moment(val).isValid(), {
        message: 'Invalid date format',
      })
      .transform((val) => moment(val).tz(CONFIG.APP_TZ)),
    end_date: z
      .refine((val) => moment(val).isValid(), {
        message: 'Invalid date format',
      })
      .transform((val) => moment(val).tz(CONFIG.APP_TZ)),
    users: z.array(z.coerce.number().int().positive()).default([]),
    professors: z.array(z.coerce.number().int().positive()).default([]),
  });
  const data = Guard.validateProps(schema, props);

  let promises = [];
  promises.push(
    fns.session_create({
      ...data,
      label: data.label_session,
    })
  );
  props.users.forEach((id_user) => {
    promises.push(
      fns.application_create({
        ...data,
        id_user,
        label: data.label_application,
        state_changed_date: data.begin_date,
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
        id_user: app.id_user,
        id_application: app.id_application,
        id_session: session.id_session,
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
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Array<Session>}
 */
export const list = async function (
  props,
  fns = {
    user_get: user_service.get,
    session_list: session_builder.list,
    user_list: user_builder.get_list,
  }
) {
  const schema = z.object({
    id_user: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);

  // we check the role of the user
  const user_role = await fns.user_get({ ...data });
  if (!['TEACHER', 'ADMINISTRATOR'].includes(user_role.role))
    throw new UserIsNeitherProfOrAdmin(
      'The user is neither TEACHER or ADMINISTRATOR.'
    );

  const sessions = await fns.session_list({ ...data });
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
  return await fns.user_list({ ids: unique_ids }).then((result) => {
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
  });
};

/**
 * Service that checks role of the user - and attribution for TEACHER- and then give informations about the session.
 * @param {Number} id_application id of the application to get
 * @param {Number} id_session id of the session in which to get the application.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {}
 */
export const get = async function (
  props,
  fns = {
    user_get: user_service.get,
    session_get_on_teacher: session_builder.get_on_teacher,
    session_get_on_administrator: session_builder.get_on_administrator,
    user_list: user_builder.get_list,
    application_get: application_service.get,
  }
) {
  const schema = z.object({
    id_user: z.coerce.number().int().positive(),
    id_session: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  const user_role = await fns.user_get({ ...data });
  if (!['TEACHER', 'ADMINISTRATOR'].includes(user_role.role))
    throw new UserIsNeitherProfOrAdmin(
      'The user is neither TEACHER or ADMINISTRATOR.'
    );

  let promise;
  if (user_role.role === 'TEACHER') {
    promise = fns.session_get_on_teacher({ ...data });
  } else {
    promise = fns.session_get_on_administrator({ ...data });
  }

  const session = await promise;
  // Fetching users
  const unique_ids = [
    ...new Set([
      ...session.users.map((user) => user.id_user),
      ...session.professors.map((user) => user.id_user),
    ]),
  ];

  await fns.user_list({ ids: unique_ids }).then((result) => {
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
    fns.application_get({ id_application: id })
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
