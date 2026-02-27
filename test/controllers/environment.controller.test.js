import * as environment_controller from '../../src/controllers/environment.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.util.js';
import { DBConnexionRefused } from '../../src/utils/errors.util.js';
import { Environment } from '../../src/objects/Environment.js';
import { Interface } from '../../src/objects/Interface.js';

chai.use(sinonChai);

describe('environment_controller.list()', () => {
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
      originalUrl: '/environment/list',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called and should return list of environments.', async () => {
    const mockEnvironments = [
      new Environment({
        id_environment: 1,
        label: 'NodeJS',
        icon: 'nodejs-icon',
        interfaces: [],
      }),
      new Environment({
        id_environment: 2,
        label: 'Python',
        icon: 'python-icon',
        interfaces: [],
      }),
    ];

    fakeList.resolves(Promise.resolve(mockEnvironments));

    await environment_controller.list(fakeReq, fakeRes, {
      environment_list: fakeList,
    });

    chai.expect(fakeList).to.have.been.calledOnceWithExactly();
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('List of environments transmitted.');
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeList.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await environment_controller.list(fakeReq, fakeRes, {
      environment_list: fakeList,
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

describe('environment_controller.create()', () => {
  let fakeCreate, fakeReq, fakeRes;

  beforeEach(() => {
    fakeCreate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      body: {
        label: 'NodeJS',
        icon: 'nodejs-icon',
      },
      method: 'POST',
      originalUrl: '/environment',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should create new environment.', async () => {
    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    fakeCreate.resolves(Promise.resolve(mockEnvironment));

    await environment_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeCreate).to.have.been.calledOnceWithExactly({
      label: 'NodeJS',
      icon: 'nodejs-icon',
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('New environment created.');
  });

  it('called without label and should reject with validation error.', async () => {
    fakeReq.body = {
      icon: 'nodejs-icon',
    };

    await environment_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without icon and should reject with validation error.', async () => {
    fakeReq.body = {
      label: 'NodeJS',
    };

    await environment_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with short label and should reject with validation error.', async () => {
    fakeReq.body = {
      label: 'N',
      icon: 'nodejs-icon',
    };

    await environment_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
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

    await environment_controller.create(fakeReq, fakeRes, {
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

describe('environment_controller.attach_interface()', () => {
  let fakeAttach, fakeReq, fakeRes;

  beforeEach(() => {
    fakeAttach = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      params: {
        id_environment: 1,
      },
      body: {
        id_interface: 2,
        label: 'custom-interface-label',
      },
      method: 'POST',
      originalUrl: '/environment/1/interface',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should attach interface to environment.', async () => {
    const mockInterface = new Interface({
      id_interface: 2,
      label: 'custom-interface-label',
      default_label: 'interface-label',
      registry_link: 'registry.example.com/image',
      interfaces: [],
    });

    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [mockInterface],
    });

    fakeAttach.resolves(Promise.resolve(mockEnvironment));

    await environment_controller.attach_interface(fakeReq, fakeRes, {
      attach_interface: fakeAttach,
    });

    chai.expect(fakeAttach).to.have.been.calledOnceWithExactly({
      id_environment: 1,
      id_interface: 2,
      label: 'custom-interface-label',
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai
      .expect(jsonCall.message)
      .to.equal('The interface has been attached to the Environment.');
  });

  it('called without id_interface and should reject with validation error.', async () => {
    fakeReq.body = {
      label: 'custom-interface-label',
    };

    await environment_controller.attach_interface(fakeReq, fakeRes, {
      attach_interface: fakeAttach,
    });

    chai.expect(fakeAttach).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without label and should reject with validation error.', async () => {
    fakeReq.body = {
      id_interface: 2,
    };

    await environment_controller.attach_interface(fakeReq, fakeRes, {
      attach_interface: fakeAttach,
    });

    chai.expect(fakeAttach).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without id_environment and should reject with validation error.', async () => {
    fakeReq.params = {};

    await environment_controller.attach_interface(fakeReq, fakeRes, {
      attach_interface: fakeAttach,
    });

    chai.expect(fakeAttach).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with negative id_interface and should reject with validation error.', async () => {
    fakeReq.body = {
      id_interface: -1,
      label: 'custom-interface-label',
    };

    await environment_controller.attach_interface(fakeReq, fakeRes, {
      attach_interface: fakeAttach,
    });

    chai.expect(fakeAttach).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeAttach.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await environment_controller.attach_interface(fakeReq, fakeRes, {
      attach_interface: fakeAttach,
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

describe('environment_controller.detach_interface()', () => {
  let fakeDetach, fakeReq, fakeRes;

  beforeEach(() => {
    fakeDetach = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      params: {
        id_environment: 1,
      },
      body: {
        id_interface: 2,
      },
      method: 'DELETE',
      originalUrl: '/environment/1/interface',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should detach interface from environment.', async () => {
    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    fakeDetach.resolves(Promise.resolve(mockEnvironment));

    await environment_controller.detach_interface(fakeReq, fakeRes, {
      detach_interface: fakeDetach,
    });

    chai.expect(fakeDetach).to.have.been.calledOnceWithExactly({
      id_environment: 1,
      id_interface: 2,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai
      .expect(jsonCall.message)
      .to.equal('The interface has been detached from the environment.');
  });

  it('called without id_interface and should reject with validation error.', async () => {
    fakeReq.body = {};

    await environment_controller.detach_interface(fakeReq, fakeRes, {
      detach_interface: fakeDetach,
    });

    chai.expect(fakeDetach).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without id_environment and should reject with validation error.', async () => {
    fakeReq.params = {};

    await environment_controller.detach_interface(fakeReq, fakeRes, {
      detach_interface: fakeDetach,
    });

    chai.expect(fakeDetach).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with negative id_interface and should reject with validation error.', async () => {
    fakeReq.body = {
      id_interface: -1,
    };

    await environment_controller.detach_interface(fakeReq, fakeRes, {
      detach_interface: fakeDetach,
    });

    chai.expect(fakeDetach).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeDetach.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await environment_controller.detach_interface(fakeReq, fakeRes, {
      detach_interface: fakeDetach,
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

describe('environment_controller.update()', () => {
  let fakeUpdate, fakeReq, fakeRes;

  beforeEach(() => {
    fakeUpdate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      params: {
        id_environment: 1,
      },
      body: {
        label: 'Updated NodeJS',
        icon: 'updated-nodejs-icon',
      },
      method: 'PUT',
      originalUrl: '/environment/1',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should update environment.', async () => {
    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'Updated NodeJS',
      icon: 'updated-nodejs-icon',
      interfaces: [],
    });

    fakeUpdate.resolves(Promise.resolve(mockEnvironment));

    await environment_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.have.been.calledOnceWithExactly({
      id_environment: 1,
      label: 'Updated NodeJS',
      icon: 'updated-nodejs-icon',
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai
      .expect(jsonCall.message)
      .to.equal('The label of the environment has been updated.');
  });

  it('called without label and should reject with validation error.', async () => {
    fakeReq.body = {
      icon: 'updated-nodejs-icon',
    };

    await environment_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without icon and should reject with validation error.', async () => {
    fakeReq.body = {
      label: 'Updated NodeJS',
    };

    await environment_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without id_environment and should reject with validation error.', async () => {
    fakeReq.params = {};

    await environment_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with negative id_environment and should reject with validation error.', async () => {
    fakeReq.params = {
      id_environment: -1,
    };

    await environment_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
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

    await environment_controller.update(fakeReq, fakeRes, {
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

describe('environment_controller.update_interface()', () => {
  let fakeUpdateInterface, fakeReq, fakeRes;

  beforeEach(() => {
    fakeUpdateInterface = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      params: {
        id_environment: 1,
      },
      body: {
        id_interface: 2,
        label: 'updated-interface-label',
      },
      method: 'PUT',
      originalUrl: '/environment/1/interface',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should update interface label.', async () => {
    const mockInterface = new Interface({
      id_interface: 2,
      label: 'updated-interface-label',
      default_label: 'interface-label',
      registry_link: 'registry.example.com/image',
    });

    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [mockInterface],
    });

    fakeUpdateInterface.resolves(Promise.resolve(mockEnvironment));

    await environment_controller.update_interface(fakeReq, fakeRes, {
      update_interface: fakeUpdateInterface,
    });

    chai.expect(fakeUpdateInterface).to.have.been.calledOnceWithExactly({
      id_environment: 1,
      id_interface: 2,
      label: 'updated-interface-label',
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai
      .expect(jsonCall.message)
      .to.equal(
        'The label of the interface inside the environment has been updated.'
      );
  });

  it('called without label and should reject with validation error.', async () => {
    fakeReq.body = {
      id_interface: 2,
    };

    await environment_controller.update_interface(fakeReq, fakeRes, {
      update_interface: fakeUpdateInterface,
    });

    chai.expect(fakeUpdateInterface).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without id_interface and should reject with validation error.', async () => {
    fakeReq.body = {
      label: 'updated-interface-label',
    };

    await environment_controller.update_interface(fakeReq, fakeRes, {
      update_interface: fakeUpdateInterface,
    });

    chai.expect(fakeUpdateInterface).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without id_environment and should reject with validation error.', async () => {
    fakeReq.params = {};

    await environment_controller.update_interface(fakeReq, fakeRes, {
      update_interface: fakeUpdateInterface,
    });

    chai.expect(fakeUpdateInterface).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with negative id_interface and should reject with validation error.', async () => {
    fakeReq.body = {
      id_interface: -1,
      label: 'updated-interface-label',
    };

    await environment_controller.update_interface(fakeReq, fakeRes, {
      update_interface: fakeUpdateInterface,
    });

    chai.expect(fakeUpdateInterface).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeUpdateInterface.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await environment_controller.update_interface(fakeReq, fakeRes, {
      update_interface: fakeUpdateInterface,
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

describe('environment_controller.del()', () => {
  let fakeDel, fakeReq, fakeRes;

  beforeEach(() => {
    fakeDel = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      body: {
        id_environment: 1,
      },
      method: 'DELETE',
      originalUrl: '/environment',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should delete environment.', async () => {
    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    fakeDel.resolves(Promise.resolve(mockEnvironment));

    await environment_controller.del(fakeReq, fakeRes, {
      del: fakeDel,
    });

    chai.expect(fakeDel).to.have.been.calledOnceWithExactly({
      id_environment: 1,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Environment deleted.');
  });

  it('called without id_environment and should reject with validation error.', async () => {
    fakeReq.body = {};

    await environment_controller.del(fakeReq, fakeRes, {
      del: fakeDel,
    });

    chai.expect(fakeDel).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with negative id_environment and should reject with validation error.', async () => {
    fakeReq.body = {
      id_environment: -1,
    };

    await environment_controller.del(fakeReq, fakeRes, {
      del: fakeDel,
    });

    chai.expect(fakeDel).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with zero id_environment and should reject with validation error.', async () => {
    fakeReq.body = {
      id_environment: 0,
    };

    await environment_controller.del(fakeReq, fakeRes, {
      del: fakeDel,
    });

    chai.expect(fakeDel).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeDel.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await environment_controller.del(fakeReq, fakeRes, {
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
