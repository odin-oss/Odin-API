import z from "zod";
import PortType from "./Port_type.js";
import Guard from "../utils/guard.util.js";

export default class Port {
  #id_port_type;
  #port;
  #label;
  #port_type;
  #display_name;
  #icon;

  constructor(props) {
    const data = Guard.validateProps(Port.schema, props);
    this.#id_port_type = data.id_port_type;
    this.#port = data.port;
    this.#label = data.label;
    this.#port_type = data.port_type;
    this.#icon = data.icon;
    this.#display_name = data.display_name;
  }
// Zod Schema for object validation
  static schema = z.object({
    id_port_type: z.coerce.number().int().positive().optional(),
    port: z.coerce.number().positive().optional(),
    label: z.string().optional(),
    icon: z.string().optional(),
    display_name: z.string().optional(),
    port_type: z.lazy(() => z.instanceof(PortType)).optional()
  });

  get id_port_type() {
    return this.#id_port_type;
  }

  get port() {
    return this.#port;
  }

  get label() {
    return this.#label;
  }

  get port_type() {
    return this.#port_type;
  }

  get icon() {
    return this.#icon;
  }

  get display_name() {
    return this.#display_name;
  }

  set id_port_type(id_port_type) {
    this.#id_port_type = id_port_type;
  }

  set port(port) {
    this.#port = port;
  }

  set label(label) {
    this.#label = label;
  }

  set port_type(port_type) {
    this.#port_type = port_type;
  }

  set icon(icon) {
    this.#icon = icon;
  }

  set display_name(display_name) {
    this.#display_name = display_name;
  }

  toJSON() {
    return {
      id_port_type: this.#id_port_type,
      port: this.#port,
      label: this.#label,
      port_type: this.#port_type,
      icon: this.#icon,
      display_name: this.#display_name,
    };
  }
}
