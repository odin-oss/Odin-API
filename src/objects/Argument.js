import z from 'zod';
import Guard from '../utils/guard.util.js';

export default class Argument {
  #id_argument;
  #value;

  constructor(props) {
    const data = Guard.validateProps(Argument.schema, props);
    this.#id_argument = data.id_argument;
    this.#value = data.value;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_argument: z.coerce.number().int().positive().optional(),
    value: z.string().optional(),
  });

  get id_argument() {
    return this.#id_argument;
  }
  get value() {
    return this.#value;
  }

  set id_argument(id_argument) {
    this.#id_argument = id_argument;
  }
  set value(value) {
    this.#value = value;
  }

  toJSON() {
    return {
      id_argument: this.#id_argument,
      value: this.#value,
    };
  }
}
