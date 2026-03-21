import * as user_controller from '../../src/controllers/user.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.util.js';
import {
  DBConnexionRefused,
  ParameterMisformed,
} from '../../src/utils/errors.util.js';
import { User } from '../../src/objects/User.js';

chai.use(sinonChai);

describe('user_controller.me()', () => {
  let fakeGet, fakeReq, fakeRes;

  beforeEach(() => {
    fakeGet = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      method: 'GET',
      originalUrl: '/user/me',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called and should return current user information.', async () => {
    const mockUser = new User({
      id_user: 1,
      lastname: 'Doe',
      firstname: 'John',
      mail: 'john.doe@example.com',
      role: 'STUDENT',
    });

    fakeGet.resolves(Promise.resolve(mockUser));

    await user_controller.me(fakeReq, fakeRes, {
      user_get: fakeGet,
    });

    chai.expect(fakeGet).to.have.been.calledOnceWithExactly({ id_user: 1 });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Informations transmitted.');
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeGet.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await user_controller.me(fakeReq, fakeRes, {
      user_get: fakeGet,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('Connexion to the database refused.');
    chai.expect(jsonCall.error.type).to.equal('DBConnexionRefused');
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
        old_password: 'old_password_123',
        password: 'new_password_123',
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

  it('called with good arguments and should update password.', async () => {
    fakeUpdate.resolves(Promise.resolve());

    await user_controller.update_password(fakeReq, fakeRes, {
      user_update_password: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.have.been.calledOnceWithExactly({
      id_user: 1,
      old_password: 'old_password_123',
      password: 'new_password_123',
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Password changed.');
  });

  it('called without old_password and should reject with validation error.', async () => {
    fakeReq.body = {
      password: 'new_password_123',
    };

    await user_controller.update_password(fakeReq, fakeRes, {
      user_update_password: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without password and should reject with validation error.', async () => {
    fakeReq.body = {
      old_password: 'old_password_123',
    };

    await user_controller.update_password(fakeReq, fakeRes, {
      user_update_password: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeUpdate.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await user_controller.update_password(fakeReq, fakeRes, {
      user_update_password: fakeUpdate,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('Connexion to the database refused.');
    chai.expect(jsonCall.error.type).to.equal('DBConnexionRefused');
  });
});

describe('user_controller.list()', () => {
  let fakeList, fakeReq, fakeRes;

  beforeEach(() => {
    fakeList = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        user_role: 'STUDENT',
      },
      method: 'GET',
      originalUrl: '/user/list?user_role=STUDENT',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid role and should return list of users.', async () => {
    const mockUsers = [
      new User({
        id_user: 1,
        lastname: 'Doe',
        firstname: 'John',
        mail: 'john.doe@example.com',
        role: 'STUDENT',
      }),
      new User({
        id_user: 2,
        lastname: 'Smith',
        firstname: 'Jane',
        mail: 'jane.smith@example.com',
        role: 'STUDENT',
      }),
    ];

    fakeList.resolves(Promise.resolve(mockUsers));

    await user_controller.list(fakeReq, fakeRes, {
      user_list: fakeList,
    });

    chai.expect(fakeList).to.have.been.calledOnceWithExactly({
      user_role: 'STUDENT',
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('List of users transmitted.');
  });

  it('called without user_role and should reject with validation error.', async () => {
    fakeReq.query = {};

    await user_controller.list(fakeReq, fakeRes, {
      user_list: fakeList,
    });

    chai.expect(fakeList).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with invalid user_role and should reject with validation error.', async () => {
    fakeReq.query = {
      user_role: 'INVALID',
    };

    await user_controller.list(fakeReq, fakeRes, {
      user_list: fakeList,
    });

    chai.expect(fakeList).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeList.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await user_controller.list(fakeReq, fakeRes, {
      user_list: fakeList,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('Connexion to the database refused.');
    chai.expect(jsonCall.error.type).to.equal('DBConnexionRefused');
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
        password: 'new_password_123',
        mail: 'john.doe@example.com',
        lastname: 'Doe',
        firstname: 'John',
        role: 'STUDENT',
      },
      method: 'POST',
      originalUrl: '/user',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should create new user.', async () => {
    const mockUser = new User({
      id_user: 1,
      lastname: 'Doe',
      firstname: 'John',
      mail: 'john.doe@example.com',
      role: 'STUDENT',
    });

    fakeCreate.resolves(Promise.resolve(mockUser));

    await user_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeCreate).to.have.been.calledOnceWithExactly({
      mail: 'john.doe@example.com',
      pwd: 'new_password_123',
      role: 'STUDENT',
      lastname: 'Doe',
      firstname: 'John',
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(201);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('User created.');
  });

  it('called without mail and should reject with validation error.', async () => {
    fakeReq.body = {
      password: 'new_password_123',
      lastname: 'Doe',
      firstname: 'John',
      role: 'STUDENT',
    };

    await user_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with invalid role and should reject with ParameterMisformed.', async () => {
    fakeReq.body.role = 'ADMINISTRATOR';

    await user_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai.expect(jsonCall.error.type).to.equal('ParameterMisformed');
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeCreate.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await user_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('Connexion to the database refused.');
    chai.expect(jsonCall.error.type).to.equal('DBConnexionRefused');
  });
});
