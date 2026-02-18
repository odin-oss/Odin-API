import z from 'zod';
import * as environment_builder from '../builders/environment.builder.js';
import Guard from '../utils/guard.util.js';
import { Interface } from './Interface.js';

export class Environment {
  #id_environment;
  #label;
  #icon;
  #interfaces;

  constructor(props) {
    const data = Guard.validateProps(Environment.schema, props);
    this.#id_environment = data.id_environment;
    this.#label = data.label;
    this.#interfaces = data.interfaces;
    this.#icon = data.icon;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_environment: z.number().int().positive().optional(),
    label: z.string().min(1).trim().default(''),
    icon: z.string().min(1).trim().default(''),
    interfaces: z.array(z.instanceof(Interface)).default([]),
  });

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
