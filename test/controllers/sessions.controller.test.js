import * as sessions_controller from '../../src/controllers/sessions.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.util.js';
import { DBConnexionRefused } from '../../src/utils/errors.util.js';
import { Session } from '../../src/objects/Session.js';
import { Environment } from '../../src/objects/Environment.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
import { User } from '../../src/objects/User.js';
import moment from 'moment-timezone';

chai.use(sinonChai);

describe('sessions_controller.create()', () => {
  let fakeCreate, fakeReq, fakeRes;

  beforeEach(() => {
    fakeCreate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      body: {
        label_session: 'Test Session',
        label_application: 'Test Application',
        id_environment: 1,
        id_datacenter: 1,
        begin_date: '2026-03-01T10:00:00Z',
        end_date: '2026-03-01T12:00:00Z',
        professors: JSON.stringify([1, 2]),
        users: JSON.stringify([3, 4, 5]),
      },
      method: 'POST',
      originalUrl: '/session',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should create new session.', async () => {
    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'DC-East',
      city: 'New York',
      provider: 'AWS',
    });

    const mockSession = new Session({
      id_session: 1,
      label: 'Test Session',
      begin_date: '2026-03-01T10:00:00Z',
      end_date: '2026-03-01T12:00:00Z',
      environment: mockEnvironment,
      datacenter: mockDatacenter,
      applications: [],
      users: [],
      professors: [],
    });

    fakeCreate.resolves(Promise.resolve(mockSession));

    await sessions_controller.create(fakeReq, fakeRes, {
      session_create: fakeCreate,
    });

    chai.expect(fakeCreate).to.have.been.calledOnce;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Session started.');
  });

  it('called without label_session and should reject with validation error.', async () => {
    fakeReq.body = {
      label_application: 'Test Application',
      id_environment: 1,
      id_datacenter: 1,
      begin_date: '2026-03-01T10:00:00Z',
      end_date: '2026-03-01T12:00:00Z',
      professors: JSON.stringify([1]),
      users: JSON.stringify([2]),
    };

    await sessions_controller.create(fakeReq, fakeRes, {
      session_create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without id_environment and should reject with validation error.', async () => {
    fakeReq.body = {
      label_session: 'Test Session',
      label_application: 'Test Application',
      id_datacenter: 1,
      begin_date: '2026-03-01T10:00:00Z',
      end_date: '2026-03-01T12:00:00Z',
      professors: JSON.stringify([1]),
      users: JSON.stringify([2]),
    };

    await sessions_controller.create(fakeReq, fakeRes, {
      session_create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without begin_date and should reject with validation error.', async () => {
    fakeReq.body = {
      label_session: 'Test Session',
      label_application: 'Test Application',
      id_environment: 1,
      id_datacenter: 1,
      end_date: '2026-03-01T12:00:00Z',
      professors: JSON.stringify([1]),
      users: JSON.stringify([2]),
    };

    await sessions_controller.create(fakeReq, fakeRes, {
      session_create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without professors array and should reject with validation error.', async () => {
    fakeReq.body = {
      label_session: 'Test Session',
      label_application: 'Test Application',
      id_environment: 1,
      id_datacenter: 1,
      begin_date: '2026-03-01T10:00:00Z',
      end_date: '2026-03-01T12:00:00Z',
      users: JSON.stringify([2]),
    };

    await sessions_controller.create(fakeReq, fakeRes, {
      session_create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeCreate.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await sessions_controller.create(fakeReq, fakeRes, {
      session_create: fakeCreate,
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

describe('sessions_controller.list()', () => {
  let fakeList, fakeReq, fakeRes;

  beforeEach(() => {
    fakeList = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {},
      method: 'GET',
      originalUrl: '/session/list',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called and should return list of sessions.', async () => {
    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'DC-East',
      city: 'New York',
      provider: 'AWS',
    });

    const mockSessions = [
      new Session({
        id_session: 1,
        label: 'Session 1',
        begin_date: '2026-03-01T10:00:00Z',
        end_date: '2026-03-01T12:00:00Z',
        environment: mockEnvironment,
        datacenter: mockDatacenter,
        applications: [],
        users: [],
        professors: [],
      }),
      new Session({
        id_session: 2,
        label: 'Session 2',
        begin_date: '2026-03-02T10:00:00Z',
        end_date: '2026-03-02T12:00:00Z',
        environment: mockEnvironment,
        datacenter: mockDatacenter,
        applications: [],
        users: [],
        professors: [],
      }),
    ];

    fakeList.resolves(Promise.resolve(mockSessions));

    await sessions_controller.list(fakeReq, fakeRes, {
      session_list: fakeList,
    });

    chai.expect(fakeList).to.have.been.calledOnce;
    const callArg = fakeList.firstCall.args[0];
    chai.expect(callArg.id_user).to.equal(1);
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('List of sessions transmitted.');
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeList.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await sessions_controller.list(fakeReq, fakeRes, {
      session_list: fakeList,
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

describe('sessions_controller.get()', () => {
  let fakeGet, fakeReq, fakeRes;

  beforeEach(() => {
    fakeGet = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_session: 1,
      },
      method: 'GET',
      originalUrl: '/session?id_session=1',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_session and should return session.', async () => {
    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'DC-East',
      city: 'New York',
      provider: 'AWS',
    });

    const mockSession = new Session({
      id_session: 1,
      label: 'Test Session',
      begin_date: '2026-03-01T10:00:00Z',
      end_date: '2026-03-01T12:00:00Z',
      environment: mockEnvironment,
      datacenter: mockDatacenter,
      applications: [],
      users: [],
      professors: [],
    });

    fakeGet.resolves(Promise.resolve(mockSession));

    await sessions_controller.get(fakeReq, fakeRes, {
      session_get: fakeGet,
    });

    chai.expect(fakeGet).to.have.been.calledOnce;
    const callArg = fakeGet.firstCall.args[0];
    chai.expect(callArg.id_session).to.equal(1);
    chai.expect(callArg.id_user).to.equal(1);
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Session transmitted.');
  });

  it('called without id_session and should reject with validation error.', async () => {
    fakeReq.query = {};

    await sessions_controller.get(fakeReq, fakeRes, {
      session_get: fakeGet,
    });

    chai.expect(fakeGet).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with negative id_session and should reject with validation error.', async () => {
    fakeReq.query = {
      id_session: -1,
    };

    await sessions_controller.get(fakeReq, fakeRes, {
      session_get: fakeGet,
    });

    chai.expect(fakeGet).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeGet.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await sessions_controller.get(fakeReq, fakeRes, {
      session_get: fakeGet,
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
