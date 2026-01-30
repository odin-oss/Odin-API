export class Datacenter {
  #id_datacenter;
  #label;
  #provider;
  #city;

  constructor({
    id_datacenter = null,
    label = null,
    provider = null,
    city = null,
  } = {}) {
    this.#id_datacenter = id_datacenter;
    this.#label = label;
    this.#provider = provider;
    this.#city = city;
  }

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
