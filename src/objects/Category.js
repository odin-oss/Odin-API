export class Category {
  #id_category;
  #label;
  #google_material_icon;
  #environments;

  constructor({
    id_category = null,
    label = null,
    environments = [],
    google_material_icon = '',
  } = {}) {
    this.#id_category = id_category;
    this.#label = label;
    this.#google_material_icon = google_material_icon;
    this.#environments = environments;
  }

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
