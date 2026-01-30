import * as user_service from '../../src/services/user.service.js';
import { User } from '../../src/objects/User.js';
import {
  MissingArgumentError,
  ParameterMisformed,
  PasswordMissingSpecialChars,
} from '../../src/utils/errors.service.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('user.service.get()', () => {
  let fakeUserGet;
  beforeEach(() => {
    fakeUserGet = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good arg and should get the corresponding User object.', async () => {
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: 'ThisIsMDP',
        })
      )
    );
    const user = await user_service.get(
      { id_user: 1 },
      { user_get: fakeUserGet }
    );
    chai.expect(user).to.deep.equal(
      new User({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
        pwd: 'ThisIsMDP',
      })
    );
    chai.expect(fakeUserGet).to.have.been.calledOnceWithExactly({
      id_user: 1,
    });
  });
  it('called with missing arg and should get MissingArgument Error.', async () => {
    try {
      await user_service.get({}, { user_get: fakeUserGet });
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
  it('called with misformed arg and should get ParameterMisformed Error.', async () => {
    try {
      await user_service.get(
        { id_user: 'misformed' },
        { user_get: fakeUserGet }
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

describe('user.service.list_by_role()', () => {
  let fakeUserList;
  beforeEach(() => {
    fakeUserList = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it("called with good arg and should get the corresponding User object's array.", async () => {
    fakeUserList.resolves(
      Promise.resolve([
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: 'ThisIsMDP',
        }),
        new User({
          id_user: 3,
          lastname: 'LEFEBVRE',
          firstname: 'Ulfi',
          mail: 'ulfi.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: 'ThisIsMDP',
        }),
      ])
    );
    const users = await user_service.list_by_role(
      { user_role: 'PROFESSEUR' },
      { user_list: fakeUserList }
    );
    chai.expect(users).to.deep.equal([
      new User({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
        pwd: 'ThisIsMDP',
      }),
      new User({
        id_user: 3,
        lastname: 'LEFEBVRE',
        firstname: 'Ulfi',
        mail: 'ulfi.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
        pwd: 'ThisIsMDP',
      }),
    ]);
    chai.expect(fakeUserList).to.have.been.calledOnceWithExactly({
      role: 'PROFESSEUR',
    });
  });
  it('called with missing arg and should get MissingArgument Error.', async () => {
    try {
      await user_service.list_by_role({}, { user_list: fakeUserList });
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserList).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (user_role) are missing.');
    }
  });
  it('called with missing arg and should get ParameterMisformed Error.', async () => {
    try {
      await user_service.list_by_role(
        { user_role: 'misformed' },
        { user_list: fakeUserList }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserList).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.user_role parameter is misformed.');
    }
  });
});

describe('user.service.update_password()', () => {
  let fakeUpdatePassword, fakeUserGet, fakeBCrypt;
  beforeEach(() => {
    fakeUpdatePassword = sinon.stub();
    fakeUserGet = sinon.stub();
    fakeBCrypt = {
      compareSync: sinon.stub(),
      hashSync: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good props and should update password.', async () => {
    fakeBCrypt.compareSync.returns(true);
    fakeBCrypt.hashSync.returns('hashed');
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: undefined,
        })
      )
    );
    fakeUpdatePassword.resolves(
      Promise.resolve("The user's password has been changed.")
    );
    const user = await user_service.update_password(
      {
        id_user: 1,
        password: 'Thisis1MDP.',
        old_password: 'You',
      },
      {
        user_update_password: fakeUpdatePassword,
        user_get: fakeUserGet,
        bcrypt: fakeBCrypt,
      }
    );
    chai.expect(fakeUpdatePassword).to.be.calledOnce;
    chai.expect(fakeUserGet).to.have.been.calledOnceWithExactly({
      id_user: 1,
    });
    chai.expect(user).to.deep.equal(
      new User({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
        pwd: undefined,
      })
    );
  });
  it('called with misformed id_user and should reject with ParameterMisformed.', async () => {
    try {
      fakeBCrypt.compareSync.returns(true);
      fakeBCrypt.hashSync.returns('hashed');
      await user_service.update_password(
        {
          id_user: 'misformed',
          password: 'Thisis1MDP.',
          old_password: 'You',
        },
        {
          user_update_password: fakeUpdatePassword,
          user_get: fakeUserGet,
          bcrypt: fakeBCrypt,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai.expect(fakeUserGet).to.have.not.been.called;
      chai.expect(fakeUpdatePassword).to.have.not.been.called;
      chai
        .expect(err.message)
        .to.equal('The props.id_user parameter is misformed.');
    }
  });
  it('called with non convenient password and should reject with PasswordMissingSpecialChars.', async () => {
    try {
      fakeBCrypt.compareSync.returns(true);
      fakeBCrypt.hashSync.returns('hashed');
      fakeUserGet.resolves(
        Promise.resolve(
          new User({
            id_user: 1,
            lastname: 'LEFEBVRE',
            firstname: 'Benoit',
            mail: 'benoit.lefebvre@getcaelus.cloud',
            role: 'PROFESSEUR',
            pwd: undefined,
          })
        )
      );
      await user_service.update_password(
        {
          id_user: 1,
          password: 'Thisis1MDP',
          old_password: 'You',
        },
        {
          user_update_password: fakeUpdatePassword,
          user_get: fakeUserGet,
          bcrypt: fakeBCrypt,
        }
      );
      chai.expect.fail(
        'chai.expected to throw PasswordMissingSpecialChars, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(PasswordMissingSpecialChars);
      chai.expect(fakeUserGet).to.have.been.calledOnceWithExactly({
        id_user: 1,
      });
      chai.expect(fakeUpdatePassword).to.have.not.been.called;
      chai
        .expect(err.message)
        .to.equal('The password must contains at least 1 special char.');
    }
  });
  it('called with missing password and should reject with MissingArgumentError.', async () => {
    try {
      fakeBCrypt.compareSync.returns(true);
      fakeBCrypt.hashSync.returns('hashed');
      await user_service.update_password(
        {
          id_user: 1,
        },
        {
          user_update_password: fakeUpdatePassword,
          user_get: fakeUserGet,
          bcrypt: fakeBCrypt,
        }
      );
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(fakeUserGet).to.have.not.been.called;
      chai.expect(fakeUpdatePassword).to.have.not.been.called;
      chai
        .expect(err.message)
        .to.equal(
          'One or multiple arguments (password,old_password) are missing.'
        );
    }
  });
});

describe('user.service.create()', () => {
  let fakeCreate, fakeRoleByLabel, fakeBCrypt;
  beforeEach(() => {
    fakeCreate = sinon.stub();
    fakeRoleByLabel = sinon.stub();
    fakeBCrypt = {
      hashSync: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good props and should create a new user.', async () => {
    fakeBCrypt.hashSync.returns('hashed');
    fakeCreate.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
        })
      )
    );
    fakeRoleByLabel.resolves(
      Promise.resolve({
        id_role: 2,
        label: 'PROFESSEUR',
      })
    );
    const user = await user_service.create(
      {
        mail: 'benoit.lefebvre@getcaelus.cloud',
        pwd: 'Thisis1MDP.',
        role: 'PROFESSEUR',
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
      },
      {
        create: fakeCreate,
        role_by_label: fakeRoleByLabel,
        bcrypt: fakeBCrypt,
      }
    );
    chai.expect(fakeCreate).to.be.calledOnceWithExactly({
      firstname: 'Benoit',
      lastname: 'LEFEBVRE',
      mail: 'benoit.lefebvre@getcaelus.cloud',
      id_role: 2,
      hashed_password: 'hashed',
    });
    chai.expect(fakeRoleByLabel).to.have.been.calledOnceWithExactly({
      label: 'PROFESSEUR',
    });
    chai.expect(user).to.deep.equal(
      new User({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
        pwd: 'Thisis1MDP.',
      })
    );
  });

  it('called with missing password and should reject with MissingArgumentError.', async () => {
    try {
      fakeBCrypt.hashSync.returns('hashed');
      await user_service.create(
        {
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
        },
        {
          role_by_label: fakeRoleByLabel,
          create: fakeCreate,
          bcrypt: fakeBCrypt,
        }
      );
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(fakeCreate).to.have.not.been.called;
      chai.expect(fakeRoleByLabel).to.have.not.been.called;
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (pwd) are missing.');
    }
  });
});
