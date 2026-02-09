import z from 'zod';
import Guard from '../utils/guard.service.js';

export class RandomDictionary {
  #words;

  constructor(props) {
    const data = Guard.validateProps(RandomDictionary.schema, props);
    this.#words = data.words;
  }

  static schema = z.object({
    words: z.array(z.string().min(1)),
  });

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
