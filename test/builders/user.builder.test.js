import * as user_builder from '../../src/builders/user.builder.js';
import db from '../../src/config/db.config.js';
import {
  DBConnexionRefused,
  DBForeignKeyConstraintError,
  DBObjectNotFound,
  MissingArgumentError,
  ParameterMisformed,
} from '../../src/utils/errors.service.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { User } from '../../src/objects/User.js';
import Sequelize, { Op } from 'sequelize';

chai.use(sinonChai);

describe('user_builder.get()', () => {
  let fakeUsersFindOne;
  beforeEach(() => {
    fakeUsersFindOne = sinon.stub(db.caelus.USERS, 'findOne');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with existing id_user and should return a User object.', async () => {
    fakeUsersFindOne.resolves(
      Promise.resolve({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        USER_ROLE: {
          label: 'PROFESSEUR',
        },
        PASSWORD: {
          pwd: 'ThisIsMDP',
        },
      })
    );
    const result = await user_builder.get({ id_user: 1 });
    chai.expect(result).to.be.instanceOf(User);
    chai.expect(result).to.deep.equal(
      new User({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
        pwd: 'ThisIsMDP',
      })
    );
  });
  it('called with non existing id_user and should return DBObjectNotFound error.', async () => {
    try {
      fakeUsersFindOne.resolves(Promise.resolve(null));
      await user_builder.get({ id_user: 10 });
      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUsersFindOne).to.have.been.called;
      chai.expect(
        fakeUsersFindOne.calledWith({
          include: [
            {
              model: db.caelus.USER_ROLE,
              required: true,
            },
            {
              model: db.caelus.PASSWORD,
              required: true,
            },
          ],
          where: { id_user: 10 },
        })
      ).to.be.true;
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The user could not be found.');
    }
  });
  it('called with existing mail and should return a User object.', async () => {
    fakeUsersFindOne.resolves(
      Promise.resolve({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        USER_ROLE: {
          label: 'PROFESSEUR',
        },
        PASSWORD: {
          pwd: 'ThisIsMDP',
        },
      })
    );
    const result = await user_builder.get({
      mail: 'benoit.lefebvre@getcaelus.cloud',
    });
    chai.expect(result).to.be.instanceOf(User);
    chai.expect(result).to.deep.equal(
      new User({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
        pwd: 'ThisIsMDP',
      })
    );
  });
  it('called without id_user and should return MissingArgumentError.', async () => {
    try {
      await user_builder.get({});
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUsersFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_user,mail) are missing.');
    }
  });
  it('called with a misformed id_user and should return ParameterMisformed.', async () => {
    try {
      await user_builder.get({ id_user: 'misformed' });
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUsersFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_user parameter is misformed.');
    }
  });
});
describe('user_builder.list()', () => {
  let fakeFindAll;
  beforeEach(() => {
    fakeFindAll = sinon.stub(db.caelus.USERS, 'findAll');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with role and should get a list a users.', async () => {
    fakeFindAll.resolves(
      Promise.resolve([
        {
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          USER_ROLE: {
            label: 'PROFESSEUR',
          },
        },
        {
          id_user: 2,
          lastname: 'LEFEBVRE',
          firstname: 'Ulfi',
          mail: 'ulfi.lefebvre@getcaelus.cloud',
          USER_ROLE: {
            label: 'PROFESSEUR',
          },
        },
      ])
    );
    const users = await user_builder.list({
      role: 'PROFESSEUR',
    });
    chai.expect(fakeFindAll).to.be.calledOnceWithExactly({
      include: {
        model: db.caelus.USER_ROLE,
        required: true,
        where: { label: 'PROFESSEUR' },
      },
    });
    chai.expect(users).to.deep.equal([
      new User({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
      }),
      new User({
        id_user: 2,
        lastname: 'LEFEBVRE',
        firstname: 'Ulfi',
        mail: 'ulfi.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
      }),
    ]);
  });
  it('called with role that have no user and should get an empty list of users.', async () => {
    fakeFindAll.resolves(Promise.resolve([]));
    const users = await user_builder.list({
      role: 'PROFESSEUR',
    });
    chai.expect(fakeFindAll).to.be.calledOnceWithExactly({
      include: {
        model: db.caelus.USER_ROLE,
        required: true,
        where: { label: 'PROFESSEUR' },
      },
    });
    chai.expect(users).to.deep.equal([]);
  });
  it('called without role argument and should reject with a MissingArgumentError.', async () => {
    try {
      await user_builder.list({});
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindAll).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (role) are missing.');
    }
  });
  it('called with a misformed role and should return ParameterMisformed.', async () => {
    try {
      await user_builder.list({ role: 'misformed' });
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindAll).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.role parameter is misformed.');
    }
  });
  it('called but should return DBConnexionRefused.', async () => {
    try {
      fakeFindAll.resolves(
        Promise.reject(
          new Sequelize.ConnectionRefusedError(
            'error during connexion to database'
          )
        )
      );
      await user_builder.list({ role: 'ETUDIANT' });
      chai.expect.fail(
        'chai.expected to throw DBConnexionRefused, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindAll).to.have.been.called;
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
      chai.expect(err.message).to.equal('Connexion to the database refused.');
    }
  });
});
describe('user_builder.update_state()', () => {
  let fakeUserFindOne, fakeUserUpdate;
  beforeEach(() => {
    fakeUserFindOne = sinon.stub(db.caelus.USERS, 'findOne');
    fakeUserUpdate = sinon.stub(db.caelus.PASSWORD, 'update');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with existing id_user and should return a User object.', async () => {
    fakeUserFindOne.resolves(
      Promise.resolve({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        id_password: 1,
        USER_ROLE: {
          label: 'PROFESSEUR',
        },
        PASSWORD: {
          pwd: 'ThisIsMDP',
        },
      })
    );
    const result = await user_builder.update_password({
      id_user: 1,
      hashed_password: 'rzergzetrzerzfv',
    });
    chai.expect(result).to.be.equal("The user's password has been changed.");
    chai.expect(fakeUserFindOne).to.have.been.calledOnceWithExactly({
      where: {
        id_user: 1,
      },
    });
    chai.expect(fakeUserUpdate).to.have.been.calledOnceWithExactly(
      {
        pwd: 'rzergzetrzerzfv',
      },
      {
        where: {
          id_password: 1,
        },
      }
    );
  });
  it('called with non existing id_user and should return DBObjectNotFound error.', async () => {
    try {
      fakeUserFindOne.resolves(Promise.resolve(null));
      await user_builder.update_password({
        id_user: 10,
        hashed_password: 'rzergzetrzerzfv',
      });
      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserFindOne).to.have.been.called;
      chai.expect(
        fakeUserFindOne.calledWith({
          where: { id_user: 10 },
        })
      ).to.be.true;
      chai.expect(fakeUserUpdate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The user could not be found.');
    }
  });
});
describe('user_builder.update_password()', () => {
  let fakeUpdate, fakeFindOne;
  beforeEach(() => {
    fakeFindOne = sinon.stub(db.caelus.USERS, 'findOne');
    fakeUpdate = sinon.stub(db.caelus.PASSWORD, 'update');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called and should update the password.', async () => {
    fakeFindOne.resolves(
      Promise.resolve({
        id_password: 1,
        id_user: 1,
      })
    );
    fakeUpdate.resolves(Promise.resolve(true));
    const result = await Promise.resolve(
      user_builder.update_password({
        id_user: 1,
        hashed_password: 'arzaoreigazoireanornco',
      })
    );
    chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
      where: {
        id_user: 1,
      },
    });
    chai.expect(fakeUpdate).to.have.been.calledOnceWithExactly(
      {
        pwd: 'arzaoreigazoireanornco',
      },
      {
        where: {
          id_password: 1,
        },
      }
    );
    chai.expect(result).to.be.equal("The user's password has been changed.");
  });
  it('called with missing id_user and should reject with an error.', async () => {
    try {
      await Promise.resolve(
        user_builder.update_password({
          hashed_password: 'arzaoreigazoireanornco',
        })
      );
      chai.fail('Chai expected to get MissingArgumentError.');
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;
      chai.expect(fakeUpdate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.be.equal('One or multiple arguments (id_user) are missing.');
    }
  });
  it('called and should reject with an DBForeignKeyConstraintError.', async () => {
    try {
      fakeFindOne.resolves(
        Promise.resolve({
          id_user: 1,
          id_password: 1,
        })
      );
      fakeUpdate.resolves(
        Promise.reject(new Sequelize.ForeignKeyConstraintError())
      );
      await Promise.resolve(
        user_builder.update_password({
          id_user: 1,
          hashed_password: 'arzaoreigazoireanornco',
        })
      );
      chai.fail('Chai expected to get DBForeignKeyConstraintError.');
    } catch (err) {
      chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
        where: {
          id_user: 1,
        },
      });
      chai.expect(fakeUpdate).to.have.been.calledOnceWithExactly(
        {
          pwd: 'arzaoreigazoireanornco',
        },
        {
          where: {
            id_password: 1,
          },
        }
      );
      chai.expect(err).to.be.instanceOf(DBForeignKeyConstraintError);
      chai
        .expect(err.message)
        .to.be.equal(
          'The foreign key cannot be deleted because it is still in use.'
        );
    }
  });
});

