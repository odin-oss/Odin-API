import * as applications_controller from '../../src/controllers/applications.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import moment from 'moment-timezone';
import {
  DBConnexionRefused,
  DBObjectNotFound,
  MissingArgumentError,
} from '../../src/utils/errors.util.js';
import CONFIG from '../../src/config/config.js';
import * as token_service from '../../src/utils/token.util.js';
import { Application } from '../../src/objects/Application.js';
import { Environment } from '../../src/objects/Environment.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
import { History } from '../../src/objects/History.js';

chai.use(sinonChai);

describe('applications_controller.list()', () => {
  let fakeList, fakeReq, fakeRes, saveCONFIG;

  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeList = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      method: 'GET',
      originalUrl: '/application/list',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
    CONFIG.ms_apps_url = saveCONFIG.ms_apps_url;
  });

  it('called with good arguments and should return list of applications.', async () => {
    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'dc1',
      provider: 'aws',
    });

    const mockApplications = [
      new Application({
        id_application: 1,
        custom_label: 'My App',
        generated_label: 'app-label-1',
        creation_date: moment.tz(CONFIG.APP_TZ),
        hash: 'abc123',
        username: 'user1',
        password: 'pass123',
        id_user: 1,
        id_environment: 1,
        state_application: 'Ready',
        state_changed_date: moment.tz(CONFIG.APP_TZ),
        programming_shutdown_date: null,
        environment: mockEnvironment,
        datacenter: mockDatacenter,
      }),
    ];

    fakeList.resolves(Promise.resolve(mockApplications));

    await applications_controller.list(fakeReq, fakeRes, {
      applications_list: fakeList,
    });

    chai.expect(fakeList).to.have.been.calledOnceWithExactly({ id_user: 1 });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeList.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await applications_controller.list(fakeReq, fakeRes, {
      applications_list: fakeList,
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

describe('applications_controller.get()', () => {
  let fakeGet, fakeReq, fakeRes, saveCONFIG;

  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeGet = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_application: 8,
      },
      method: 'GET',
      originalUrl: '/application',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
    CONFIG.ms_apps_url = saveCONFIG.ms_apps_url;
  });

  it('called with id_application and should return application informations.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';

    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'dc1',
      provider: 'aws',
    });

    const mockApplication = new Application({
      id_application: 8,
      custom_label: 'Test App',
      generated_label: 'test-app-label',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'test123',
      username: 'testuser',
      password: 'testpass',
      id_user: 1,
      id_environment: 1,
      state_application: 'Ready',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      programming_shutdown_date: null,
      environment: mockEnvironment,
      datacenter: mockDatacenter,
    });

    fakeGet.resolves(Promise.resolve(mockApplication));

    await applications_controller.get(fakeReq, fakeRes, {
      application_get: fakeGet,
    });

    chai.expect(fakeGet).to.have.been.calledOnceWithExactly({
      id_application: 8,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
  });

  it('called with key and should return application informations.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';

    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'dc1',
      provider: 'aws',
    });

    const mockApplication = new Application({
      id_application: 8,
      custom_label: 'Test App',
      generated_label: 'test-app-label',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'test123',
      username: 'testuser',
      password: 'testpass',
      id_user: 1,
      id_environment: 1,
      state_application: 'Ready',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      programming_shutdown_date: null,
      environment: mockEnvironment,
      datacenter: mockDatacenter,
    });

    fakeReq.query = { key: 'test-app-label' };
    fakeGet.resolves(Promise.resolve(mockApplication));

    await applications_controller.get(fakeReq, fakeRes, {
      application_get: fakeGet,
    });

    chai.expect(fakeGet).to.have.been.calledOnceWithExactly({
      key: 'test-app-label',
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
  });

  it('called without id_application or key and should reject with MissingArgumentError.', async () => {
    fakeReq.query = {};

    await applications_controller.get(fakeReq, fakeRes, {
      application_get: fakeGet,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('The query parameter (id_application,key) is missing.');
    chai.expect(jsonCall.error.type).to.equal('MissingArgumentError');
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeGet.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await applications_controller.get(fakeReq, fakeRes, {
      application_get: fakeGet,
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

describe('applications_controller.start()', () => {
  let fakeStart, fakeReq, fakeRes, saveCONFIG;

  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeStart = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_application: 8,
      },
      method: 'PUT',
      originalUrl: '/application/start',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
    CONFIG.ms_apps_url = saveCONFIG.ms_apps_url;
  });

  it('called with good arguments and should start the application.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';

    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'dc1',
      provider: 'aws',
    });

    const mockApplication = new Application({
      id_application: 8,
      custom_label: 'Test App',
      generated_label: 'test-app-label',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'test123',
      username: 'testuser',
      password: 'testpass',
      id_user: 1,
      id_environment: 1,
      state_application: 'Ready',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      programming_shutdown_date: null,
      environment: mockEnvironment,
      datacenter: mockDatacenter,
    });

    fakeStart.resolves(Promise.resolve(mockApplication));

    await applications_controller.start(fakeReq, fakeRes, {
      application_start: fakeStart,
    });

    chai.expect(fakeStart).to.have.been.calledOnceWithExactly({
      id_application: 8,
      state_application: 'Ready',
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeStart.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await applications_controller.start(fakeReq, fakeRes, {
      application_start: fakeStart,
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

describe('applications_controller.stop()', () => {
  let fakeStop, fakeReq, fakeRes, saveCONFIG;

  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeStop = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_application: 8,
      },
      method: 'PUT',
      originalUrl: '/application/stop',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
    CONFIG.ms_apps_url = saveCONFIG.ms_apps_url;
  });

  it('called with good arguments and should stop the application.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';

    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'dc1',
      provider: 'aws',
    });

    const mockApplication = new Application({
      id_application: 8,
      custom_label: 'Test App',
      generated_label: 'test-app-label',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'test123',
      username: 'testuser',
      password: 'testpass',
      id_user: 1,
      id_environment: 1,
      state_application: 'Off',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      programming_shutdown_date: null,
      environment: mockEnvironment,
      datacenter: mockDatacenter,
    });

    fakeStop.resolves(Promise.resolve(mockApplication));

    await applications_controller.stop(fakeReq, fakeRes, {
      application_stop: fakeStop,
    });

    chai.expect(fakeStop).to.have.been.calledOnceWithExactly({
      id_application: 8,
      state_application: 'Off',
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeStop.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await applications_controller.stop(fakeReq, fakeRes, {
      application_stop: fakeStop,
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

describe('applications_controller.deletion()', () => {
  let fakeDelete, fakeReq, fakeRes, saveCONFIG;

  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeDelete = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_application: 8,
        backup_storage: 'true',
      },
      method: 'DELETE',
      originalUrl: '/application',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
    CONFIG.ms_apps_url = saveCONFIG.ms_apps_url;
  });

  it('called with good arguments and backup_storage true should delete the application.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';

    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'dc1',
      provider: 'aws',
    });

    const mockApplication = new Application({
      id_application: 8,
      custom_label: 'Test App',
      generated_label: 'test-app-label',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'test123',
      username: 'testuser',
      password: 'testpass',
      id_user: 1,
      id_environment: 1,
      state_application: 'Off',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      programming_shutdown_date: null,
      environment: mockEnvironment,
      datacenter: mockDatacenter,
    });

    fakeDelete.resolves(Promise.resolve(mockApplication));

    await applications_controller.deletion(fakeReq, fakeRes, {
      application_delete: fakeDelete,
    });

    chai.expect(fakeDelete).to.have.been.calledOnceWithExactly({
      id_application: 8,
      backup_storage: true,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
  });

  it('called with backup_storage false should delete without backup.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeReq.query.backup_storage = 'false';

    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'dc1',
      provider: 'aws',
    });

    const mockApplication = new Application({
      id_application: 8,
      custom_label: 'Test App',
      generated_label: 'test-app-label',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'test123',
      username: 'testuser',
      password: 'testpass',
      id_user: 1,
      id_environment: 1,
      state_application: 'Off',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      programming_shutdown_date: null,
      environment: mockEnvironment,
      datacenter: mockDatacenter,
    });

    fakeDelete.resolves(Promise.resolve(mockApplication));

    await applications_controller.deletion(fakeReq, fakeRes, {
      application_delete: fakeDelete,
    });

    chai.expect(fakeDelete).to.have.been.calledOnceWithExactly({
      id_application: 8,
      backup_storage: false,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
  });

  it('called without backup_storage should default to true.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    delete fakeReq.query.backup_storage;

    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'dc1',
      provider: 'aws',
    });

    const mockApplication = new Application({
      id_application: 8,
      custom_label: 'Test App',
      generated_label: 'test-app-label',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'test123',
      username: 'testuser',
      password: 'testpass',
      id_user: 1,
      id_environment: 1,
      state_application: 'Off',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      programming_shutdown_date: null,
      environment: mockEnvironment,
      datacenter: mockDatacenter,
    });

    fakeDelete.resolves(Promise.resolve(mockApplication));

    await applications_controller.deletion(fakeReq, fakeRes, {
      application_delete: fakeDelete,
    });

    chai.expect(fakeDelete).to.have.been.calledOnceWithExactly({
      id_application: 8,
      backup_storage: true,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeDelete.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await applications_controller.deletion(fakeReq, fakeRes, {
      application_delete: fakeDelete,
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

describe('applications_controller.create()', () => {
  let fakeCreate, fakeReq, fakeRes, saveCONFIG;

  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeCreate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      body: {
        id_environment: 2,
        id_datacenter: 1,
        label: 'My New App',
      },
      method: 'POST',
      originalUrl: '/application/',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
    CONFIG.ms_apps_url = saveCONFIG.ms_apps_url;
  });

  it('called with good arguments and should create the application.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';

    const mockEnvironment = new Environment({
      id_environment: 2,
      label: 'ReactJS',
      icon: 'react-icon',
      interfaces: [],
    });

    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'dc1',
      provider: 'aws',
    });

    const mockApplication = new Application({
      id_application: 10,
      custom_label: 'My New App',
      generated_label: 'generated-label',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'newhash',
      username: 'newuser',
      password: 'newpass',
      id_user: 1,
      id_environment: 2,
      state_application: 'Ready',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      programming_shutdown_date: null,
      environment: mockEnvironment,
      datacenter: mockDatacenter,
    });

    fakeCreate.resolves(Promise.resolve(mockApplication));

    await applications_controller.create(fakeReq, fakeRes, {
      application_create: fakeCreate,
    });

    chai.expect(fakeCreate).to.have.been.calledOnce;
    const callArgs = fakeCreate.firstCall.args[0];
    chai.expect(callArgs.id_user).to.equal(1);
    chai.expect(callArgs.id_datacenter).to.equal(1);
    chai.expect(callArgs.id_environment).to.equal(2);
    chai.expect(callArgs.label).to.equal('My New App');
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
  });

  it('called without label and should use empty string as default.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    delete fakeReq.body.label;

    const mockEnvironment = new Environment({
      id_environment: 2,
      label: 'ReactJS',
      icon: 'react-icon',
      interfaces: [],
    });

    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'dc1',
      provider: 'aws',
    });

    const mockApplication = new Application({
      id_application: 10,
      custom_label: '',
      generated_label: 'generated-label',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'newhash',
      username: 'newuser',
      password: 'newpass',
      id_user: 1,
      id_environment: 2,
      state_application: 'Ready',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      programming_shutdown_date: null,
      environment: mockEnvironment,
      datacenter: mockDatacenter,
    });

    fakeCreate.resolves(Promise.resolve(mockApplication));

    await applications_controller.create(fakeReq, fakeRes, {
      application_create: fakeCreate,
    });

    chai.expect(fakeCreate).to.have.been.calledOnce;
    const callArgs = fakeCreate.firstCall.args[0];
    chai.expect(callArgs.label).to.equal('');
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeCreate.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await applications_controller.create(fakeReq, fakeRes, {
      application_create: fakeCreate,
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
