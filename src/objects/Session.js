import moment from 'moment-timezone';
import { Datacenter } from './Datacenter.js';
import { Environment } from './Environment.js';
import CONFIG from '../config/config.js';
import z from 'zod';
import { Application } from './Application.js';
import { User } from './User.js';
import Guard from '../utils/guard.util.js';

/**
 * Session class representing a session entity.
 */
export class Session {
  #id_session;
  #label;
  #begin_date;
  #end_date;
  #environment;
  #applications; // linked to users
  #users; // every user that has an application in this session
  #professors;
  #datacenter;

  constructor(props) {
    const data = Guard.validateProps(Session.schema, props);
    this.#id_session = data.id_session;
    this.#label = data.label;
    this.#begin_date = data.begin_date;
    this.#end_date = data.end_date;
    this.#environment = data.environment;
    this.#applications = data.applications;
    this.#users = data.users;
    this.#professors = data.professors;
    this.#datacenter = data.datacenter;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_session: z.number().int().optional(),
    label: z.string().min(1).trim(),
    begin_date: z
      .refine((val) => moment(val).isValid(), {
        message: 'Invalid date format',
      })
      .transform((val) => moment(val).tz(CONFIG.APP_TZ))
      .nullable(),
    end_date: z
      .refine((val) => moment(val).isValid(), {
        message: 'Invalid date format',
      })
      .transform((val) => moment(val).tz(CONFIG.APP_TZ))
      .nullable(),
    environment: z.instanceof(Environment).default(undefined),
    applications: z.array(z.instanceof(Application)).default([]),
    users: z.array(z.instanceof(User)).default([]),
    professors: z.array(z.instanceof(User)).default([]),
    datacenter: z.instanceof(Datacenter).default(undefined),
  });

  // Getters
  get id_session() {
    return this.#id_session;
  }

  get label() {
    return this.#label;
  }

  get begin_date() {
    return this.#begin_date;
  }

  get end_date() {
    return this.#end_date;
  }

  get environment() {
    return this.#environment;
  }

  get applications() {
    return this.#applications;
  }

  get users() {
    return this.#users;
  }

  get professors() {
    return this.#professors;
  }

  get datacenter() {
    return this.#datacenter;
  }

  // Setters
  set id_session(value) {
    this.#id_session = value;
  }

  set label(value) {
    this.#label = value;
  }

  set begin_date(value) {
    this.#begin_date = value;
  }

  set end_date(value) {
    this.#end_date = value;
  }

  set environment(value) {
    this.#environment = value;
  }

  set applications(value) {
    this.#applications = value;
  }

  set users(value) {
    this.#users = value;
  }

  set professors(value) {
    this.#professors = value;
  }

  set datacenter(value) {
    this.#datacenter = value;
  }

  toJSON() {
    return {
      id_session: this.#id_session,
      label: this.#label,
      begin_date: moment(this.#begin_date).tz(CONFIG.APP_TZ),
      end_date: moment(this.#end_date).tz(CONFIG.APP_TZ),
      environment: this.#environment.toJSON(),
      applications: this.#applications.map((app) => app.toJSON()),
      users: this.#users.map((user) => user.toJSON()),
      professors: this.#professors.map((prof) => prof.toJSON()),
      datacenter: this.#datacenter.toJSON(),
    };
  }

  // Methods
  public_format() {
    return {
      id_session: this.#id_session,
      label: this.#label,
      begin_date: moment(this.#begin_date).tz(CONFIG.APP_TZ),
      end_date: moment(this.#end_date).tz(CONFIG.APP_TZ),
      environment: this.#environment.public_format(),
      applications: this.#applications.map((app) => app.public_format()),
      users: this.#users.map((user) => user.public_format()),
      professors: this.#professors.map((prof) => prof.public_format()),
      datacenter: this.#datacenter?.public_format(),
    };
  }
}
