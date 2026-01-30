/**
 * BadTypeArgumentError returned whenever a function receives an argument not with the expected type.
 */
export class BadTypeArgumentError extends Error {
  constructor(message) {
    super(message);
    this.code = 400;
    this.name = 'BadTypeArgumentError';
  }
}
/**
 * MissingArgumentError returned whenever a function is called with a missing argument.
 */
export class MissingArgumentError extends Error {
  constructor(message) {
    super(message);
    this.code = 400;
    this.name = 'MissingArgumentError';
  }
}
/**
 * ParameterMisformed returned whenever a function has a misformed arguement.
 */
export class ParameterMisformed extends Error {
  constructor(message) {
    super(message);
    this.code = 400;
    this.name = 'ParameterMisformed';
  }
}
/**
 * DBConnexionRefused returned whenever the PostgreSQL db cannot connect.
 */
export class DBConnexionRefused extends Error {
  constructor(message) {
    super(message);
    this.code = 500;
    this.name = 'DBConnexionRefused';
  }
}
/**
 * DBForeignKeyConstraintError returned whenever the PostgreSQL db delete a foreign key that is still in use.
 */
export class DBForeignKeyConstraintError extends Error {
  constructor(message) {
    super(message);
    this.code = 500;
    this.name = 'DBForeignKeyConstraintError';
  }
}
/**
 * DBObjectNotFound returned whenever the PostgreSQL db could not find the element.
 */
export class DBObjectNotFound extends Error {
  constructor(message) {
    super(message);
    this.code = 404;
    this.name = 'DBObjectNotFound';
  }
}
/**
 * BadCredentials returned if the credentials used for connexion are not correct.
 */
export class BadCredentials extends Error {
  constructor(message) {
    super(message);
    this.code = 403;
    this.name = 'BadCredentials';
  }
}

/**
 * BadContentTokenError returned if the route is called without a token in the headers.
 */
export class BadContentTokenError extends Error {
  constructor(message) {
    super(message);
    this.code = 403;
    this.name = 'BadContentTokenError';
  }
}

/**
 * UserIsNotAdmin returned if the user tries to access to admin's datas without being an admin.
 */
export class UserIsNotAdmin extends Error {
  constructor(message) {
    super(message);
    this.code = 403;
    this.name = 'UserIsNotAdmin';
  }
}
/**
 * UserIsNotProfessor returned if the user tries to access to prof's datas without being a professor.
 */
export class UserIsNotProfessor extends Error {
  constructor(message) {
    super(message);
    this.code = 403;
    this.name = 'UserIsNotProfessor';
  }
}
/**
 * UserIsNotOwner returned if the user tries to access an application that he does not own.
 */
export class UserIsNotOwner extends Error {
  constructor(message) {
    super(message);
    this.code = 403;
    this.name = 'UserIsNotOwner';
  }
}
/**
 * UserIsNeitherProfOrAdmin returned if the user neither a prof or an admin.
 */
export class UserIsNeitherProfOrAdmin extends Error {
  constructor(message) {
    super(message);
    this.code = 403;
    this.name = 'UserIsNeitherProfOrAdmin';
  }
}
/**
 * ProfessorIsNotAttributed returned if the prof is not attributed to the session.
 */
export class ProfessorIsNotAttributed extends Error {
  constructor(message) {
    super(message);
    this.code = 403;
    this.name = 'ProfessorIsNotAttributed';
  }
}
/**
 * PasswordIsTooShort returned if the user tries to change his password with a too short password.
 */
export class PasswordIsTooShort extends Error {
  constructor(message) {
    super(message);
    this.code = 401;
    this.name = 'PasswordIsTooShort';
  }
}
/**
 * PasswordMissingNumber returned if the user tries to change his password with a numberless password.
 */
export class PasswordMissingNumber extends Error {
  constructor(message) {
    super(message);
    this.code = 401;
    this.name = 'PasswordMissingNumber';
  }
}
/**
 * PasswordMissingSpecialChars returned if the user tries to change his password with a password that is not containing special chars.
 */
export class PasswordMissingSpecialChars extends Error {
  constructor(message) {
    super(message);
    this.code = 401;
    this.name = 'PasswordMissingSpecialChars';
  }
}

/**
 * StorageAlreadyExists returned if the user tries to create a storage that already exists.
 */
export class StorageAlreadyExists extends Error {
  constructor(message) {
    super(message);
    this.code = 403;
    this.name = 'StorageAlreadyExists';
  }
}

/**
 * StorageError returned for an error relative to storage.
 */
export class StorageError extends Error {
  constructor(message) {
    super(message);
    this.code = 403;
    this.name = 'StorageError';
  }
}

/**
 * * SmashAPIError returned if the Smash API returns an error, gives the smash API error message and code.
 */
export class SmashAPIError extends Error {
  constructor(message, code) {
    super(`Smash code: ${code}, ${message}`);
    this.code = 500;
    this.name = 'SmashAPIError';
  }
}

/**
 * ApplicationInvalidStateError returned when an application is not in a valid state.
 */
export class ApplicationInvalidStateError extends Error {
  constructor(message) {
    super(message);
    this.code = 400;
    this.name = 'ApplicationInvalidStateError';
  }
}
