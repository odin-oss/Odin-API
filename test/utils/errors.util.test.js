import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  URLNotFound,
  BadTypeArgumentError,
  MissingArgumentError,
  ParameterMisformed,
  DBConnexionRefused,
  DBForeignKeyConstraintError,
  DBObjectAlreadyExists,
  DBObjectNotFound,
  BadCredentials,
  BadContentTokenError,
  UserIsNotAdmin,
  UserIsNotProfessor,
  UserIsNotOwner,
  UserIsNeitherProfOrAdmin,
  ProfessorIsNotAttributed,
  PasswordIsTooShort,
  PasswordMissingNumber,
  PasswordMissingSpecialChars,
  StorageAlreadyExists,
  StorageError,
  SmashAPIError,
  ApplicationInvalidStateError,
  ImageNotFound,
  ReadingImageError,
  NoImageReceived,
  EmptyStringHashError,
  KubernetesAPINotResponding,
  ObjectsAlreadyExistsError,
  MDBNotResponding,
  KubernetesErrorNotDefined,
  ConnetexKubernetesAPIError,
  KubernetesAPIInvalidURL,
  KubernetesAPIx509Certificate,
  KubernetesAPITimedOut,
  AppsIngressErrorNotDefined,
  AppsIngressNotReachable,
} from '../../src/utils/errors.util.js';

chai.use(sinonChai);

describe('Error Classes - HTTP 4xx Status Codes', () => {
  describe('URLNotFound', () => {
    it('should create an error with correct message, code, and name', () => {
      const error = new URLNotFound('Page not found');

      chai.expect(error).to.be.instanceOf(Error);
      chai.expect(error.message).to.equal('Page not found');
      chai.expect(error.code).to.equal(404);
      chai.expect(error.name).to.equal('URLNotFound');
    });

    it('should be throwable', () => {
      chai.expect(() => {
        throw new URLNotFound('Resource not found');
      }).to.throw(URLNotFound);
    });
  });

  describe('BadTypeArgumentError', () => {
    it('should create an error with code 400', () => {
      const error = new BadTypeArgumentError('Expected string, got number');

      chai.expect(error.message).to.equal('Expected string, got number');
      chai.expect(error.code).to.equal(400);
      chai.expect(error.name).to.equal('BadTypeArgumentError');
    });
  });

  describe('MissingArgumentError', () => {
    it('should create an error with code 400', () => {
      const error = new MissingArgumentError('Missing id_user parameter');

      chai.expect(error.message).to.equal('Missing id_user parameter');
      chai.expect(error.code).to.equal(400);
      chai.expect(error.name).to.equal('MissingArgumentError');
    });
  });

  describe('ParameterMisformed', () => {
    it('should create an error with code 400', () => {
      const error = new ParameterMisformed('Token format is invalid');

      chai.expect(error.message).to.equal('Token format is invalid');
      chai.expect(error.code).to.equal(400);
      chai.expect(error.name).to.equal('ParameterMisformed');
    });
  });

  describe('BadCredentials', () => {
    it('should create an error with code 403', () => {
      const error = new BadCredentials('Username or password incorrect');

      chai.expect(error.code).to.equal(403);
      chai.expect(error.name).to.equal('BadCredentials');
    });
  });

  describe('BadContentTokenError', () => {
    it('should create an error with code 403', () => {
      const error = new BadContentTokenError('Invalid token');

      chai.expect(error.code).to.equal(403);
      chai.expect(error.name).to.equal('BadContentTokenError');
    });
  });

  describe('UserIsNotAdmin', () => {
    it('should create an error with code 403', () => {
      const error = new UserIsNotAdmin('User is not admin');

      chai.expect(error.code).to.equal(403);
      chai.expect(error.name).to.equal('UserIsNotAdmin');
    });
  });

  describe('UserIsNotProfessor', () => {
    it('should create an error with code 403', () => {
      const error = new UserIsNotProfessor('User is not professor');

      chai.expect(error.code).to.equal(403);
      chai.expect(error.name).to.equal('UserIsNotProfessor');
    });
  });

  describe('UserIsNotOwner', () => {
    it('should create an error with code 403', () => {
      const error = new UserIsNotOwner('User does not own this application');

      chai.expect(error.code).to.equal(403);
      chai.expect(error.name).to.equal('UserIsNotOwner');
    });
  });

  describe('UserIsNeitherProfOrAdmin', () => {
    it('should create an error with code 403', () => {
      const error = new UserIsNeitherProfOrAdmin(
        'User is neither professor nor admin'
      );

      chai.expect(error.code).to.equal(403);
      chai.expect(error.name).to.equal('UserIsNeitherProfOrAdmin');
    });
  });

  describe('ProfessorIsNotAttributed', () => {
    it('should create an error with code 403', () => {
      const error = new ProfessorIsNotAttributed(
        'Professor not assigned to session'
      );

      chai.expect(error.code).to.equal(403);
      chai.expect(error.name).to.equal('ProfessorIsNotAttributed');
    });
  });

  describe('StorageAlreadyExists', () => {
    it('should create an error with code 403', () => {
      const error = new StorageAlreadyExists('Storage name already exists');

      chai.expect(error.code).to.equal(403);
      chai.expect(error.name).to.equal('StorageAlreadyExists');
    });
  });

  describe('StorageError', () => {
    it('should create an error with code 403', () => {
      const error = new StorageError('Storage operation failed');

      chai.expect(error.code).to.equal(403);
      chai.expect(error.name).to.equal('StorageError');
    });
  });

  describe('EmptyStringHashError', () => {
    it('should create an error with code 400', () => {
      const error = new EmptyStringHashError('Hash cannot be empty');

      chai.expect(error.code).to.equal(400);
      chai.expect(error.name).to.equal('EmptyStringHashError');
    });
  });

  describe('ApplicationInvalidStateError', () => {
    it('should create an error with code 400', () => {
      const error = new ApplicationInvalidStateError(
        'Application is in invalid state'
      );

      chai.expect(error.code).to.equal(400);
      chai.expect(error.name).to.equal('ApplicationInvalidStateError');
    });
  });

  describe('KubernetesAPIInvalidURL', () => {
    it('should create an error with code 400', () => {
      const error = new KubernetesAPIInvalidURL('Invalid Kubernetes URL');

      chai.expect(error.code).to.equal(400);
      chai.expect(error.name).to.equal('KubernetesAPIInvalidURL');
    });
  });

  describe('DBObjectNotFound', () => {
    it('should create an error with code 404', () => {
      const error = new DBObjectNotFound('User not found in database');

      chai.expect(error.code).to.equal(404);
      chai.expect(error.name).to.equal('DBObjectNotFound');
    });
  });

  describe('ImageNotFound', () => {
    it('should create an error with code 404', () => {
      const error = new ImageNotFound('Image file not found');

      chai.expect(error.code).to.equal(404);
      chai.expect(error.name).to.equal('ImageNotFound');
    });
  });
});

