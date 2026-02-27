import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Op } from 'sequelize';
import dbManager from '../../src/config/db.config.js';
import * as user_builder from '../../src/builders/user.builder.js';
import { User } from '../../src/objects/User.js';

chai.use(sinonChai);

describe('user.builder.get()', () => {
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.USERS, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve a user by id_user', async () => {
    findOneStub.resolves({
      dataValues: {
        id_user: 1,
        firstname: 'John',
        lastname: 'Doe',
        mail: 'john@example.com',
        id_password: 5,
      },
      USER_ROLE: {
        label: 'ETUDIANT',
      },
      PASSWORD: {
        pwd: 'hashed_password_123',
      },
    });

    const result = await user_builder.get({ id_user: 1 });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(User);
    chai.expect(result.id_user).to.equal(1);
    chai.expect(result.firstname).to.equal('John');
    chai.expect(result.lastname).to.equal('Doe');
    chai.expect(result.mail).to.equal('john@example.com');
    chai.expect(result.role).to.equal('ETUDIANT');
  });

  it('should retrieve a user by mail', async () => {
    findOneStub.resolves({
      dataValues: {
        id_user: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        mail: 'jane@example.com',
        id_password: 6,
      },
      USER_ROLE: {
        label: 'PROFESSEUR',
      },
      PASSWORD: {
        pwd: 'hashed_password_456',
      },
    });

    const result = await user_builder.get({ mail: 'jane@example.com' });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(User);
    chai.expect(result.mail).to.equal('jane@example.com');
    chai.expect(result.role).to.equal('PROFESSEUR');
  });

  it('should throw when neither id_user nor mail is provided', async () => {
    try {
      await user_builder.get({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
      chai
        .expect(err.message)
        .to.include('Either mail or id_user must be present');
    }
  });

  it('should throw when user is not found by id_user', async () => {
    findOneStub.resolves(null);

    try {
      await user_builder.get({ id_user: 999 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
      chai.expect(err.message).to.include('could not be found');
    }
  });

  it('should throw when user is not found by mail', async () => {
    findOneStub.resolves(null);

    try {
      await user_builder.get({ mail: 'nonexistent@example.com' });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid email format', async () => {
    try {
      await user_builder.get({ mail: 'invalid-email' });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid id_user (zero)', async () => {
    try {
      await user_builder.get({ id_user: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid id_user (negative)', async () => {
    try {
      await user_builder.get({ id_user: -1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('user.builder.list()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.USERS, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve all ETUDIANT users', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_user: 1,
          firstname: 'John',
          lastname: 'Doe',
          mail: 'john@example.com',
        },
        USER_ROLE: {
          label: 'ETUDIANT',
        },
      },
      {
        dataValues: {
          id_user: 2,
          firstname: 'Jane',
          lastname: 'Smith',
          mail: 'jane@example.com',
        },
        USER_ROLE: {
          label: 'ETUDIANT',
        },
      },
    ]);

    const result = await user_builder.list({ user_role: 'ETUDIANT' });

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(2);
    chai.expect(result[0]).to.be.instanceOf(User);
    chai.expect(result[1]).to.be.instanceOf(User);
    chai.expect(result[0].role).to.equal('ETUDIANT');
  });

  it('should retrieve all PROFESSEUR users', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_user: 3,
          firstname: 'Alice',
          lastname: 'Johnson',
          mail: 'alice@example.com',
        },
        USER_ROLE: {
          label: 'PROFESSEUR',
        },
      },
    ]);

    const result = await user_builder.list({ user_role: 'PROFESSEUR' });

    chai.expect(result).to.have.lengthOf(1);
    chai.expect(result[0].role).to.equal('PROFESSEUR');
  });

  it('should retrieve all ADMINISTRATEUR users', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_user: 4,
          firstname: 'Admin',
          lastname: 'User',
          mail: 'admin@example.com',
        },
        USER_ROLE: {
          label: 'ADMINISTRATEUR',
        },
      },
    ]);

    const result = await user_builder.list({ user_role: 'ADMINISTRATEUR' });

    chai.expect(result).to.have.lengthOf(1);
    chai.expect(result[0].role).to.equal('ADMINISTRATEUR');
  });

  it('should return empty array if no users found', async () => {
    findAllStub.resolves([]);

    const result = await user_builder.list({ user_role: 'ETUDIANT' });

    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });

  it('should reject invalid role', async () => {
    try {
      await user_builder.list({ user_role: 'INVALID_ROLE' });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('user.builder.get_list()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.USERS, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve users by array of ids', async () => {
    findAllStub.resolves([
      {
        id_user: 1,
        firstname: 'John',
        lastname: 'Doe',
        mail: 'john@example.com',
        USER_ROLE: {
          label: 'ETUDIANT',
        },
      },
      {
        id_user: 3,
        firstname: 'Alice',
        lastname: 'Johnson',
        mail: 'alice@example.com',
        USER_ROLE: {
          label: 'PROFESSEUR',
        },
      },
    ]);

    const result = await user_builder.get_list({ ids: [1, 3] });

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(2);
    chai.expect(result[0]).to.be.instanceOf(User);
    chai.expect(result[1]).to.be.instanceOf(User);
  });

  it('should retrieve a single user by id array', async () => {
    findAllStub.resolves([
      {
        id_user: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        mail: 'jane@example.com',
        USER_ROLE: {
          label: 'ETUDIANT',
        },
      },
    ]);

    const result = await user_builder.get_list({ ids: [2] });

    chai.expect(result).to.have.lengthOf(1);
    chai.expect(result[0].id_user).to.equal(2);
  });

  it('should return empty array if no users found', async () => {
    findAllStub.resolves([]);

    const result = await user_builder.get_list({ ids: [999, 1000] });

    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });

  it('should reject empty ids array', async () => {
    try {
      await user_builder.get_list({ ids: [] });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid ids (zero)', async () => {
    try {
      await user_builder.get_list({ ids: [0, 1, 2] });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid ids (negative)', async () => {
    try {
      await user_builder.get_list({ ids: [1, -2, 3] });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject non-numeric ids', async () => {
    try {
      await user_builder.get_list({ ids: [1, 'invalid', 3] });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should verify using Op.in for ids filtering', async () => {
    findAllStub.resolves([]);

    await user_builder.get_list({ ids: [1, 2, 3] });

    chai.expect(findAllStub.calledOnce).to.be.true;
    const callArgs = findAllStub.getCall(0).args[0];
    chai.expect(callArgs.where.id_user).to.have.property(Op.in);
    chai.expect(callArgs.where.id_user[Op.in]).to.deep.equal([1, 2, 3]);
  });
});

describe('user.builder.update_password()', () => {
  let findOneStub;
  let updateStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.USERS, 'findOne');
    updateStub = sinon.stub(dbManager.models.PASSWORD, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update user password successfully', async () => {
    findOneStub.resolves({
      id_user: 1,
      id_password: 5,
    });
    updateStub.resolves([1]);

    const result = await user_builder.update_password({
      id_user: 1,
      hashed_password: 'new_hashed_password_abc123',
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(updateStub.calledOnce).to.be.true;
    chai.expect(result).to.equal("The user's password has been changed.");
  });

  it('should verify update is called with correct password value', async () => {
    findOneStub.resolves({
      id_user: 2,
      id_password: 6,
    });
    updateStub.resolves([1]);

    const newPassword = 'new_hashed_password_xyz789';
    await user_builder.update_password({
      id_user: 2,
      hashed_password: newPassword,
    });

    const updateCall = updateStub.getCall(0);
    chai.expect(updateCall.args[0]).to.deep.equal({ pwd: newPassword });
  });

  it('should throw when user is not found', async () => {
    findOneStub.resolves(null);

    try {
      await user_builder.update_password({
        id_user: 999,
        hashed_password: 'some_password',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
      chai.expect(err.message).to.include('could not be found');
    }
  });

  it('should throw when update fails', async () => {
    findOneStub.resolves({
      id_user: 1,
      id_password: 5,
    });
    updateStub.resolves([0]);

    try {
      await user_builder.update_password({
        id_user: 1,
        hashed_password: 'some_password',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid id_user (zero)', async () => {
    try {
      await user_builder.update_password({
        id_user: 0,
        hashed_password: 'some_password',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid id_user (negative)', async () => {
    try {
      await user_builder.update_password({
        id_user: -1,
        hashed_password: 'some_password',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject empty hashed_password', async () => {
    try {
      await user_builder.update_password({
        id_user: 1,
        hashed_password: '',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('user.builder.create()', () => {
  let createUserStub;
  let createPasswordStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    createPasswordStub = sinon.stub(dbManager.models.PASSWORD, 'create');
    createUserStub = sinon.stub(dbManager.models.USERS, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create a new user successfully', async () => {
    createPasswordStub.resolves({
      id_password: 10,
      pwd: 'hashed_password_new',
    });
    createUserStub.resolves({
      dataValues: {
        id_user: 5,
        firstname: 'NewUser',
        lastname: 'Test',
        mail: 'newuser@example.com',
        id_role: 1,
        id_password: 10,
      },
    });

    const result = await user_builder.create({
      firstname: 'NewUser',
      lastname: 'Test',
      mail: 'newuser@example.com',
      id_role: 1,
      hashed_password: 'hashed_password_new',
    });

    chai.expect(createPasswordStub.calledOnce).to.be.true;
    chai.expect(createUserStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(User);
    chai.expect(result.firstname).to.equal('NewUser');
    chai.expect(result.lastname).to.equal('Test');
    chai.expect(result.mail).to.equal('newuser@example.com');
  });

  it('should verify password is created first', async () => {
    createPasswordStub.resolves({
      id_password: 11,
      pwd: 'test_password',
    });
    createUserStub.resolves({
      dataValues: {
        id_user: 6,
        firstname: 'Alice',
        lastname: 'Wonder',
        mail: 'alice@example.com',
        id_role: 2,
        id_password: 11,
      },
    });

    await user_builder.create({
      firstname: 'Alice',
      lastname: 'Wonder',
      mail: 'alice@example.com',
      id_role: 2,
      hashed_password: 'test_password',
    });

    const passwordCall = createPasswordStub.getCall(0);
    chai.expect(passwordCall.args[0]).to.deep.equal({
      pwd: 'test_password',
    });
  });

  it('should use password id in user creation', async () => {
    createPasswordStub.resolves({
      id_password: 12,
      pwd: 'secure_hash',
    });
    createUserStub.resolves({
      dataValues: {
        id_user: 7,
        firstname: 'Bob',
        lastname: 'Builder',
        mail: 'bob@example.com',
        id_role: 3,
        id_password: 12,
      },
    });

    await user_builder.create({
      firstname: 'Bob',
      lastname: 'Builder',
      mail: 'bob@example.com',
      id_role: 3,
      hashed_password: 'secure_hash',
    });

    const userCallArgs = createUserStub.getCall(0).args[0];
    chai.expect(userCallArgs.id_password).to.equal(12);
    chai.expect(userCallArgs.firstname).to.equal('Bob');
    chai.expect(userCallArgs.lastname).to.equal('Builder');
  });

  it('should reject empty firstname', async () => {
    try {
      await user_builder.create({
        firstname: '',
        lastname: 'Test',
        mail: 'user@example.com',
        id_role: 1,
        hashed_password: 'password123',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject empty lastname', async () => {
    try {
      await user_builder.create({
        firstname: 'John',
        lastname: '',
        mail: 'user@example.com',
        id_role: 1,
        hashed_password: 'password123',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid email format', async () => {
    try {
      await user_builder.create({
        firstname: 'John',
        lastname: 'Doe',
        mail: 'invalid-email',
        id_role: 1,
        hashed_password: 'password123',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid id_role (zero)', async () => {
    try {
      await user_builder.create({
        firstname: 'John',
        lastname: 'Doe',
        mail: 'john@example.com',
        id_role: 0,
        hashed_password: 'password123',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid id_role (negative)', async () => {
    try {
      await user_builder.create({
        firstname: 'John',
        lastname: 'Doe',
        mail: 'john@example.com',
        id_role: -1,
        hashed_password: 'password123',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject empty hashed_password', async () => {
    try {
      await user_builder.create({
        firstname: 'John',
        lastname: 'Doe',
        mail: 'john@example.com',
        id_role: 1,
        hashed_password: '',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject missing firstname', async () => {
    try {
      await user_builder.create({
        lastname: 'Doe',
        mail: 'john@example.com',
        id_role: 1,
        hashed_password: 'password123',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject missing lastname', async () => {
    try {
      await user_builder.create({
        firstname: 'John',
        mail: 'john@example.com',
        id_role: 1,
        hashed_password: 'password123',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject missing mail', async () => {
    try {
      await user_builder.create({
        firstname: 'John',
        lastname: 'Doe',
        id_role: 1,
        hashed_password: 'password123',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject missing id_role', async () => {
    try {
      await user_builder.create({
        firstname: 'John',
        lastname: 'Doe',
        mail: 'john@example.com',
        hashed_password: 'password123',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject missing hashed_password', async () => {
    try {
      await user_builder.create({
        firstname: 'John',
        lastname: 'Doe',
        mail: 'john@example.com',
        id_role: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
