import z from 'zod';
import Guard from '../utils/guard.util.js';

export class Interface {
  #id_interface;
  #label;
  #default_label;
  #registry_link;
  #exec_command;
  #service_command;
  #privileged;
  #readiness_probe_initial_delay;
  #liveness_probe_initial_delay;
  #readiness_probe_period;
  #liveness_probe_period;
  #id_type;
  #label_type_image;
  #need_compute_gpu;
  #need_graphical_rendering_gpu;
  #ram_request;
  #ram_limit;
  #cpu_request;
  #cpu_limit;
  #args;
  #node_selectors;
  #ports;
  #envs;

  constructor(props) {
    const data = Guard.validateProps(Interface.schema, props);
    this.#id_interface = data.id_interface;
    this.#label = data.label;
    this.#default_label = data.default_label;
    this.#registry_link = data.registry_link;
    this.#exec_command = data.exec_command;
    this.#service_command = data.service_command;
    this.#privileged = data.privileged;
    this.#readiness_probe_initial_delay = data.readiness_probe_initial_delay;
    this.#liveness_probe_initial_delay = data.liveness_probe_initial_delay;
    this.#readiness_probe_period = data.readiness_probe_period;
    this.#liveness_probe_period = data.liveness_probe_period;
    this.#id_type = data.id_type;
    this.#label_type_image = data.label_type_image;
    this.#need_compute_gpu = data.need_compute_gpu;
    this.#need_graphical_rendering_gpu = data.need_graphical_rendering_gpu;
    this.#ram_request = data.ram_request;
    this.#ram_limit = data.ram_limit;
    this.#cpu_request = data.cpu_request;
    this.#cpu_limit = data.cpu_limit;
    this.#args = data.args;
    this.#node_selectors = data.node_selectors;
    this.#ports = data.ports;
    this.#envs = data.envs;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_interface: z.number().int().optional(),
    id_type: z.number().int().optional(),
    label: z.string().default(''),
    default_label: z.string().default(''),
    registry_link: z.string().default(''),
    exec_command: z.string().default(''),
    service_command: z.string().default(''),
    label_type_image: z.string().default(''),
    ram_request: z.string().default(''),
    ram_limit: z.string().default(''),
    cpu_request: z.string().default(''),
    cpu_limit: z.string().default(''),
    privileged: z.boolean().default(false),
    need_compute_gpu: z.boolean().default(false),
    need_graphical_rendering_gpu: z.boolean().default(false),
    readiness_probe_initial_delay: z.number().nonnegative().default(0),
    liveness_probe_initial_delay: z.number().nonnegative().default(0),
    readiness_probe_period: z.number().nonnegative().default(0),
    liveness_probe_period: z.number().nonnegative().default(0),
    args: z.array(z.string()).default([]),
    node_selectors: z.array(z.any()).default([]),
    ports: z.array(z.any()).default([]),
    envs: z.array(z.any()).default([]),
  });

  // Getters
  get id_interface() {
    return this.#id_interface;
  }
  get label() {
    return this.#label;
  }
  get default_label() {
    return this.#default_label;
  }
  get registry_link() {
    return this.#registry_link;
  }
  get exec_command() {
    return this.#exec_command;
  }
  get service_command() {
    return this.#service_command;
  }
  get privileged() {
    return this.#privileged;
  }
  get readiness_probe_initial_delay() {
    return this.#readiness_probe_initial_delay;
  }
  get liveness_probe_initial_delay() {
    return this.#liveness_probe_initial_delay;
  }
  get readiness_probe_period() {
    return this.#readiness_probe_period;
  }
  get liveness_probe_period() {
    return this.#liveness_probe_period;
  }
  get id_type() {
    return this.#id_type;
  }
  get label_type_image() {
    return this.#label_type_image;
  }
  get args() {
    return this.#args;
  }
  get envs() {
    return this.#envs;
  }
  get node_selectors() {
    return this.#node_selectors;
  }
  get ports() {
    return this.#ports;
  }
  get need_compute_gpu() {
    return this.#need_compute_gpu;
  }
  get need_graphical_rendering_gpu() {
    return this.#need_graphical_rendering_gpu;
  }
  get ram_request() {
    return this.#ram_request;
  }
  get ram_limit() {
    return this.#ram_limit;
  }
  get cpu_request() {
    return this.#cpu_request;
  }
  get cpu_limit() {
    return this.#cpu_limit;
  }

  // Setters
  set id_interface(value) {
    this.#id_interface = value;
  }
  set label(value) {
    this.#label = value;
  }
  set default_label(value) {
    this.#default_label = value;
  }
  set registry_link(value) {
    this.#registry_link = value;
  }
  set exec_command(value) {
    this.#exec_command = value;
  }
  set service_command(value) {
    this.#service_command = value;
  }
  set privileged(value) {
    this.#privileged = value;
  }
  set readiness_probe_initial_delay(value) {
    this.#readiness_probe_initial_delay = value;
  }
  set liveness_probe_initial_delay(value) {
    this.#liveness_probe_initial_delay = value;
  }
  set readiness_probe_period(value) {
    this.#readiness_probe_period = value;
  }
  set liveness_probe_period(value) {
    this.#liveness_probe_period = value;
  }
  set id_type(value) {
    this.#id_type = value;
  }
  set label_type_image(value) {
    this.#label_type_image = value;
  }
  set ports(value) {
    this.#ports = value;
  }
  set args(value) {
    this.#args = value;
  }
  set envs(value) {
    this.#envs = value;
  }
  set node_selectors(value) {
    this.#node_selectors = value;
  }
  set need_compute_gpu(value) {
    this.#need_compute_gpu = value;
  }
  set need_graphical_rendering_gpu(value) {
    this.#need_graphical_rendering_gpu = value;
  }
  set ram_request(value) {
    this.#ram_request = value;
  }
  set ram_limit(value) {
    this.#ram_limit = value;
  }
  set cpu_request(value) {
    this.#cpu_request = value;
  }
  set cpu_limit(value) {
    this.#cpu_limit = value;
  }

  // Convert to JSON
  public_format() {
    return {
      id_interface: this.#id_interface,
      label: this.#label,
      label_type_image: this.#label_type_image,
    };
  }
  toJSON() {
    return {
      id_interface: this.#id_interface,
      label: this.#label,
      default_label: this.#default_label,
      registry_link: this.#registry_link,
      exec_command: this.#exec_command,
      service_command: this.#service_command,
      privileged: this.#privileged,
      readiness_probe_initial_delay: this.#readiness_probe_initial_delay,
      liveness_probe_initial_delay: this.#liveness_probe_initial_delay,
      readiness_probe_period: this.#readiness_probe_period,
      liveness_probe_period: this.#liveness_probe_period,
      id_type: this.#id_type,
      label_type_image: this.#label_type_image,
      need_compute_gpu: this.#need_compute_gpu,
      need_graphical_rendering_gpu: this.#need_graphical_rendering_gpu,
      ram_request: this.#ram_request,
      ram_limit: this.#ram_limit,
      cpu_request: this.#cpu_request,
      cpu_limit: this.#cpu_limit,
      args: this.#args,
      envs: this.#envs,
      node_selectors: this.#node_selectors,
      ports: this.#ports,
    };
  }
}
