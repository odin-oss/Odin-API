export class ImageType {
  #id_type;
  #label;

  constructor({ id_type = null, label = null } = {}) {
    this.#id_type = id_type;
    this.#label = label;
  }

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
