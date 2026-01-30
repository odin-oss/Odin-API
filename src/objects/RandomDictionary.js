export class RandomDictionary {
  #words;

  constructor({ words = [] } = {}) {
    this.#words = words;
  }

  // Getters
  get words() {
    return this.#words;
  }

  // Setters
  set words(value = []) {
    this.#words = value;
  }

  add(word = '') {
    this.#words.push(word);
  }

  toJSON() {
    return {
      words: this.#words,
    };
  }
}
