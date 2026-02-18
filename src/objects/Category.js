import z from 'zod';
import Guard from '../utils/guard.util.js';
import { Environment } from './Environment.js';

export class Category {
  #id_category;
  #label;
  #google_material_icon;
  #environments;

  constructor(props) {
    const data = Guard.validateProps(Category.schema, props);
    this.#id_category = data.id_category;
    this.#label = data.label;
    this.#google_material_icon = data.google_material_icon;
    this.#environments = data.environments;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_category: z.number().int().positive(),
    label: z.string().min(1).trim(),
    google_material_icon: z.string().min(1).trim(),
    environments: z.array(z.instanceof(Environment)).default([]),
  });

  // Getters
  get id_category() {
    return this.#id_category;
  }

  get label() {
    return this.#label;
  }

  get environments() {
    return this.#environments;
  }

  get google_material_icon() {
    return this.#google_material_icon;
  }

  // Setters
  set id_category(value) {
    this.#id_category = value;
  }

  set label(value) {
    this.#label = value;
  }

  set environments(value) {
    this.#environments = value;
  }

  set google_material_icon(value) {
    this.#google_material_icon = value;
  }

  public_format() {
    return {
      id_category: this.#id_category,
      label: this.#label,
      google_material_icon: this.#google_material_icon,
      environments: this.#environments.map((env) => env.public_format()),
    };
  }
  toJSON() {
    return {
      id_category: this.#id_category,
      label: this.#label,
      google_material_icon: this.#google_material_icon,
      environments: this.#environments.map((env) =>
        env.toJSON ? env.toJSON() : env
      ),
    };
  }
}
