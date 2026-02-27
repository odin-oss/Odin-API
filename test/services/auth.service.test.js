import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as auth_service from '../../src/services/auth.service.js';
import { BadCredentials } from '../../src/utils/errors.util.js';
import bcrypt from 'bcrypt';

chai.use(sinonChai);

describe('auth.service.connect()', () => {
  it('should successfully connect with valid credentials', async () => {
    const password = 'TestPassword123!';
    const hashedPwd = bcrypt.hashSync(password, 11);
    const mockUser = {
      id_user: 1,
      mail: 'test@example.com',
      pwd: hashedPwd,
    };
    const mockUserGet = sinon.stub().resolves(mockUser);

    const result = await auth_service.connect(
      {
        mail: 'test@example.com',
        password: password,
      },
      {
        user_get: mockUserGet,
      }
    );

    chai.expect(mockUserGet.calledOnce).to.be.true;
    chai.expect(mockUserGet.firstCall.args[0]).to.deep.include({
      mail: 'test@example.com',
    });
    chai.expect(result).to.be.a('string');
  });

  it('should throw BadCredentials when password is incorrect', async () => {
    const mockUser = {
      id_user: 1,
      mail: 'test@example.com',
      pwd: '$2b$11$mocked_hash',
    };
    const mockUserGet = sinon.stub().resolves(mockUser);

    try {
      await auth_service.connect(
        {
          mail: 'test@example.com',
          password: 'wrongpassword',
        },
        {
          user_get: mockUserGet,
        }
      );
      chai.expect.fail('Should have thrown BadCredentials');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadCredentials);
      chai.expect(err.message).to.include('credentials');
    }
  });

  it('should throw error when email is invalid', async () => {
    try {
      await auth_service.connect({
        mail: 'invalid-email',
        password: 'password123!',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when password is empty', async () => {
    try {
      await auth_service.connect({
        mail: 'test@example.com',
        password: '',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('auth.service.role()', () => {
  it('should return user role successfully', async () => {
    const mockUser = {
      id_user: 1,
      mail: 'test@example.com',
      role: 'ADMINISTRATEUR',
    };
    const mockUserGet = sinon.stub().resolves(mockUser);

    const result = await auth_service.role(
      { id_user: 1 },
      { user_get: mockUserGet }
    );

    chai.expect(mockUserGet.calledOnce).to.be.true;
    chai.expect(mockUserGet.firstCall.args[0]).to.deep.include({
      id_user: 1,
    });
  });

  it('should throw error when id_user is not positive', async () => {
    try {
      await auth_service.role({ id_user: -1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_user is zero', async () => {
    try {
      await auth_service.role({ id_user: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_user is missing', async () => {
    try {
      await auth_service.role({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
