import z from 'zod';
import Guard from '../utils/guard.util.js';

export default class NodeSelector {
  #id_node_selector;
  #value;
  #key;

  constructor(props) {
    const data = Guard.validateProps(NodeSelector.schema, props);
    this.#id_node_selector = data.id_node_selector;
    this.#value = data.value;
    this.#key = data.key;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_node_selector: z.coerce.number().int().positive().optional(),
    key: z.string().optional(),
    value: z.string().optional(),
  });
  get id_node_selector() {
    return this.#id_node_selector;
  }
  get value() {
    return this.#value;
  }
  get key() {
    return this.#key;
  }

  set id_node_selector(id_node_selector) {
    this.#id_node_selector = id_node_selector;
  }
  set value(value) {
    this.#value = value;
  }
  set key(key) {
    this.#key = key;
  }

  toJSON() {
    return {
      id_node_selector: this.#id_node_selector,
      value: this.#value,
      key: this.#key,
    };
  }
}
