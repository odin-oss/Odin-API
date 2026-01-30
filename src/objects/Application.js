import CONFIG from '../config/config.js';
import moment from 'moment-timezone';
import { Environment } from './Environment.js';
import { Datacenter } from './Datacenter.js';
import { History } from './History.js';

export class Application {
  #id_application;
  #custom_label;
  #generated_label;
  #creation_date;
  #hash;
  #username;
  #password;
  #id_user;
  #id_environment;
  #state_application;
  #state_changed_date;
  #programming_shutdown_date;
  #environment;
  #datacenter;
  #history;

  constructor({
    id_application = null,
    custom_label = null,
    generated_label = null,
    creation_date = null,
    hash = null,
    username = null,
    password = null,
    id_user = null,
    id_environment = null,
    state_application = null,
    state_changed_date = null,
    programming_shutdown_date = null,
    environment = new Environment(),
    datacenter = new Datacenter(),
    history = new History(),
  } = {}) {
    this.#id_application = id_application;
    this.#custom_label = custom_label;
    this.#generated_label = generated_label;
    this.#creation_date = moment(creation_date).tz(CONFIG.timezone);
    this.#hash = hash;
    this.#username = username;
    this.#password = password;
    this.#id_user = id_user;
    this.#id_environment = id_environment;
    this.#state_application = state_application;
    this.#state_changed_date = moment(state_changed_date).tz(CONFIG.timezone);
    this.#programming_shutdown_date =
      programming_shutdown_date == null
        ? null
        : moment(programming_shutdown_date).tz(CONFIG.timezone);
    this.#environment = environment;
    this.#datacenter = datacenter;
    this.#history = history;
  }

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
          : moment(this.#programming_shutdown_date)
              .tz(CONFIG.timezone)
              .format(),
      state_application: this.#state_application,
      history: this.#history.public_format(),
    };
    for (const int of this.#environment.interfaces) {
      for (const port of int.ports) {
        if (port.port_type !== 'none') {
          format.interfaces.push({
            label: int.label,
            link: `https://apps.${this.#datacenter.label}.${this.#datacenter.provider}.${CONFIG.ms_apps_url}/${
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
          : moment(this.#programming_shutdown_date)
              .tz(CONFIG.timezone)
              .format(),
      environment: this.#environment.toJSON(),
      datacenter: this.#datacenter.toJSON(),
      history: this.#history.toJSON(),
    };
  }
}
