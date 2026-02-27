import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import dbManager from '../../src/config/db.config.js';
import * as auth_builder from '../../src/builders/auth.builder.js';
import { User } from '../../src/objects/User.js';
import { UserRole } from '../../src/objects/UserRole.js';
import { DBObjectNotFound } from '../../src/utils/errors.util.js';

chai.use(sinonChai);

describe('auth.builder.update()', () => {
  let findOneStub;
  let updateStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.USER_ROLE, 'findOne');
    updateStub = sinon.stub(dbManager.models.USERS, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_user and role and should update user role.', async () => {
    findOneStub.resolves({ id_role: 2, label: 'admin' });
    updateStub.resolves([
      1,
      [
        {
          id_user: 1,
          id_role: 2,
          username: 'testuser',
          email: 'test@example.com',
        },
      ],
    ]);

    const result = await auth_builder.update({
      id_user: 1,
      role: 'ADMINISTRATEUR',
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(updateStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(User);
  });

  it('called with non-existing role and should throw error.', async () => {
    findOneStub.resolves(null);

    try {
      await auth_builder.update({
        id_user: 1,
        role: 'non-existing-role',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The role could not be found.');
    }
  });

  it('called with non-existing user and should throw error.', async () => {
    findOneStub.resolves({ id_role: 2, label: 'admin' });
    updateStub.resolves([0, []]);

    try {
      await auth_builder.update({
        id_user: 999,
        role: 'admin',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The user role could not be updated.');
    }
  });

  it('called with invalid id_user should reject validation.', async () => {
    try {
      await auth_builder.update({
        id_user: 'invalid',
        role: 'admin',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('called with missing role parameter and should throw error.', async () => {
    try {
      await auth_builder.update({
        id_user: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('called with missing id_user parameter and should throw error.', async () => {
    try {
      await auth_builder.update({
        role: 'admin',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('called with different roles should update correctly.', async () => {
    const roles = ['ETUDIANT', 'PROFESSEUR', 'ADMINISTRATEUR'];

    for (const role of roles) {
      findOneStub.resetHistory();
      updateStub.resetHistory();

      findOneStub.resolves({ id_role: Math.random(), label: role });
      updateStub.resolves([1, [{ id_user: 1, id_role: 1 }]]);

      const result = await auth_builder.update({
        id_user: 1,
        role,
      });

      chai.expect(result).to.be.instanceOf(User);
    }
  });
});

describe('auth.builder.role_by_id()', () => {
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.USER_ROLE, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_role and should return UserRole.', async () => {
    findOneStub.resolves({
      id_role: 1,
      label: 'user',
      description: 'Regular user role',
    });

    const result = await auth_builder.role_by_id({
      id_role: 1,
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(
      findOneStub.calledWith({
        where: { id_role: 1 },
      })
    ).to.be.true;
    chai.expect(result).to.be.instanceOf(UserRole);
  });

  it('called with non-existing id_role and should throw error.', async () => {
    findOneStub.resolves(null);

    try {
      await auth_builder.role_by_id({
        id_role: 999,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The user role could not be found.');
    }
  });

  it('called with invalid id_role should reject validation.', async () => {
    try {
      await auth_builder.role_by_id({
        id_role: 'invalid',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('called with negative id_role should reject validation.', async () => {
    try {
      await auth_builder.role_by_id({
        id_role: -1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('called with zero id_role should reject validation.', async () => {
    try {
      await auth_builder.role_by_id({
        id_role: 0,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should return UserRole with correct properties.', async () => {
    const mockRole = {
      id_role: 3,
      label: 'admin',
      description: 'Administrator role',
    };
    findOneStub.resolves(mockRole);

    const result = await auth_builder.role_by_id({
      id_role: 3,
    });

    chai.expect(result).to.include({
      id_role: 3,
      label: 'admin',
    });
  });

  it('called multiple times should call findOne each time.', async () => {
    findOneStub.resolves({ id_role: 1, label: 'user' });

    await auth_builder.role_by_id({ id_role: 1 });
    await auth_builder.role_by_id({ id_role: 2 });
    await auth_builder.role_by_id({ id_role: 3 });

    chai.expect(findOneStub.callCount).to.equal(3);
  });
});

describe('auth.builder.role_by_label()', () => {
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.USER_ROLE, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid label and should return UserRole.', async () => {
    findOneStub.resolves({
      id_role: 1,
      label: 'user',
      description: 'Regular user role',
      dataValues: {
        id_role: 1,
        label: 'user',
        description: 'Regular user role',
      },
    });

    const result = await auth_builder.role_by_label({
      label: 'user',
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(
      findOneStub.calledWith({
        where: { label: 'user' },
      })
    ).to.be.true;
    chai.expect(result).to.be.instanceOf(UserRole);
  });

  it('called with non-existing label and should throw error.', async () => {
    findOneStub.resolves(null);

    try {
      await auth_builder.role_by_label({
        label: 'non-existing-role',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The user role could not be found.');
    }
  });

  it('called with empty label and should reject validation.', async () => {
    try {
      await auth_builder.role_by_label({
        label: '',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('called with missing label parameter and should throw error.', async () => {
    try {
      await auth_builder.role_by_label({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should return UserRole with correct properties.', async () => {
    const mockRole = {
      dataValues: {
        id_role: 2,
        label: 'moderator',
        description: 'Moderator role',
      },
    };
    findOneStub.resolves(mockRole);

    const result = await auth_builder.role_by_label({
      label: 'moderator',
    });

    chai.expect(result).to.be.instanceOf(UserRole);
  });

  it('called with different labels should retrieve correctly.', async () => {
    const labels = ['user', 'moderator', 'admin', 'superadmin'];

    for (const label of labels) {
      findOneStub.resetHistory();

      findOneStub.resolves({
        dataValues: {
          id_role: Math.floor(Math.random() * 100) + 1,
          label: label,
          description: `${label} role`,
        },
      });

      const result = await auth_builder.role_by_label({
        label: label,
      });

      chai.expect(result).to.be.instanceOf(UserRole);
    }
  });

  it('called with case-sensitive label should query correctly.', async () => {
    findOneStub.resolves({
      dataValues: {
        id_role: 1,
        label: 'Admin',
        description: 'Admin role',
      },
    });

    const result = await auth_builder.role_by_label({
      label: 'Admin',
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(UserRole);
  });

  it('called with special characters in label should handle correctly.', async () => {
    findOneStub.resolves({
      dataValues: {
        id_role: 5,
        label: 'super-admin',
        description: 'Super admin role',
      },
    });

    const result = await auth_builder.role_by_label({
      label: 'super-admin',
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(UserRole);
  });

  it('called multiple times should call findOne each time.', async () => {
    findOneStub.resolves({
      dataValues: { id_role: 1, label: 'user' },
    });

    await auth_builder.role_by_label({ label: 'user' });
    await auth_builder.role_by_label({ label: 'admin' });
    await auth_builder.role_by_label({ label: 'moderator' });

    chai.expect(findOneStub.callCount).to.equal(3);
  });
});
