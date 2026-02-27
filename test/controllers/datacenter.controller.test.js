import * as datacenter_controller from '../../src/controllers/datacenter.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.util.js';
import { DBConnexionRefused } from '../../src/utils/errors.util.js';
import { Datacenter } from '../../src/objects/Datacenter.js';

chai.use(sinonChai);

describe('datacenter_controller.list()', () => {
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
      originalUrl: '/datacenter/list',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called and should return list of datacenters.', async () => {
    const mockDatacenters = [
      new Datacenter({
        id_datacenter: 1,
        label: 'DC-East',
        city: 'New York',
        provider: 'AWS',
      }),
      new Datacenter({
        id_datacenter: 2,
        label: 'DC-West',
        city: 'San Francisco',
        provider: 'GCP',
      }),
    ];

    fakeList.resolves(Promise.resolve(mockDatacenters));

    await datacenter_controller.list(fakeReq, fakeRes, {
      datacenter_list: fakeList,
    });

    chai.expect(fakeList).to.have.been.calledOnceWithExactly();
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('List of datacenters transmitted.');
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeList.rejects(
      new DBConnexionRefused('Connexion to the database refused.'),
    );

    await datacenter_controller.list(fakeReq, fakeRes, {
      datacenter_list: fakeList,
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

describe('datacenter_controller.create()', () => {
  let fakeCreate, fakeReq, fakeRes;

  beforeEach(() => {
    fakeCreate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      body: {
        label: 'DC-East',
        city: 'New York',
        provider: 'AWS',
      },
      method: 'POST',
      originalUrl: '/datacenter',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should create new datacenter.', async () => {
    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'DC-East',
      city: 'New York',
      provider: 'AWS',
    });

    fakeCreate.resolves(Promise.resolve(mockDatacenter));

    await datacenter_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai
      .expect(fakeCreate)
      .to.have.been.calledOnceWithExactly({
        label: 'DC-East',
        city: 'New York',
        provider: 'AWS',
      });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Datacenter created.');
  });

  it('called without label and should reject with validation error.', async () => {
    fakeReq.body = {
      city: 'New York',
      provider: 'AWS',
    };

    await datacenter_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without city and should reject with validation error.', async () => {
    fakeReq.body = {
      label: 'DC-East',
      provider: 'AWS',
    };

    await datacenter_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without provider and should reject with validation error.', async () => {
    fakeReq.body = {
      label: 'DC-East',
      city: 'New York',
    };

    await datacenter_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with short label and should reject with validation error.', async () => {
    fakeReq.body = {
      label: 'D',
      city: 'New York',
      provider: 'AWS',
    };

    await datacenter_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeCreate.rejects(
      new DBConnexionRefused('Connexion to the database refused.'),
    );

    await datacenter_controller.create(fakeReq, fakeRes, {
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

describe('datacenter_controller.update()', () => {
  let fakeUpdate, fakeReq, fakeRes;

  beforeEach(() => {
    fakeUpdate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      params: {
        id_datacenter: 1,
      },
      body: {
        label: 'DC-East-Updated',
        city: 'Boston',
        provider: 'Azure',
      },
      method: 'PUT',
      originalUrl: '/datacenter/1',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should update datacenter.', async () => {
    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'DC-East-Updated',
      city: 'Boston',
      provider: 'Azure',
    });

    fakeUpdate.resolves(Promise.resolve(mockDatacenter));

    await datacenter_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai
      .expect(fakeUpdate)
      .to.have.been.calledOnceWithExactly({
        id_datacenter: 1,
        label: 'DC-East-Updated',
        city: 'Boston',
        provider: 'Azure',
      });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Datacenter updated.');
  });

  it('called without label and should reject with validation error.', async () => {
    fakeReq.body = {
      city: 'Boston',
      provider: 'Azure',
    };

    await datacenter_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without city and should reject with validation error.', async () => {
    fakeReq.body = {
      label: 'DC-East-Updated',
      provider: 'Azure',
    };

    await datacenter_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without provider and should reject with validation error.', async () => {
    fakeReq.body = {
      label: 'DC-East-Updated',
      city: 'Boston',
    };

    await datacenter_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without id_datacenter and should reject with validation error.', async () => {
    fakeReq.params = {};

    await datacenter_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with negative id_datacenter and should reject with validation error.', async () => {
    fakeReq.params = {
      id_datacenter: -1,
    };

    await datacenter_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeUpdate.rejects(
      new DBConnexionRefused('Connexion to the database refused.'),
    );

    await datacenter_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
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

describe('datacenter_controller.del()', () => {
  let fakeDel, fakeReq, fakeRes;

  beforeEach(() => {
    fakeDel = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      params: {
        id_datacenter: 1,
      },
      method: 'DELETE',
      originalUrl: '/datacenter/1',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should delete datacenter.', async () => {
    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'DC-East',
      city: 'New York',
      provider: 'AWS',
    });

    fakeDel.resolves(Promise.resolve(mockDatacenter));

    await datacenter_controller.del(fakeReq, fakeRes, {
      del: fakeDel,
    });

    chai
      .expect(fakeDel)
      .to.have.been.calledOnceWithExactly({
        id_datacenter: 1,
      });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Datacenter deleted.');
  });

  it('called without id_datacenter and should reject with validation error.', async () => {
    fakeReq.params = {};

    await datacenter_controller.del(fakeReq, fakeRes, {
      del: fakeDel,
    });

    chai.expect(fakeDel).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with negative id_datacenter and should reject with validation error.', async () => {
    fakeReq.params = {
      id_datacenter: -1,
    };

    await datacenter_controller.del(fakeReq, fakeRes, {
      del: fakeDel,
    });

    chai.expect(fakeDel).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeDel.rejects(
      new DBConnexionRefused('Connexion to the database refused.'),
    );

    await datacenter_controller.del(fakeReq, fakeRes, {
      del: fakeDel,
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

describe('datacenter_controller.get()', () => {
  let fakeGet, fakeReq, fakeRes;

  beforeEach(() => {
    fakeGet = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      params: {
        id_datacenter: 1,
      },
      method: 'GET',
      originalUrl: '/datacenter/1',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should return datacenter.', async () => {
    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'DC-East',
      city: 'New York',
      provider: 'AWS',
    });

    fakeGet.resolves(Promise.resolve(mockDatacenter));

    await datacenter_controller.get(fakeReq, fakeRes, {
      get: fakeGet,
    });

    chai
      .expect(fakeGet)
      .to.have.been.calledOnceWithExactly({
        id_datacenter: 1,
      });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Datacenter transmitted.');
  });

  it('called without id_datacenter and should reject with validation error.', async () => {
    fakeReq.params = {};

    await datacenter_controller.get(fakeReq, fakeRes, {
      get: fakeGet,
    });

    chai.expect(fakeGet).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with negative id_datacenter and should reject with validation error.', async () => {
    fakeReq.params = {
      id_datacenter: -1,
    };

    await datacenter_controller.get(fakeReq, fakeRes, {
      get: fakeGet,
    });

    chai.expect(fakeGet).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with zero id_datacenter and should reject with validation error.', async () => {
    fakeReq.params = {
      id_datacenter: 0,
    };

    await datacenter_controller.get(fakeReq, fakeRes, {
      get: fakeGet,
    });

    chai.expect(fakeGet).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeGet.rejects(
      new DBConnexionRefused('Connexion to the database refused.'),
    );

    await datacenter_controller.get(fakeReq, fakeRes, {
      get: fakeGet,
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
