import CONFIG from '../config/config.js';
import moment from 'moment-timezone';

export class History {
  #records;

  constructor({ records = [] } = {}) {
    this.#records = records;
  }

  // Getters
  get records() {
    return this.#records;
  }

  // Setters
  set records(value) {
    this.#records = value;
  }

  public_format() {
    return {
      records: this.#records.map((r) => r.public_format()),
    };
  }

  toJSON() {
    return {
      records: this.#records.map((r) => r.toJSON()),
    };
  }
}

export class Record {
  #id_user;
  #id_application;
  #id_history;
  #datetime;

  constructor({
    id_user = undefined,
    id_application = undefined,
    id_history = undefined,
    datetime = undefined,
  } = {}) {
    this.#id_user = id_user;
    this.#id_application = id_application;
    this.#id_history = id_history;
    this.#datetime = datetime;
  }

  // Getters
  get id_user() {
    return this.#id_user;
  }
  get id_application() {
    return this.#id_application;
  }
  get id_history() {
    return this.#id_history;
  }
  get datetime() {
    return this.#datetime;
  }

  // Setters
  set id_user(value) {
    this.#id_user = value;
  }
  set id_application(value) {
    this.#id_application = value;
  }
  set id_history(value) {
    this.#id_history = value;
  }
  set datetime(value) {
    this.#datetime = value;
  }

  public_format() {
    return {
      id_user: this.#id_user,
      datetime: moment(this.#datetime).tz(CONFIG.APP_TZ),
      id_application: this.#id_application,
      id_history: this.#id_history,
    };
  }

  toJSON() {
    return {
      id_user: this.#id_user,
      datetime: moment(this.#datetime).tz(CONFIG.APP_TZ),
      id_application: this.#id_application,
      id_history: this.#id_history,
    };
  }
}
