import * as user_controller from '../../src/controllers/user.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.service.js';
import { User } from '../../src/objects/User.js';
import {
  DBConnexionRefused,
  DBObjectNotFound,
  MissingArgumentError,
  PasswordIsTooShort,
} from '../../src/utils/errors.service.js';
chai.use(sinonChai);

describe('user_controller.me()', () => {
  let fakeUserGet, fakeReq, fakeRes;
  beforeEach(() => {
    fakeUserGet = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      method: 'GET',
      originalUrl: '/me',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it("called with good arguments and should send the current user's informations.", async () => {
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
    await user_controller.me(fakeReq, fakeRes, {
      user_get: fakeUserGet,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: new User({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
        pwd: undefined,
      }).public_format(),
    });
    chai.expect(fakeRes.status.calledOnceWith(200)).to.be.true;
  });
  it('called with good arguments and should return with a user not found error.', async () => {
    fakeUserGet.resolves(
      Promise.reject(new DBObjectNotFound('The user could not be found.'))
    );
    await user_controller.me(fakeReq, fakeRes, {
      user_get: fakeUserGet,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'DBObjectNotFound',
        message: 'The user could not be found.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(404)).to.be.true;
  });
});
describe('user_controller.update_password()', () => {
  let fakeUpdate, fakeReq, fakeRes;
  beforeEach(() => {
    fakeUpdate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      body: {
        password: 'Test1.dze',
        old_password: 'ezraer',
      },
      method: 'PUT',
      originalUrl: '/user/password',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it("called with good arguments and should current user's password.", async () => {
    fakeUpdate.resolves(
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
    await user_controller.update_password(fakeReq, fakeRes, {
      user_update_password: fakeUpdate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: new User({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
        pwd: undefined,
      }).public_format(),
    });
    chai.expect(fakeRes.status.calledOnceWith(200)).to.be.true;
  });
  it('called with non convenient password and should return with .', async () => {
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      body: {
        password: 'Tes',
        old_password: 'zerzef',
      },
      method: 'PUT',
      originalUrl: '/user/password',
    };
    fakeUpdate.resolves(
      Promise.reject(
        new PasswordIsTooShort(
          'The password must contains at least 8 characters.'
        )
      )
    );
    await user_controller.update_password(fakeReq, fakeRes, {
      user_update_password: fakeUpdate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'PasswordIsTooShort',
        message: 'The password must contains at least 8 characters.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(401)).to.be.true;
  });
});
describe('user_controller.list()', () => {
  let fakeUserList, fakeReq, fakeRes;
  beforeEach(() => {
    fakeUserList = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      method: 'GET',
      originalUrl: '/session/list_by_role',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it("called with good arguments and should send the current user's informations.", async () => {
    fakeUserList.resolves(
      Promise.resolve([
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'ETUDIANT',
          pwd: undefined,
        }),
        new User({
          id_user: 4,
          lastname: 'URBANSKI',
          firstname: 'Daphné',
          mail: 'daphne.urbanski@getcaelus.cloud',
          role: 'ETUDIANT',
          pwd: undefined,
        }),
      ])
    );
    fakeReq.query = {
      user_role: 'ETUDIANT',
    };
    await user_controller.list(fakeReq, fakeRes, {
      user_list: fakeUserList,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: [
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'ETUDIANT',
          pwd: undefined,
        }).public_format(),
        new User({
          id_user: 4,
          lastname: 'URBANSKI',
          firstname: 'Daphné',
          mail: 'daphne.urbanski@getcaelus.cloud',
          role: 'ETUDIANT',
          pwd: undefined,
        }).public_format(),
      ],
    });
    chai.expect(fakeRes.status.calledOnceWith(200)).to.be.true;
  });
  it('called with good arguments and should return with a user not found error.', async () => {
    fakeUserList.resolves(Promise.reject(new DBConnexionRefused('Oops.')));
    fakeReq.query = {
      user_role: 'ETUDIANT',
    };
    await user_controller.list(fakeReq, fakeRes, {
      user_list: fakeUserList,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'DBConnexionRefused',
        message: 'Oops.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(500)).to.be.true;
  });
  it('called with not allowed user_role and should return with an error.', async () => {
    fakeReq.query = {
      user_role: 'DIRECTEUR',
    };
    await user_controller.list(fakeReq, fakeRes, {
      user_list: fakeUserList,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'ParameterMisformed',
        message: 'The req.query.user_role parameter is misformed.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(400)).to.be.true;
  });
});
describe('user_controller.create()', () => {
  let fakeCreate, fakeReq, fakeRes;
  beforeEach(() => {
    fakeCreate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      body: {
        password: 'Test1.dze',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
      },
      method: 'POST',
      originalUrl: '/user/create',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it("called with good arguments and should current user's password.", async () => {
    fakeCreate.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: 'Test1.dze',
        })
      )
    );
    await user_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: new User({
        id_user: 1,
        lastname: 'LEFEBVRE',
        firstname: 'Benoit',
        mail: 'benoit.lefebvre@getcaelus.cloud',
        role: 'PROFESSEUR',
        pwd: 'Test1.dze',
      }).toJSON(),
    });
    chai.expect(fakeRes.status.calledOnceWith(200)).to.be.true;
  });
  it('called with missing args and should return with an error.', async () => {
    try {
      fakeCreate.resolves(
        Promise.reject(
          new MissingArgumentError('A required argument is missing.')
        )
      );
      await user_controller.create(fakeReq, fakeRes, {
        create: fakeCreate,
      });
      throw new Error('Should have thrown a MissingArgumentError.');
    } catch (err) {
      chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
        result: {
          error: 'MissingArgumentError',
          message: 'A required argument is missing.',
        },
      });
      chai.expect(fakeRes.status.calledOnceWith(400)).to.be.true;
    }
  });
});
