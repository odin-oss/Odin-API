import z from 'zod';
import Guard from '../utils/guard.util.js';

export class Datacenter {
  #id_datacenter;
  #label;
  #provider;
  #city;

  constructor(props) {
    const data = Guard.validateProps(Datacenter.schema, props);
    this.#id_datacenter = data.id_datacenter;
    this.#label = data.label;
    this.#provider = data.provider;
    this.#city = data.city;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_datacenter: z.number().int().positive(),
    label: z.string().min(1).trim(),
    provider: z.string().min(1).trim(),
    city: z.string().min(1).trim(),
  });

  // Getters
  get id_datacenter() {
    return this.#id_datacenter;
  }

  get label() {
    return this.#label;
  }

  get provider() {
    return this.#provider;
  }

  get city() {
    return this.#city;
  }

  // Setters
  set id_datacenter(value) {
    this.#id_datacenter = value;
  }

  set label(value) {
    this.#label = value;
  }

  set provider(value) {
    this.#provider = value;
  }

  set city(value) {
    this.#city = value;
  }

  public_format() {
    const format = {
      id_datacenter: this.#id_datacenter,
      label: this.#label,
      provider: this.#provider,
      city: this.#city,
    };
    return format;
  }

  toJSON() {
    return {
      id_datacenter: this.#id_datacenter,
      label: this.#label,
      provider: this.#provider,
      city: this.#city,
    };
  }
}
