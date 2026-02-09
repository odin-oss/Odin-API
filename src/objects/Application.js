import CONFIG from '../config/config.js';
import moment from 'moment-timezone';
import { Environment } from './Environment.js';
import { Datacenter } from './Datacenter.js';
import { History } from './History.js';
import z from 'zod';
import Guard from '../utils/guard.service.js';

export class Application {
  #id_application;
  #id_user;
  #id_environment;
  #custom_label;
  #generated_label;
  #creation_date;
  #hash;
  #username;
  #password;
  #state_application;
  #state_changed_date;
  #programming_shutdown_date;
  #environment;
  #datacenter;
  #history;

  constructor(props) {
    const data = Guard.validateProps(Application.schema, props);
    this.#id_application = data.id_application;
    this.#custom_label = data.custom_label;
    this.#generated_label = data.generated_label;
    this.#creation_date = data.creation_date;
    this.#hash = data.hash;
    this.#username = data.username;
    this.#password = data.password;
    this.#id_user = data.id_user;
    this.#id_environment = data.id_environment;
    this.#state_application = data.state_application;
    this.#state_changed_date = data.state_changed_date;
    this.#programming_shutdown_date = data.programming_shutdown_date;
    this.#environment = data.environment;
    this.#datacenter = data.datacenter;
    this.#history = data.history;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_application: z.number(),
    custom_label: z.string(),
    generated_label: z.string(),
    creation_date: z
      .string()
      .refine((val) => moment(val).isValid(), {
        message: 'Invalid date format',
      })
      .transform((val) => moment(val).tz(CONFIG.APP_TZ)),
    hash: z.string(),
    username: z.string(),
    password: z.string(),
    id_user: z.number(),
    id_environment: z.number(),
    state_application: z.string(),
    state_changed_date: z
      .string()
      .refine((val) => moment(val).isValid(), {
        message: 'Invalid date format',
      })
      .transform((val) => moment(val).tz(CONFIG.APP_TZ)),
    programming_shutdown_date: z
      .string()
      .nullable()
      .refine((val) => val === null || moment(val).isValid(), {
        message: 'Invalid date format',
      })
      .transform((val) =>
        val === null ? null : moment(val).tz(CONFIG.APP_TZ)
      ),
    environment: z.instanceof(Environment),
    datacenter: z.instanceof(Datacenter),
    history: z.instanceof(History),
  });

  // Getters
  get id_application() {
    return this.#id_application;
  }

  get custom_label() {
    return this.#custom_label;
  }

  get generated_label() {
    return this.#generated_label;
  }

  get creation_date() {
    return this.#creation_date;
  }

  get hash() {
    return this.#hash;
  }

  get username() {
    return this.#username;
  }

  get password() {
    return this.#password;
  }

  get id_user() {
    return this.#id_user;
  }

  get id_environment() {
    return this.#id_environment;
  }

  get state_application() {
    return this.#state_application;
  }

  get state_changed_date() {
    return this.#state_changed_date;
  }

  get programming_shutdown_date() {
    return this.#programming_shutdown_date;
  }

  get environment() {
    return this.#environment;
  }

  get datacenter() {
    return this.#datacenter;
  }

  get history() {
    return this.#history;
  }

  // Setters
  set id_application(value) {
    this.#id_application = value;
  }

  set custom_label(value) {
    this.#custom_label = value;
  }

  set generated_label(value) {
    this.#generated_label = value;
  }

  set creation_date(value) {
    this.#creation_date = value;
  }

  set hash(value) {
    this.#hash = value;
  }

  set username(value) {
    this.#username = value;
  }

  set password(value) {
    this.#password = value;
  }

  set id_user(value) {
    this.#id_user = value;
  }

  set id_environment(value) {
    this.#id_environment = value;
  }

  set state_application(value) {
    this.#state_application = value;
  }

  set state_changed_date(value) {
    this.#state_changed_date = value;
  }

  set programming_shutdown_date(value) {
    this.#programming_shutdown_date = value;
  }

  set environment(value) {
    this.#environment = value;
  }

  set datacenter(value) {
    this.#datacenter = value;
  }

  set history(value) {
    this.#history = value;
  }

  public_format() {
    const format = {
      interfaces: [],
      id_application: this.#id_application,
      environment: this.#environment.label,
      id_environment: this.#environment.id_environment,
      datacenter: this.#datacenter.public_format(),
      custom_label: this.#custom_label,
      generated_label: this.#generated_label,
      username: this.#username,
      password: this.#password,
      hash: this.#hash,
      icon: this.#environment.icon,
      programming_shutdown_date:
        this.#programming_shutdown_date == null
          ? null
          : moment(this.#programming_shutdown_date).tz(CONFIG.APP_TZ).format(),
      state_application: this.#state_application,
      history: this.#history.public_format(),
    };
    for (const int of this.#environment.interfaces) {
      for (const port of int.ports) {
        if (port.port_type !== 'none') {
          format.interfaces.push({
            label: int.label,
            link: `https://apps.${this.#datacenter.label}.${this.#datacenter.provider}.${CONFIG.APPS_INGRESS_URL}/${
              this.#hash
            }/${int.label.toLowerCase()}-${port.label.toLowerCase()}/`,
            service: port.label,
            display_name: port.display_name,
            icon: port.icon,
          });
        }
      }
    }
    return format;
  }

  toJSON() {
    return {
      id_application: this.#id_application,
      custom_label: this.#custom_label,
      generated_label: this.#generated_label,
      creation_date: this.#creation_date.format(),
      hash: this.#hash,
      username: this.#username,
      password: this.#password,
      id_user: this.#id_user,
      id_environment: this.#id_environment,
      state_application: this.#state_application,
      state_changed_date: this.#state_changed_date.format(),
      programming_shutdown_date:
        this.#programming_shutdown_date == null
          ? null
          : moment(this.#programming_shutdown_date).tz(CONFIG.APP_TZ).format(),
      environment: this.#environment.toJSON(),
      datacenter: this.#datacenter.toJSON(),
      history: this.#history.toJSON(),
    };
  }
}
