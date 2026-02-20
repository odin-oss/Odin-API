import z from "zod";
import Guard from "../utils/guard.util.js";

export default class PortType {
    #id_port_type;
    #label;

    constructor(props) {
        const data = Guard.validateProps(PortType.schema, props);
        this.#id_port_type = data.id_port_type;
        this.#label = data.label;
    }

    // Zod Schema for object validation
    static schema = z.object({
        id_port_type: z.coerce.number().int().positive().optional(),
        label: z.string().optional(),
    });

    get id_port_type() {
        return this.#id_port_type;
    }

    get label() {
        return this.#label;
    }

    set id_port_type(id_port_type) {
        this.#id_port_type = id_port_type;
    }

    set label(label) {
        this.#label = label;
    }

    toJSON() {
        return {
            id_port_type: this.#id_port_type,
            label: this.#label,
        };
    }
}
