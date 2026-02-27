import * as storage_controller from '../../src/controllers/storage.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.util.js';
import { DBConnexionRefused } from '../../src/utils/errors.util.js';
import { Application_export } from '../../src/objects/Application_export.js';

chai.use(sinonChai);

describe('storage_controller.exportStorage()', () => {
  let fakeExport, fakeReq, fakeRes;

  beforeEach(() => {
    fakeExport = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_application: 1,
      },
      body: {
        export_platform: 's3',
        delete_existing_export: 'false',
      },
      method: 'POST',
      originalUrl: '/storage/export?id_application=1',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should create storage export.', async () => {
    const mockExport = new Application_export({
      id_export: 1,
      id_application: 1,
      init_date: '2026-03-01T10:00:00Z',
      expiration_date: '2026-03-08T10:00:00Z',
      id_provider: 1,
      id_enum_export_state: 1,
      status: 'processing',
      download_link: null,
      previous_export_deleted: false,
    });

    fakeExport.resolves(Promise.resolve(mockExport));

    await storage_controller.exportStorage(fakeReq, fakeRes, {
      storage_export: fakeExport,
    });

    chai.expect(fakeExport).to.have.been.calledOnce;
    const callArg = fakeExport.firstCall.args[0];
    chai.expect(callArg.id_user).to.equal(1);
    chai.expect(callArg.id_application).to.equal(1);
    chai.expect(callArg.export_platform).to.equal('s3');
    chai.expect(callArg.delete_existing_export).to.equal(false);
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Storage export created.');
  });

  it('called with delete_existing_export as true and should create export.', async () => {
    fakeReq.body.delete_existing_export = 'true';

    const mockExport = new Application_export({
      id_export: 1,
      id_application: 1,
      init_date: '2026-03-01T10:00:00Z',
      expiration_date: '2026-03-08T10:00:00Z',
      id_provider: 1,
      id_enum_export_state: 1,
      status: 'processing',
      download_link: null,
      previous_export_deleted: true,
    });

    fakeExport.resolves(Promise.resolve(mockExport));

    await storage_controller.exportStorage(fakeReq, fakeRes, {
      storage_export: fakeExport,
    });

    chai.expect(fakeExport).to.have.been.calledOnce;
    const callArg = fakeExport.firstCall.args[0];
    chai.expect(callArg.delete_existing_export).to.equal(true);
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called without id_application and should reject with validation error.', async () => {
    fakeReq.query = {};

    await storage_controller.exportStorage(fakeReq, fakeRes, {
      storage_export: fakeExport,
    });

    chai.expect(fakeExport).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without export_platform and should reject with validation error.', async () => {
    fakeReq.body = {
      delete_existing_export: 'false',
    };

    await storage_controller.exportStorage(fakeReq, fakeRes, {
      storage_export: fakeExport,
    });

    chai.expect(fakeExport).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeExport.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await storage_controller.exportStorage(fakeReq, fakeRes, {
      storage_export: fakeExport,
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

describe('storage_controller.deleteStorage()', () => {
  let fakeDelete, fakeReq, fakeRes;

  beforeEach(() => {
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
        export_platform: 's3',
      },
      method: 'DELETE',
      originalUrl: '/storage?id_application=1',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should delete storage.', async () => {
    const mockDeletion = {
      success: true,
      message: 'Export deleted successfully',
    };

    fakeDelete.resolves(Promise.resolve(mockDeletion));

    await storage_controller.deleteStorage(fakeReq, fakeRes, {
      storage_delete: fakeDelete,
    });

    chai.expect(fakeDelete).to.have.been.calledOnce;
    const callArg = fakeDelete.firstCall.args[0];
    chai.expect(callArg.id_user).to.equal(1);
    chai.expect(callArg.id_application).to.equal(1);
    chai.expect(callArg.id_export).to.equal(1);
    chai.expect(callArg.export_platform).to.equal('s3');
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Storage deleted.');
  });

  it('called without id_application and should reject with validation error.', async () => {
    fakeReq.query = {};

    await storage_controller.deleteStorage(fakeReq, fakeRes, {
      storage_delete: fakeDelete,
    });

    chai.expect(fakeDelete).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without id_export and should reject with validation error.', async () => {
    fakeReq.body = {
      export_platform: 's3',
    };

    await storage_controller.deleteStorage(fakeReq, fakeRes, {
      storage_delete: fakeDelete,
    });

    chai.expect(fakeDelete).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without export_platform and should reject with validation error.', async () => {
    fakeReq.body = {
      id_export: 1,
    };

    await storage_controller.deleteStorage(fakeReq, fakeRes, {
      storage_delete: fakeDelete,
    });

    chai.expect(fakeDelete).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeDelete.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await storage_controller.deleteStorage(fakeReq, fakeRes, {
      storage_delete: fakeDelete,
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

describe('storage_controller.getStorage()', () => {
  let fakeGet, fakeReq, fakeRes;

  beforeEach(() => {
    fakeGet = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_application: 1,
      },
      method: 'GET',
      originalUrl: '/storage?id_application=1',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_application and should return storage information.', async () => {
    const mockStorage = {
      public_format: () => ({
        id_application: 1,
        storage_size: '5GB',
        exports: [],
      }),
    };

    fakeGet.resolves(Promise.resolve(mockStorage));

    await storage_controller.getStorage(fakeReq, fakeRes, {
      storage_get: fakeGet,
    });

    chai.expect(fakeGet).to.have.been.calledOnce;
    const callArg = fakeGet.firstCall.args[0];
    chai.expect(callArg.id_application).to.equal(1);
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Storage informations.');
  });

  it('called without id_application and should reject with validation error.', async () => {
    fakeReq.query = {};

    await storage_controller.getStorage(fakeReq, fakeRes, {
      storage_get: fakeGet,
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

    await storage_controller.getStorage(fakeReq, fakeRes, {
      storage_get: fakeGet,
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
