import z from 'zod';
import CONFIG from '../config/config.js';
import moment from 'moment-timezone';
import Guard from '../utils/guard.util.js';

export class Application_export {
  #id_export;
  #id_application;
  #init_date;
  #expiration_date;
  #id_provider;
  #id_enum_export_state;
  #status;
  #download_link;
  #previous_export_deleted;

  constructor(props) {
    const data = Guard.validateProps(Application_export.schema, props);
    this.#id_export = data.id_export;
    this.#id_application = data.id_application;
    this.#init_date = data.init_date;
    this.#expiration_date = data.expiration_date;
    this.#id_provider = data.id_provider;
    this.#id_enum_export_state = data.id_enum_export_state;
    this.#status = data.status;
    this.#download_link = data.download_link;
    this.#previous_export_deleted = data.previous_export_deleted;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_export: z.number().int().optional(),
    id_application: z.number().int().optional(),
    init_date: z
      .string()
      .refine((val) => moment(val).isValid(), {
        message: 'Invalid date format',
      })
      .transform((val) => moment(val).tz(CONFIG.APP_TZ))
      .nullable(),
    expiration_date: z
      .string()
      .refine((val) => moment(val).isValid(), {
        message: 'Invalid date format',
      })
      .transform((val) => moment(val).tz(CONFIG.APP_TZ))
      .nullable(),
    id_provider: z.number().int().optional(),
    id_enum_export_state: z.number().int().optional(),
    status: z.string().min(1).nullable(),
    download_link: z.string().min(1).nullable(),
    previous_export_deleted: z.boolean().optional(),
  });

  // Getters
  get id_export() {
    return this.#id_export;
  }

  get id_application() {
    return this.#id_application;
  }

  get init_date() {
    return this.#init_date;
  }

  get expiration_date() {
    return this.#expiration_date;
  }

  get id_provider() {
    return this.#id_provider;
  }

  get id_enum_export_state() {
    return this.#id_enum_export_state;
  }

  get status() {
    return this.#status;
  }

  get download_link() {
    return this.#download_link;
  }

  get previous_export_deleted() {
    return this.#previous_export_deleted;
  }

  // Setters
  set id_export(id_export) {
    this.#id_export = id_export;
  }

  set id_application(id_application) {
    this.#id_application = id_application;
  }

  set init_date(init_date) {
    this.#init_date = init_date;
  }

  set expiration_date(expiration_date) {
    this.#expiration_date = expiration_date;
  }

  set id_provider(id_provider) {
    this.#id_provider = id_provider;
  }

  set id_enum_export_state(id_enum_export_state) {
    this.#id_enum_export_state = id_enum_export_state;
  }

  set status(status) {
    this.#status = status;
  }

  set download_link(download_link) {
    this.#download_link = download_link;
  }

  set previous_export_deleted(previous_export_deleted) {
    this.#previous_export_deleted = previous_export_deleted;
  }

  public_format() {
    const format = {
      id_export: this.#id_export,
      id_application: this.#id_application,
      init_date: this.#init_date.format(),
      expiration_date: this.#expiration_date.format(),
      id_enum_export_state: this.#id_enum_export_state,
      status: this.#status,
      download_link: this.#download_link,
      previous_export_deleted: this.#previous_export_deleted,
    };
    return format;
  }

  toJSON() {
    return {
      id_export: this.#id_export,
      id_application: this.#id_application,
      init_date: this.#init_date.format(),
      expiration_date: this.#expiration_date.format(),
      id_provider: this.#id_provider,
      id_enum_export_state: this.#id_enum_export_state,
      status: this.#status,
      download_link: this.#download_link,
      previous_export_deleted: this.#previous_export_deleted,
    };
  }
}
