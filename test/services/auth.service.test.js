import * as auth_service from '../../src/services/auth.service.js';
import {
  BadCredentials,
  DBObjectNotFound,
  MissingArgumentError,
  ParameterMisformed,
} from '../../src/utils/errors.service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { User } from '../../src/objects/User.js';
import CONFIG from '../../src/config/config.js';
chai.use(sinonChai);

describe('auth.service.connect()', () => {
  let fakeUserGet;
  beforeEach(() => {
    fakeUserGet = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good credentials and should return with a token.', async () => {
    let expected_pwd = bcrypt.hashSync('ThisIsMDP', 11);
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: expected_pwd,
        })
      )
    );
    const token = await auth_service.connect(
      {
        mail: 'benoit.lefebvre@getcaelus.cloud',
        password: 'ThisIsMDP',
      },
      {
        user_get: fakeUserGet,
      }
    );
    chai.expect(fakeUserGet).to.have.been.calledOnceWithExactly({
      mail: 'benoit.lefebvre@getcaelus.cloud',
    });
    chai.expect(token).to.be.a('string');
    chai.expect(token.split('.')).to.have.lengthOf(3);
    const decoded = jwt.verify(token, CONFIG.jwt_token);
    chai.expect(decoded).to.have.property('id_user', 1);
  });
  it('called but user is not existing so it should reject with a DBObjectNotFound error.', async () => {
    try {
      fakeUserGet.resolves(
        Promise.reject(new DBObjectNotFound('The user could not be found.'))
      );
      await auth_service.connect(
        {
          mail: 'benoit.lefebvre@getcaelus.cloud',
          password: 'ThisIsMDP',
        },
        {
          user_get: fakeUserGet,
        }
      );
      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.have.been.calledOnceWithExactly({
        mail: 'benoit.lefebvre@getcaelus.cloud',
      });
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The user could not be found.');
    }
  });
  it('called but password is wrong so it should reject with a BadCredentials error.', async () => {
    try {
      let expected_pwd = bcrypt.hashSync('ThisIsMDP', 11);
      fakeUserGet.resolves(
        Promise.resolve(
          new User({
            id_user: 1,
            lastname: 'LEFEBVRE',
            firstname: 'Benoit',
            mail: 'benoit.lefebvre@getcaelus.cloud',
            role: 'PROFESSEUR',
            pwd: expected_pwd,
          })
        )
      );
      await auth_service.connect(
        {
          mail: 'benoit.lefebvre@getcaelus.cloud',
          password: 'WrongPassword',
        },
        {
          user_get: fakeUserGet,
        }
      );
      chai.expect.fail(
        'chai.expected to throw BadCredentials, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.have.been.calledOnceWithExactly({
        mail: 'benoit.lefebvre@getcaelus.cloud',
      });
      chai.expect(err).to.be.instanceOf(BadCredentials);
      chai
        .expect(err.message)
        .to.equal('The credentials you entered are wrong.');
    }
  });
  it('should reject with MissingArgument error.', async () => {
    try {
      await auth_service.connect(
        {
          mail: 'benoit.lefebvre@getcaelus.cloud',
        },
        {
          user_get: fakeUserGet,
        }
      );
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (password) are missing.');
    }
  });
  it('should reject with ParameterMisformed error.', async () => {
    try {
      await auth_service.connect(
        {
          mail: 'benoit.lefebvre',
          password: 'ThisIsMDP',
        },
        {
          user_get: fakeUserGet,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.mail parameter is misformed.');
    }
  });
});
describe('auth.service.role()', () => {
  let fakeUserGet;
  beforeEach(() => {
    fakeUserGet = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good arg and shoud return the role of the user.', async () => {
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'ETUDIANT',
          pwd: undefined,
        })
      )
    );
    const role = await auth_service.role(
      {
        id_user: 1,
      },
      {
        user_get: fakeUserGet,
      }
    );
    chai.expect(role).to.be.equal('ETUDIANT');
    chai.expect(fakeUserGet).to.have.been.calledOnceWithExactly({
      id_user: 1,
    });
  });
  it('called with inexisting user id and shoud reject with DBObjectNotFound.', async () => {
    try {
      fakeUserGet.resolves(
        Promise.reject(new DBObjectNotFound('The user could not be found.'))
      );
      await auth_service.role(
        {
          id_user: 1,
        },
        {
          user_get: fakeUserGet,
        }
      );
      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.have.been.calledOnceWithExactly({
        id_user: 1,
      });
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The user could not be found.');
    }
  });
  it('should reject with MissingArgument error.', async () => {
    try {
      await auth_service.role(
        {},
        {
          user_get: fakeUserGet,
        }
      );
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_user) are missing.');
    }
  });
  it('should reject with ParameterMisformed error.', async () => {
    try {
      await auth_service.role(
        {
          id_user: 'misformed',
        },
        {
          user_get: fakeUserGet,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_user parameter is misformed.');
    }
  });
});
