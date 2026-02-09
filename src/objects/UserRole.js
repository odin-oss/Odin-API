import z from 'zod';
import Guard from '../utils/guard.util.js';

export class UserRole {
  #id_role;
  #label;

  constructor(props) {
    const data = Guard.validateProps(UserRole.schema, props);
    this.#id_role = data.id_role;
    this.#label = data.label;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_role: z.number().int().positive(),
    label: z.string().min(1),
  });

  // Getters
  get id_role() {
    return this.#id_role;
  }

  get label() {
    return this.#label;
  }

  // Setters
  set id_role(value) {
    this.#id_role = value;
  }

  set label(value) {
    this.#label = value;
  }

  public_format() {
    return this.toJSON();
  }

  toJSON() {
    return {
      id_role: this.#id_role,
      label: this.#label,
    };
  }
}
