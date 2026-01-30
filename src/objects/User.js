export class User {
  #id_user;
  #lastname;
  #firstname;
  #mail;
  #role;
  #pwd;

  constructor({
    id_user = undefined,
    lastname = null,
    firstname = null,
    mail = null,
    role = null,
    pwd = null,
  } = {}) {
    this.#id_user = id_user;
    this.#lastname = lastname;
    this.#firstname = firstname;
    this.#mail = mail;
    this.#role = role;
    this.#pwd = pwd;
  }

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

  /**toJSON_with_password() {
    return {
      id_user: this.#id_user,
      lastname: this.#lastname,
      firstname: this.#firstname,
      mail: this.#mail,
      role: this.#role,
      pwd: this.#pwd,
    };
  }**/
}
