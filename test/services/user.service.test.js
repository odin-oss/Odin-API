import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as user_service from '../../src/services/user.service.js';
import { BadCredentials } from '../../src/utils/errors.util.js';

chai.use(sinonChai);

describe('user.service.get()', () => {
  it('should get user by id successfully', async () => {
    const mockUser = { id_user: 1, mail: 'test@example.com', role: 'STUDENT' };
    const mockUserGet = sinon.stub().resolves(mockUser);

    const result = await user_service.get(
      { id_user: 1 },
      { user_get: mockUserGet }
    );

    chai.expect(result).to.deep.equal(mockUser);
    chai.expect(mockUserGet.calledOnce).to.be.true;
  });

  it('should throw error when id_user is not positive', async () => {
    try {
      await user_service.get({ id_user: -1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_user is zero', async () => {
    try {
      await user_service.get({ id_user: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_user is missing', async () => {
    try {
      await user_service.get({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('user.service.list_by_role()', () => {
  it('should list users by role STUDENT', async () => {
    const mockUsers = [
      { id_user: 1, mail: 'student1@example.com', role: 'STUDENT' },
      { id_user: 2, mail: 'student2@example.com', role: 'STUDENT' },
    ];
    const mockUserList = sinon.stub().resolves(mockUsers);

    const result = await user_service.list_by_role(
      { user_role: 'STUDENT' },
      { user_list: mockUserList }
    );

    chai.expect(result).to.deep.equal(mockUsers);
    chai.expect(mockUserList.calledOnce).to.be.true;
  });

  it('should list users by role TEACHER', async () => {
    const mockUsers = [
      { id_user: 3, mail: 'prof@example.com', role: 'TEACHER' },
    ];
    const mockUserList = sinon.stub().resolves(mockUsers);

    const result = await user_service.list_by_role(
      { user_role: 'TEACHER' },
      { user_list: mockUserList }
    );

    chai.expect(result).to.deep.equal(mockUsers);
    chai.expect(mockUserList.calledOnce).to.be.true;
  });

  it('should list users by role ADMINISTRATOR', async () => {
    const mockUsers = [
      { id_user: 4, mail: 'admin@example.com', role: 'ADMINISTRATOR' },
    ];
    const mockUserList = sinon.stub().resolves(mockUsers);

    const result = await user_service.list_by_role(
      { user_role: 'ADMINISTRATOR' },
      { user_list: mockUserList }
    );

    chai.expect(result).to.deep.equal(mockUsers);
    chai.expect(mockUserList.calledOnce).to.be.true;
  });

  it('should throw error for invalid role', async () => {
    try {
      await user_service.list_by_role({ user_role: 'INVALID_ROLE' });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should return empty array when no users exist for role', async () => {
    const mockUserList = sinon.stub().resolves([]);

    const result = await user_service.list_by_role(
      { user_role: 'STUDENT' },
      { user_list: mockUserList }
    );

    chai.expect(result).to.deep.equal([]);
  });
});

describe('user.service.update_password()', () => {
  it('should update password successfully with correct old password', async () => {
    const mockUser = {
      id_user: 1,
      pwd: '$2b$11$mocked_hash_old',
    };
    const mockResponse = { success: true };
    const mockUserGet = sinon.stub().resolves(mockUser);
    const mockUserUpdatePassword = sinon.stub().resolves(mockResponse);
    const mockBcrypt = {
      compareSync: sinon.stub().returns(true),
      hashSync: sinon.stub().returns('$2b$11$mocked_hash_new'),
    };

    const result = await user_service.update_password(
      {
        id_user: 1,
        password: 'NewPassword123!',
        old_password: 'OldPassword123!',
      },
      {
        user_get: mockUserGet,
        user_update_password: mockUserUpdatePassword,
        bcrypt: mockBcrypt,
      }
    );

    chai.expect(mockUserGet.calledOnce).to.be.true;
    chai.expect(mockBcrypt.compareSync.calledOnce).to.be.true;
    chai.expect(mockUserUpdatePassword.calledOnce).to.be.true;
  });

  it('should throw BadCredentials when old password is incorrect', async () => {
    const mockUser = {
      id_user: 1,
      pwd: '$2b$11$mocked_hash',
    };
    const mockUserGet = sinon.stub().resolves(mockUser);
    const mockBcrypt = {
      compareSync: sinon.stub().returns(false),
    };

    try {
      await user_service.update_password(
        {
          id_user: 1,
          password: 'NewPassword123!',
          old_password: 'WrongPassword',
        },
        {
          user_get: mockUserGet,
          user_update_password: sinon.stub(),
          bcrypt: mockBcrypt,
        }
      );
      chai.expect.fail('Should have thrown BadCredentials');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadCredentials);
      chai.expect(err.message).to.include('old password');
    }
  });

  it('should throw error when password is less than 8 characters', async () => {
    try {
      await user_service.update_password({
        id_user: 1,
        password: 'short1!',
        old_password: 'OldPassword123!',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when password has no numbers', async () => {
    try {
      await user_service.update_password({
        id_user: 1,
        password: 'NoNumbers!',
        old_password: 'OldPassword123!',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when password has no special characters', async () => {
    try {
      await user_service.update_password({
        id_user: 1,
        password: 'NoSpecialChar123',
        old_password: 'OldPassword123!',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_user is not positive', async () => {
    try {
      await user_service.update_password({
        id_user: -1,
        password: 'NewPassword123!',
        old_password: 'OldPassword123!',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('user.service.create()', () => {
  it('should create user successfully with valid data', async () => {
    const mockRole = { id_role: 1, label: 'STUDENT' };
    const mockNewUser = {
      id_user: 1,
      mail: 'newuser@example.com',
      firstname: 'John',
      lastname: 'Doe',
      role: 'STUDENT',
    };
    const mockRoleByLabel = sinon.stub().resolves(mockRole);
    const mockCreate = sinon.stub().resolves({ ...mockNewUser, id_role: 1 });
    const mockBcrypt = {
      hashSync: sinon.stub().returns('$2b$11$mocked_hash'),
    };

    const result = await user_service.create(
      {
        pwd: 'SecurePassword123!',
        mail: 'newuser@example.com',
        role: 'STUDENT',
        lastname: 'Doe',
        firstname: 'John',
      },
      {
        bcrypt: mockBcrypt,
        create: mockCreate,
        role_by_label: mockRoleByLabel,
      }
    );

    chai.expect(mockRoleByLabel.calledOnce).to.be.true;
    chai.expect(mockCreate.calledOnce).to.be.true;
    chai.expect(mockBcrypt.hashSync.calledOnce).to.be.true;
  });

  it('should throw error when password is less than 8 characters', async () => {
    try {
      await user_service.create({
        pwd: 'short1!',
        mail: 'user@example.com',
        role: 'STUDENT',
        lastname: 'Doe',
        firstname: 'John',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when email is invalid', async () => {
    try {
      await user_service.create({
        pwd: 'SecurePassword123!',
        mail: 'invalid-email',
        role: 'STUDENT',
        lastname: 'Doe',
        firstname: 'John',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when role is invalid', async () => {
    try {
      await user_service.create({
        pwd: 'SecurePassword123!',
        mail: 'user@example.com',
        role: 'INVALID_ROLE',
        lastname: 'Doe',
        firstname: 'John',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when firstname or lastname is empty', async () => {
    try {
      await user_service.create({
        pwd: 'SecurePassword123!',
        mail: 'user@example.com',
        role: 'STUDENT',
        lastname: '',
        firstname: 'John',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
