import z from 'zod';
import Guard from '../utils/guard.util.js';

export class User {
  #id_user;
  #lastname;
  #firstname;
  #mail;
  #role;
  #pwd;

  constructor(props) {
    const data = Guard.validateProps(User.schema, props);
    this.#id_user = data.id_user;
    this.#lastname = data.lastname;
    this.#firstname = data.firstname;
    this.#mail = data.mail;
    this.#role = data.role;
    this.#pwd = data.pwd;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_user: z.number().int().optional(),
    lastname: z.string().min(1).optional(),
    firstname: z.string().min(1).optional(),
    mail: z.email('Invalid email address').optional(),
    role: z.enum(['STUDENT', 'TEACHER', 'ADMINISTRATOR']).optional(),
    pwd: z.string().min(8).optional().optional(),
  });

  // Getters
  get id_user() {
    return this.#id_user;
  }

  get lastname() {
    return this.#lastname;
  }

  get firstname() {
    return this.#firstname;
  }

  get mail() {
    return this.#mail;
  }

  get role() {
    return this.#role;
  }

  get pwd() {
    return this.#pwd;
  }

  // Setters
  set id_user(value) {
    this.#id_user = value;
  }

  set lastname(value) {
    this.#lastname = value;
  }

  set firstname(value) {
    this.#firstname = value;
  }

  set mail(value) {
    this.#mail = value;
  }

  set role(value) {
    this.#role = value;
  }

  set pwd(value) {
    this.#pwd = value;
  }

  public_format() {
    return {
      id_user: this.#id_user,
      lastname: this.#lastname,
      firstname: this.#firstname,
      mail: this.#mail,
      role: this.#role,
    };
  }

  toJSON() {
    return {
      id_user: this.#id_user,
      lastname: this.#lastname,
      firstname: this.#firstname,
      mail: this.#mail,
      role: this.#role,
    };
  }
}
