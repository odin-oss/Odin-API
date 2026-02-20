import z from 'zod';
import Guard from '../utils/guard.util.js';

export default class VariableEnvironment {
  #id_variable_environment;
  #key;
  #value;

  constructor(props) {
    const data = Guard.validateProps(VariableEnvironment.schema, props);
    this.#id_variable_environment = data.id_variable_environment;
    this.#key = data.key;
    this.#value = data.value;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_variable_environment: z.coerce.number().int().positive().optional(),
    key: z.string().optional(),
    value: z.string().optional(),
  });

  get id_variable_environment() {
    return this.#id_variable_environment;
  }
  get key() {
    return this.#key;
  }
  get value() {
    return this.#value;
  }

  set id_variable_environment(id_variable_environment) {
    this.#id_variable_environment = id_variable_environment;
  }
  set key(key) {
    this.#key = key;
  }
  set value(value) {
    this.#value = value;
  }

  toJSON() {
    return {
      id_variable_environment: this.#id_variable_environment,
      key: this.#key,
      value: this.#value,
    };
  }
}