describe('Error Classes - HTTP 5xx Status Codes', () => {
  describe('DBConnexionRefused', () => {
    it('should create an error with code 500', () => {
      const error = new DBConnexionRefused('Cannot connect to database');

      chai.expect(error.code).to.equal(500);
      chai.expect(error.name).to.equal('DBConnexionRefused');
    });
  });

  describe('DBForeignKeyConstraintError', () => {
    it('should create an error with code 500', () => {
      const error = new DBForeignKeyConstraintError(
        'Foreign key constraint violation'
      );

      chai.expect(error.code).to.equal(500);
      chai.expect(error.name).to.equal('DBForeignKeyConstraintError');
    });
  });

  describe('ReadingImageError', () => {
    it('should create an error with code 500', () => {
      const error = new ReadingImageError('Could not read image file');

      chai.expect(error.code).to.equal(500);
      chai.expect(error.name).to.equal('ReadingImageError');
    });
  });

  describe('NoImageReceived', () => {
    it('should create an error with code 500', () => {
      const error = new NoImageReceived('No image provided in request');

      chai.expect(error.code).to.equal(500);
      chai.expect(error.name).to.equal('NoImageReceived');
    });
  });

  describe('KubernetesAPINotResponding', () => {
    it('should create an error with code 500', () => {
      const error = new KubernetesAPINotResponding(
        'Kubernetes API timeout'
      );

      chai.expect(error.code).to.equal(500);
      chai.expect(error.name).to.equal('KubernetesAPINotResponding');
    });
  });

  describe('MDBNotResponding', () => {
    it('should create an error with code 500', () => {
      const error = new MDBNotResponding('MongoDB not responding');

      chai.expect(error.code).to.equal(500);
      chai.expect(error.name).to.equal('MDBNotResponding');
    });
  });

  describe('KubernetesErrorNotDefined', () => {
    it('should create an error with code 500', () => {
      const error = new KubernetesErrorNotDefined('Unknown Kubernetes error');

      chai.expect(error.code).to.equal(500);
      chai.expect(error.name).to.equal('KubernetesErrorNotDefined');
    });
  });

  describe('ConnetexKubernetesAPIError', () => {
    it('should create an error with code 500', () => {
      const error = new ConnetexKubernetesAPIError(
        'Connection failed to Kubernetes'
      );

      chai.expect(error.code).to.equal(500);
      chai.expect(error.name).to.equal('ConnetexKubernetesAPIError');
    });
  });

  describe('KubernetesAPIx509Certificate', () => {
    it('should create an error with code 500', () => {
      const error = new KubernetesAPIx509Certificate(
        'x509 certificate error'
      );

      chai.expect(error.code).to.equal(500);
      chai.expect(error.name).to.equal('KubernetesAPIx509Certificate');
    });
  });

  describe('KubernetesAPITimedOut', () => {
    it('should create an error with code 504', () => {
      const error = new KubernetesAPITimedOut('Kubernetes request timeout');

      chai.expect(error.code).to.equal(504);
      chai.expect(error.name).to.equal('KubernetesAPITimedOut');
    });
  });

  describe('AppsIngressErrorNotDefined', () => {
    it('should create an error with code 500', () => {
      const error = new AppsIngressErrorNotDefined('Unknown ingress error');

      chai.expect(error.code).to.equal(500);
      chai.expect(error.name).to.equal('AppsIngressErrorNotDefined');
    });
  });

  describe('AppsIngressNotReachable', () => {
    it('should create an error with code 500', () => {
      const error = new AppsIngressNotReachable('Ingress is not reachable');

      chai.expect(error.code).to.equal(500);
      chai.expect(error.name).to.equal('AppsIngressNotReachable');
    });
  });

  describe('SmashAPIError', () => {
    it('should create an error with code 500 and include API code in message', () => {
      const error = new SmashAPIError('API Error', 401);

      chai.expect(error.code).to.equal(500);
      chai.expect(error.name).to.equal('SmashAPIError');
      chai.expect(error.message).to.include('Smash code: 401');
      chai.expect(error.message).to.include('API Error');
    });

    it('should handle different Smash API error codes', () => {
      const error = new SmashAPIError('Unauthorized', 403);

      chai.expect(error.message).to.include('Smash code: 403');
    });
  });
});

