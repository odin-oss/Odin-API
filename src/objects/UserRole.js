export class UserRole {
  #id_role;
  #label;

  constructor({ id_role = undefined, label = undefined } = {}) {
    this.#id_role = id_role;
    this.#label = label;
  }

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
