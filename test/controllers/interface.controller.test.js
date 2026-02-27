import * as interface_controller from '../../src/controllers/interface.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.util.js';
import { DBConnexionRefused } from '../../src/utils/errors.util.js';
import { Interface } from '../../src/objects/Interface.js';

chai.use(sinonChai);

describe('interface_controller.get()', () => {
  let fakeGet, fakeReq, fakeRes;

  beforeEach(() => {
    fakeGet = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_interface: 1,
      },
      method: 'GET',
      originalUrl: '/interface?id_interface=1',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_interface and should return interface.', async () => {
    const mockInterface = new Interface({
      id_interface: 1,
      label: 'test-interface',
      default_label: 'Test Interface',
      registry_link: 'registry.example.com/test',
      exec_command: '/bin/bash',
      service_command: 'start',
    });

    fakeGet.resolves(Promise.resolve(mockInterface));

    await interface_controller.get(fakeReq, fakeRes, {
      interface_get: fakeGet,
    });

    chai
      .expect(fakeGet)
      .to.have.been.calledOnceWithExactly({
        id_interface: 1,
      });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Interface transmitted.');
  });

  it('called without id_interface and should reject with validation error.', async () => {
    fakeReq.query = {};

    await interface_controller.get(fakeReq, fakeRes, {
      interface_get: fakeGet,
    });

    chai.expect(fakeGet).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with negative id_interface and should reject with validation error.', async () => {
    fakeReq.query = {
      id_interface: -1,
    };

    await interface_controller.get(fakeReq, fakeRes, {
      interface_get: fakeGet,
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

    await interface_controller.get(fakeReq, fakeRes, {
      interface_get: fakeGet,
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

describe('interface_controller.list()', () => {
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
      originalUrl: '/interface/list',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called and should return list of interfaces.', async () => {
    const mockInterfaces = [
      new Interface({
        id_interface: 1,
        label: 'test-interface-1',
        default_label: 'Test Interface 1',
        registry_link: 'registry.example.com/test1',
      }),
      new Interface({
        id_interface: 2,
        label: 'test-interface-2',
        default_label: 'Test Interface 2',
        registry_link: 'registry.example.com/test2',
      }),
    ];

    fakeList.resolves(Promise.resolve(mockInterfaces));

    await interface_controller.list(fakeReq, fakeRes, {
      interface_list: fakeList,
    });

    chai.expect(fakeList).to.have.been.calledOnceWithExactly();
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('List of interfaces transmitted.');
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeList.rejects(
      new DBConnexionRefused('Connexion to the database refused.'),
    );

    await interface_controller.list(fakeReq, fakeRes, {
      interface_list: fakeList,
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

describe('interface_controller.create()', () => {
  let fakeCreate, fakeReq, fakeRes;

  beforeEach(() => {
    fakeCreate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      body: {
        label: 'test-interface',
        registry_link: 'registry.example.com/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        id_type: 1,
        need_compute_gpu: 'false',
        need_graphical_rendering_gpu: 'false',
        cpu_request: '500m',
        ram_request: '2Gi',
        cpu_limit: '1000m',
        ram_limit: '4Gi',
        readiness_probe_initial_delay: 30,
        readiness_probe_period: 10,
        liveness_probe_initial_delay: 30,
        liveness_probe_period: 10,
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
      },
      method: 'POST',
      originalUrl: '/interface',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should create new interface.', async () => {
    const mockInterface = new Interface({
      id_interface: 1,
      label: 'test-interface',
      default_label: 'test-interface',
      registry_link: 'registry.example.com/test',
      exec_command: '/bin/bash',
      service_command: 'start',
      id_type: 1,
      ram_request: '2Gi',
      ram_limit: '4Gi',
      cpu_request: '500m',
      cpu_limit: '1000m',
    });

    fakeCreate.resolves(Promise.resolve(mockInterface));

    await interface_controller.create(fakeReq, fakeRes, {
      interface_create: fakeCreate,
    });

    chai.expect(fakeCreate).to.have.been.calledOnce;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Interface created.');
  });

  it('called without registry_link and should reject with validation error.', async () => {
    fakeReq.body = {
      label: 'test-interface',
      exec_command: '/bin/bash',
      service_command: 'start',
      id_type: 1,
      cpu_request: '500m',
      ram_request: '2Gi',
      cpu_limit: '1000m',
      ram_limit: '4Gi',
      readiness_probe_initial_delay: 30,
      readiness_probe_period: 10,
      liveness_probe_initial_delay: 30,
      liveness_probe_period: 10,
      egress_bandwidth: '100M',
      ingress_bandwidth: '100M',
    };

    await interface_controller.create(fakeReq, fakeRes, {
      interface_create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with invalid ram_request format and should reject with validation error.', async () => {
    fakeReq.body.ram_request = 'invalid-ram';

    await interface_controller.create(fakeReq, fakeRes, {
      interface_create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with invalid cpu_request format and should reject with validation error.', async () => {
    fakeReq.body.cpu_request = 'invalid-cpu';

    await interface_controller.create(fakeReq, fakeRes, {
      interface_create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with invalid egress_bandwidth format and should reject with validation error.', async () => {
    fakeReq.body.egress_bandwidth = '100X';

    await interface_controller.create(fakeReq, fakeRes, {
      interface_create: fakeCreate,
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

    await interface_controller.create(fakeReq, fakeRes, {
      interface_create: fakeCreate,
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

describe('interface_controller.update()', () => {
  let fakeUpdate, fakeReq, fakeRes;

  beforeEach(() => {
    fakeUpdate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      params: {
        id_interface: 1,
      },
      body: {
        label: 'updated-interface',
        registry_link: 'registry.example.com/updated',
        cpu_request: '750m',
        ram_request: '3Gi',
      },
      method: 'PUT',
      originalUrl: '/interface/1',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should update interface.', async () => {
    const mockInterface = new Interface({
      id_interface: 1,
      label: 'updated-interface',
      default_label: 'Updated Interface',
      registry_link: 'registry.example.com/updated',
      ram_request: '3Gi',
      cpu_request: '750m',
    });

    fakeUpdate.resolves(Promise.resolve(mockInterface));

    await interface_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.have.been.calledOnce;
    const callArg = fakeUpdate.firstCall.args[0];
    chai.expect(callArg.id_interface).to.equal(1);
    chai.expect(callArg.label).to.equal('updated-interface');
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Interface updated.');
  });

  it('called without id_interface and should reject with validation error.', async () => {
    fakeReq.params = {};

    await interface_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with negative id_interface and should reject with validation error.', async () => {
    fakeReq.params = {
      id_interface: -1,
    };

    await interface_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with invalid ram_request format and should reject with validation error.', async () => {
    fakeReq.body.ram_request = 'invalid-ram';

    await interface_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with valid ports array and should update interface.', async () => {
    fakeReq.body = {
      ports: [
        {
          port: 8080,
          id_port_type: 1,
          icon: 'http-icon',
          label: 'http-label',
          display_name: 'HTTP Port',
        },
      ],
    };

    const mockInterface = new Interface({
      id_interface: 1,
      label: 'test-interface',
      default_label: 'Test Interface',
      registry_link: 'registry.example.com/test',
    });

    fakeUpdate.resolves(Promise.resolve(mockInterface));

    await interface_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.have.been.calledOnce;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
  });

  it('called with valid args array and should update interface.', async () => {
    fakeReq.body = {
      args: ['--verbose', '--debug'],
    };

    const mockInterface = new Interface({
      id_interface: 1,
      label: 'test-interface',
      default_label: 'Test Interface',
      registry_link: 'registry.example.com/test',
    });

    fakeUpdate.resolves(Promise.resolve(mockInterface));

    await interface_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.have.been.calledOnce;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
  });

  it('called with valid envs array and should update interface.', async () => {
    fakeReq.body = {
      envs: [
        { key: 'NODE_ENV', value: 'production' },
        { key: 'PORT', value: '3000' },
      ],
    };

    const mockInterface = new Interface({
      id_interface: 1,
      label: 'test-interface',
      default_label: 'Test Interface',
      registry_link: 'registry.example.com/test',
    });

    fakeUpdate.resolves(Promise.resolve(mockInterface));

    await interface_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.have.been.calledOnce;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeUpdate.rejects(
      new DBConnexionRefused('Connexion to the database refused.'),
    );

    await interface_controller.update(fakeReq, fakeRes, {
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
