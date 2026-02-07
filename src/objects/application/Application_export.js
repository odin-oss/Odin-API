import CONFIG from '../../config/config.js';
import moment from 'moment-timezone';

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

  constructor({
    id_export = null,
    id_application = null,
    init_date = null,
    expiration_date = null,
    id_provider = null,
    id_enum_export_state = null,
    status = null,
    download_link = null,
    previous_export_deleted = false,
  } = {}) {
    this.#id_export = id_export;
    this.#id_application = id_application;
    this.#init_date = moment(init_date).tz(CONFIG.APP_TZ);
    this.#expiration_date = moment(expiration_date).tz(CONFIG.APP_TZ);
    this.#id_provider = id_provider;
    this.#id_enum_export_state = id_enum_export_state;
    this.#status = status;
    this.#download_link = download_link;
    this.#previous_export_deleted = previous_export_deleted;
  }

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
