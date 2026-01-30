import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as auth_builder from '../../src/builders/auth.builder.js';
import {
  DBObjectNotFound,
  MissingArgumentError,
} from '../../src/utils/errors.service.js';
import { User } from '../../src/objects/User.js';
import db from '../../src/config/db.config.js';
import { UserRole } from '../../src/objects/UserRole.js';
import { Sequelize } from 'sequelize';
chai.use(sinonChai);

describe('auth.builder.update()', () => {
  let fakeFindOne, fakeUpdate;
  beforeEach(() => {
    fakeFindOne = sinon.stub(db.caelus.USER_ROLE, 'findOne');
    fakeUpdate = sinon.stub(db.caelus.USERS, 'update');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good args and should update the user role.', async () => {
    fakeFindOne.resolves(
      Promise.resolve({
        id_role: 3,
      })
    );
    fakeUpdate.resolves(
      Promise.resolve([
        {
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
        },
      ])
    );
    const result = await Promise.resolve(
      auth_builder.update({
        role: 'ETUDIANT',
        id_user: 1,
      })
    );
    chai.expect(result).to.be.deep.equal(
      new User({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        role: 'ETUDIANT',
        pwd: undefined,
      })
    );
    chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
      where: { label: 'ETUDIANT' },
    });
    chai.expect(fakeUpdate).to.have.been.calledOnceWithExactly(
      {
        id_role: 3,
      },
      {
        where: { id_user: 1 },
        returning: true,
      }
    );
  });
  it('called with inexisting user_role and should reject with DBObjectNotFound error.', async () => {
    try {
      fakeFindOne.resolves(Promise.resolve(null));
      await Promise.resolve(
        auth_builder.update({
          role: 'UNKNOWN',
          id_user: 1,
        })
      );
      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
        where: { label: 'UNKNOWN' },
      });
      chai.expect(fakeUpdate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The role could not be found.');
    }
  });
  it('called with inexisting id_user and should reject with DBObjectNotFound error.', async () => {
    try {
      fakeFindOne.resolves(
        Promise.resolve({
          id_role: 3,
        })
      );
      fakeUpdate.resolves(Promise.resolve([0]));
      await Promise.resolve(
        auth_builder.update({
          role: 'ETUDIANT',
          id_user: 1,
        })
      );
      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
        where: { label: 'ETUDIANT' },
      });
      chai.expect(fakeUpdate).to.have.been.calledOnceWithExactly(
        {
          id_role: 3,
        },
        {
          where: { id_user: 1 },
          returning: true,
        }
      );
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The user role could not be updated.');
    }
  });
});
describe('auth.builder.role_by_id', () => {
  let fakeFindOne;
  beforeEach(() => {
    fakeFindOne = sinon.stub(db.caelus.USER_ROLE, 'findOne');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should called role_by_id and get the right answer', async () => {
    fakeFindOne.resolves(
      Promise.resolve({
        id_role: 1,
        label: 'ETUDIANT',
      })
    );
    const result = await auth_builder.role_by_id({ id_role: 1 });
    chai
      .expect(fakeFindOne)
      .to.have.been.calledOnceWithExactly({ where: { id_role: 1 } });
    chai.expect(result).to.deep.equal(
      new UserRole({
        id_role: 1,
        label: 'ETUDIANT',
      })
    );
  });
  it('called with inexisting user_role and should reject with DBObjectNotFound error.', async () => {
    try {
      fakeFindOne.resolves(Promise.resolve(null));
      await Promise.resolve(
        auth_builder.role_by_id({
          id_role: 1,
        })
      );
      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
        where: { id_role: 1 },
      });
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The user role could not be found.');
    }
  });
  it('called without id_role and should reject with MissingArgumentError.', async () => {
    try {
      await Promise.resolve(auth_builder.role_by_id({}));
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.have.not.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_role) are missing.');
    }
  });
});

describe('auth.builder.role_by_label', () => {
  let fakeFindOne;
  beforeEach(() => {
    fakeFindOne = sinon.stub(db.caelus.USER_ROLE, 'findOne');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should called role_by_label and get the right answer', async () => {
    fakeFindOne.resolves(
      Promise.resolve({
        id_role: 1,
        label: 'ETUDIANT',
      })
    );
    const result = await auth_builder.role_by_label({ label: 'ETUDIANT' });
    chai
      .expect(fakeFindOne)
      .to.have.been.calledOnceWithExactly({ where: { label: 'ETUDIANT' } });
    chai.expect(result).to.deep.equal(
      new UserRole({
        id_role: 1,
        label: 'ETUDIANT',
      })
    );
  });
  it('called with inexisting user_role and should reject with DBObjectNotFound error.', async () => {
    try {
      fakeFindOne.resolves(Promise.resolve(null));
      await Promise.resolve(
        auth_builder.role_by_label({
          label: 'ETUDIANT',
        })
      );
      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
        where: { label: 'ETUDIANT' },
      });
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The user role could not be found.');
    }
  });
  it('called without label and should reject with MissingArgumentError.', async () => {
    try {
      await Promise.resolve(auth_builder.role_by_label({}));
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.have.not.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (label) are missing.');
    }
  });
});
