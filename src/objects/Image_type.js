import z from 'zod';
import Guard from '../utils/guard.util.js';

export class ImageType {
  #id_type;
  #label;

  constructor(props) {
    const data = Guard.validateProps(ImageType.schema, props);
    this.#id_type = data.id_type;
    this.#label = data.label;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_type: z.coerce.number().int().positive(),
    label: z.preprocess((val) => String(val).replace(/[^a-zA-Z0-9-]/g, '').toLowerCase(), z.string().min(2).max(255)),
  });

  // Getters
  get id_type() {
    return this.#id_type;
  }

  get label() {
    return this.#label;
  }

  // Setters
  set id_type(value) {
    this.#id_type = value;
  }

  set label(value) {
    this.#label = value;
  }

  toJSON() {
    return {
      id_type: this.#id_type,
      label: this.#label,
    };
  }
}
