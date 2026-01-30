import * as storage_controller from '../../../src/controllers/application/storage.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import moment from 'moment-timezone';
import { DBConnexionRefused } from '../../../src/utils/errors.service.js';
import CONFIG from '../../../src/config/config.js';
import * as token_service from '../../../src/utils/token.service.js';
import { Application_export } from '../../../src/objects/application/Application_export.js';
chai.use(sinonChai);

describe('storage_controller.exportStorage()', () => {
  let fakeCreate, fakeReq, fakeRes, saveCONFIG;
  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeCreate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_application: 1,
      },
      body: {
        export_platform: 'smash',
      },
      method: 'POST',
      originalUrl: '/application/storage/export',
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
  it('called with good arguments and smash export should launch.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeCreate.resolves(
      Promise.resolve(
        new Application_export({
          id_export: 1,
          id_application: 1,
          init_date: moment.tz(CONFIG.timezone),
          expiration_date: moment.tz(CONFIG.timezone),
          id_enum_export_state: 1,
        })
      )
    );
    await storage_controller.exportStorage(fakeReq, fakeRes, {
      storage_export: fakeCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        id_export: 1,
        id_application: 1,
        init_date: moment.tz(CONFIG.timezone).format(),
        expiration_date: moment.tz(CONFIG.timezone).format(),
        id_enum_export_state: 1,
        status: null,
        download_link: null,
        previous_export_deleted: false,
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called with delete_existing_export=true should pass true to service', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeReq.body.delete_existing_export = 'true';
    fakeCreate.resolves(
      Promise.resolve(
        new Application_export({
          id_export: 1,
          id_application: 1,
          init_date: moment.tz(CONFIG.timezone),
          expiration_date: moment.tz(CONFIG.timezone),
          id_enum_export_state: 1,
        })
      )
    );
    await storage_controller.exportStorage(fakeReq, fakeRes, {
      storage_export: fakeCreate,
    });
    chai.expect(fakeCreate).to.have.been.calledWithMatch({
      delete_existing_export: true,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called with delete_existing_export=false should pass false to service', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeReq.body.delete_existing_export = 'false';
    fakeCreate.resolves(
      Promise.resolve(
        new Application_export({
          id_export: 1,
          id_application: 1,
          init_date: moment.tz(CONFIG.timezone),
          expiration_date: moment.tz(CONFIG.timezone),
          id_enum_export_state: 1,
        })
      )
    );
    await storage_controller.exportStorage(fakeReq, fakeRes, {
      storage_export: fakeCreate,
    });
    chai.expect(fakeCreate).to.have.been.calledWithMatch({
      delete_existing_export: false,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called with delete_existing_export boolean true should pass true to service', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeReq.body.delete_existing_export = true;
    fakeCreate.resolves(
      Promise.resolve(
        new Application_export({
          id_export: 1,
          id_application: 1,
          init_date: moment.tz(CONFIG.timezone),
          expiration_date: moment.tz(CONFIG.timezone),
          id_enum_export_state: 1,
        })
      )
    );
    await storage_controller.exportStorage(fakeReq, fakeRes, {
      storage_export: fakeCreate,
    });
    chai.expect(fakeCreate).to.have.been.calledWithMatch({
      delete_existing_export: true,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called with delete_existing_export boolean false should pass false to service', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeReq.body.delete_existing_export = false;
    fakeCreate.resolves(
      Promise.resolve(
        new Application_export({
          id_export: 1,
          id_application: 1,
          init_date: moment.tz(CONFIG.timezone),
          expiration_date: moment.tz(CONFIG.timezone),
          id_enum_export_state: 1,
        })
      )
    );
    await storage_controller.exportStorage(fakeReq, fakeRes, {
      storage_export: fakeCreate,
    });
    chai.expect(fakeCreate).to.have.been.calledWithMatch({
      delete_existing_export: false,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called with undefined delete_existing_export should pass undefined to service', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    delete fakeReq.body.delete_existing_export;
    fakeCreate.resolves(
      Promise.resolve(
        new Application_export({
          id_export: 1,
          id_application: 1,
          init_date: moment.tz(CONFIG.timezone),
          expiration_date: moment.tz(CONFIG.timezone),
          id_enum_export_state: 1,
        })
      )
    );
    await storage_controller.exportStorage(fakeReq, fakeRes, {
      storage_export: fakeCreate,
    });
    chai.expect(fakeCreate).to.have.been.calledWithMatch({
      delete_existing_export: undefined,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeCreate.resolves(
      Promise.reject(
        new DBConnexionRefused('Connexion to the database refused.')
      )
    );
    await storage_controller.exportStorage(fakeReq, fakeRes, {
      storage_export: fakeCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'DBConnexionRefused',
        message: 'Connexion to the database refused.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
  });
});

describe('storage_controller.deleteStorage()', () => {
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
        id_application: 1,
      },
      body: {
        id_export: 1,
        export_platform: 'smash',
      },
      method: 'DELETE',
      originalUrl: '/application/storage/delete',
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

  it('called with good arguments should delete storage.', async () => {
    fakeDelete.resolves(Promise.resolve(true));
    await storage_controller.deleteStorage(fakeReq, fakeRes, {
      storage_delete: fakeDelete,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: true,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called with missing id_export should reject with error.', async () => {
    delete fakeReq.body.id_export;
    await storage_controller.deleteStorage(fakeReq, fakeRes, {
      storage_delete: fakeDelete,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'MissingArgumentError',
        message: 'The body parameter (id_export) is missing.',
      },
    });
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeDelete.resolves(
      Promise.reject(
        new DBConnexionRefused('Connexion to the database refused.')
      )
    );
    await storage_controller.deleteStorage(fakeReq, fakeRes, {
      storage_delete: fakeDelete,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'DBConnexionRefused',
        message: 'Connexion to the database refused.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
  });
});

describe('storage_controller.getStorage()', () => {
  let fakeGet, fakeReq, fakeRes, saveCONFIG;
  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeGet = sinon.stub();
    fakeReq = {
      query: {
        id_application: 1,
      },
      method: 'GET',
      originalUrl: '/application/storage/active',
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

  it('called with good arguments should return active storage.', async () => {
    const mockStorage = {
      public_format: () => ({ id: 1, status: 'active' }),
    };
    fakeGet.resolves(Promise.resolve(mockStorage));
    await storage_controller.getStorage(fakeReq, fakeRes, {
      storage_get: fakeGet,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: { id: 1, status: 'active' },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called with missing id_application should reject with error.', async () => {
    delete fakeReq.query.id_application;
    await storage_controller.getStorage(fakeReq, fakeRes, {
      storage_get: fakeGet,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'MissingArgumentError',
        message: 'The query parameter id_application is missing.',
      },
    });
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeGet.resolves(
      Promise.reject(
        new DBConnexionRefused('Connexion to the database refused.')
      )
    );
    await storage_controller.getStorage(fakeReq, fakeRes, {
      storage_get: fakeGet,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'DBConnexionRefused',
        message: 'Connexion to the database refused.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
  });
});