describe('Error Classes - Custom Status Codes', () => {
  describe('PasswordIsTooShort', () => {
    it('should create an error with code 401', () => {
      const error = new PasswordIsTooShort('Password must be at least 8 characters');

      chai.expect(error.code).to.equal(401);
      chai.expect(error.name).to.equal('PasswordIsTooShort');
    });
  });

  describe('PasswordMissingNumber', () => {
    it('should create an error with code 401', () => {
      const error = new PasswordMissingNumber(
        'Password must contain a number'
      );

      chai.expect(error.code).to.equal(401);
      chai.expect(error.name).to.equal('PasswordMissingNumber');
    });
  });

  describe('PasswordMissingSpecialChars', () => {
    it('should create an error with code 401', () => {
      const error = new PasswordMissingSpecialChars(
        'Password must contain special characters'
      );

      chai.expect(error.code).to.equal(401);
      chai.expect(error.name).to.equal('PasswordMissingSpecialChars');
    });
  });

  describe('DBObjectAlreadyExists', () => {
    it('should create an error with code 200', () => {
      const error = new DBObjectAlreadyExists('Object already exists');

      chai.expect(error.code).to.equal(200);
      chai.expect(error.name).to.equal('DBObjectAlreadyExists');
    });
  });

  describe('ObjectsAlreadyExistsError', () => {
    it('should create an error with code 200', () => {
      const error = new ObjectsAlreadyExistsError('Object already exists');

      chai.expect(error.code).to.equal(200);
      chai.expect(error.name).to.equal('ObjectsAlreadyExistsError');
    });
  });
});

describe('Error Class Properties', () => {
  it('should maintain prototype chain for all errors', () => {
    const errors = [
      new URLNotFound('test'),
      new BadTypeArgumentError('test'),
      new MissingArgumentError('test'),
      new ParameterMisformed('test'),
      new DBConnexionRefused('test'),
      new BadCredentials('test'),
      new UserIsNotAdmin('test'),
    ];

    errors.forEach((error) => {
      chai.expect(error).to.be.instanceOf(Error);
      chai.expect(error).to.have.property('message');
      chai.expect(error).to.have.property('code');
      chai.expect(error).to.have.property('name');
    });
  });

  it('should support error stacktrace', () => {
    const error = new MissingArgumentError('Test message');

    chai.expect(error).to.have.property('stack');
    chai.expect(error.stack).to.include('MissingArgumentError');
    chai.expect(error.stack).to.include('Test message');
  });

  it('should be serializable to JSON', () => {
    const error = new BadCredentials('Invalid login');

    const json = JSON.stringify({
      name: error.name,
      message: error.message,
      code: error.code,
    });

    chai.expect(json).to.include('BadCredentials');
    chai.expect(json).to.include('Invalid login');
    chai.expect(json).to.include('403');
  });

  it('should allow error message modification', () => {
    const error = new UserIsNotOwner('Original message');
    error.message = 'Modified message';

    chai.expect(error.message).to.equal('Modified message');
  });
});

describe('Error Handling Flow', () => {
  it('should catch specific error types', () => {
    const throwError = () => {
      throw new MissingArgumentError('Missing argument');
    };

    try {
      throwError();
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should handle multiple error types in switch statement', () => {
    const errors = [
      new BadTypeArgumentError('test'),
      new DBConnexionRefused('test'),
      new UserIsNotAdmin('test'),
    ];

    errors.forEach((error) => {
      let handled = false;
      switch (error.name) {
        case 'BadTypeArgumentError':
          chai.expect(error.code).to.equal(400);
          handled = true;
          break;
        case 'DBConnexionRefused':
          chai.expect(error.code).to.equal(500);
          handled = true;
          break;
        case 'UserIsNotAdmin':
          chai.expect(error.code).to.equal(403);
          handled = true;
          break;
      }
      chai.expect(handled).to.be.true;
    });
  });
});