describe('user_builder.create()', () => {
  let fakeUserCreate, fakePasswordCreate;
  beforeEach(() => {
    fakeUserCreate = sinon.stub(db.caelus.USERS, 'create');
    fakePasswordCreate = sinon.stub(db.caelus.PASSWORD, 'create');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with existing good args and should return a User object.', async () => {
    fakeUserCreate.resolves(
      Promise.resolve({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        id_password: 1,
        id_role: 2,
      })
    );
    fakePasswordCreate.resolves(
      Promise.resolve({
        id_password: 1,
      })
    );
    const result = await user_builder.create({
      lastname: 'LEFEBVRE',
      firstname: 'Benoit',
      mail: 'benoit.lefebvre@getcaelus.cloud',
      id_role: 2,
      hashed_password: 'egzoeirgzzrtgjoi',
    });
    chai.expect(result).to.be.deep.equal(
      new User({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
      })
    );
    chai.expect(fakePasswordCreate).to.have.been.calledOnceWithExactly({
      pwd: 'egzoeirgzzrtgjoi',
    });
    chai.expect(fakeUserCreate).to.have.been.calledOnceWithExactly({
      lastname: 'LEFEBVRE',
      firstname: 'Benoit',
      mail: 'benoit.lefebvre@getcaelus.cloud',
      id_role: 2,
      id_password: 1,
    });
  });
  it('called with missing arguments and should reject with an error.', async () => {
    try {
      await user_builder.create({
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
      });
      chai.expect.fail('Chai expected to get MissingArgumentError.');
    } catch (err) {
      chai.expect(fakePasswordCreate).to.not.have.been.called;
      chai.expect(fakeUserCreate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.be.equal(
          'One or multiple arguments (mail,id_role,hashed_password) are missing.'
        );
    }
  });
  it('called  and should reject with an DBConnexionRefused error.', async () => {
    try {
      fakePasswordCreate.resolves(
        Promise.reject(
          new Sequelize.ConnectionRefusedError(
            'error during connexion to database'
          )
        )
      );
      await user_builder.create({
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        id_role: 2,
        hashed_password: 'egzoeirgzzrtgjoi',
      });
      chai.expect.fail('Chai expected to get DBConnexionRefused.');
    } catch (err) {
      chai.expect(fakePasswordCreate).to.have.been.calledOnce;
      chai.expect(fakeUserCreate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
    }
  });
});
describe('user_builder.get_list()', () => {
  let fakeFindAll;
  beforeEach(() => {
    fakeFindAll = sinon.stub(db.caelus.USERS, 'findAll');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with ids and should get a list a users.', async () => {
    fakeFindAll.resolves(
      Promise.resolve([
        {
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          USER_ROLE: {
            label: 'PROFESSEUR',
          },
        },
        {
          id_user: 2,
          lastname: 'LEFEBVRE',
          firstname: 'Ulfi',
          mail: 'ulfi.lefebvre@getcaelus.cloud',
          USER_ROLE: {
            label: 'PROFESSEUR',
          },
        },
      ])
    );
    const users = await user_builder.get_list({
      ids: [1, 2],
    });
    chai.expect(fakeFindAll).to.be.calledOnceWithExactly({
      where: {
        id_user: {
          [Op.in]: [1, 2],
        },
      },
      include: {
        model: db.caelus.USER_ROLE,
        required: true,
      },
    });
    chai.expect(users).to.deep.equal([
      new User({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
      }),
      new User({
        id_user: 2,
        lastname: 'LEFEBVRE',
        firstname: 'Ulfi',
        mail: 'ulfi.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
      }),
    ]);
  });
  it('called with ids that have no user and should get an empty list of users.', async () => {
    fakeFindAll.resolves(Promise.resolve([]));
    const users = await user_builder.get_list({
      ids: [999],
    });
    chai.expect(fakeFindAll).to.be.calledOnceWithExactly({
      where: {
        id_user: {
          [Op.in]: [999],
        },
      },
      include: {
        model: db.caelus.USER_ROLE,
        required: true,
      },
    });
    chai.expect(users).to.deep.equal([]);
  });
  it('called with missing ids and should reject with MissingArgument.', async () => {
    try {
      await user_builder.get_list();
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });
  it('called with ids that have no user and should get an empty list of users.', async () => {
    try {
      fakeFindAll.resolves(
        Promise.reject(new Sequelize.ConnectionRefusedError())
      );
      await user_builder.get_list({
        ids: [999],
      });
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
    }
  });
});
