import * as environment_builder from '../builders/environment.builder.js';

export class Environment {
  #id_environment;
  #label;
  #icon;
  #interfaces;

  constructor({
    id_environment = null,
    label = '',
    interfaces = [],
    icon = '',
  } = {}) {
    this.#id_environment = id_environment;
    this.#label = label;
    this.#interfaces = interfaces;
    this.#icon = icon;
  }

  // Getters
  get id_environment() {
    return this.#id_environment;
  }
  get label() {
    return this.#label;
  }
  get interfaces() {
    return this.#interfaces;
  }
  get icon() {
    return this.#icon;
  }

  // Setters
  set id_environment(value) {
    this.#id_environment = value;
  }
  set label(value) {
    this.#label = value;
  }
  set interfaces(value) {
    this.#interfaces = value;
  }

  async fetchInterfaces(
    fns = {
      environment_get: environment_builder.get,
    }
  ) {
    return await Promise.resolve(
      fns.environment_get({
        id_environment: this.#id_environment,
      })
    ).then((env) => {
      this.#interfaces = env.#interfaces;
      return this;
    });
  }

  // Convert to JSON
  public_format() {
    return {
      id_environment: this.#id_environment,
      label: this.#label,
      icon: this.#icon,
      interfaces: this.#interfaces.map((iface) => iface.public_format()),
    };
  }
  toJSON() {
    return {
      id_environment: this.#id_environment,
      label: this.#label,
      icon: this.#icon,
      interfaces: this.#interfaces.map((iface) => iface.toJSON()),
    };
  }
}
