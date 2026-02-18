import z from 'zod';
import CONFIG from '../config/config.js';
import moment from 'moment-timezone';
import Guard from '../utils/guard.util.js';

export class Record {
  #id_user;
  #id_application;
  #id_history;
  #datetime;

  constructor(props) {
    const data = Guard.validateProps(Record.schema, props);
    this.#id_user = data.id_user;
    this.#id_application = data.id_application;
    this.#id_history = data.id_history;
    this.#datetime = data.datetime;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_user: z.number().int().positive().optional(),
    id_application: z.number().int().positive().optional(),
    id_history: z.number().int().positive().optional(),
    datetime: z
      .refine((val) => moment(val).isValid(), {
        message: 'Invalid date format',
      })
      .transform((val) => moment(val).tz(CONFIG.APP_TZ)),
  });

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

export class History {
  #records;

  constructor(props = {}) {
    const data = Guard.validateProps(History.schema, props);
    this.#records = data.records;
  }

  // Zod Schema for object validation
  static schema = z.object({
    records: z.array(z.instanceof(Record)).default([]),
  });

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
