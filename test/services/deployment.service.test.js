import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as deployment_service from '../../src/services/deployment.service.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
import { Environment } from '../../src/objects/Environment.js';

chai.use(sinonChai);

describe('deployment.service.exec_deletion()', () => {
  it('should execute deletion workflow successfully', async () => {
    const mockStubs = {
      external_name_deletion: sinon.stub().resolves(),
      namespace_deletion: sinon.stub().resolves(),
      registry_hub_deletion: sinon.stub().resolves(),
      deployment_deletion: sinon.stub().resolves(),
      service_deletion: sinon.stub().resolves(),
      deleteFromKong: sinon.stub().resolves(),
      delete_authorization_policy: sinon.stub().resolves(),
      delete_network_policy: sinon.stub().resolves(),
    };

    const result = await deployment_service.exec_deletion(
      { hash: 'abc123' },
      mockStubs
    );

    chai.expect(mockStubs.external_name_deletion.calledOnce).to.be.true;
    chai.expect(mockStubs.namespace_deletion.calledOnce).to.be.true;
    chai.expect(mockStubs.registry_hub_deletion.calledOnce).to.be.true;
    chai.expect(mockStubs.deployment_deletion.calledOnce).to.be.true;
    chai.expect(mockStubs.service_deletion.calledOnce).to.be.true;
    chai.expect(mockStubs.deleteFromKong.calledOnce).to.be.true;
  });

  it('should throw error when hash is less than 6 characters', async () => {
    try {
      await deployment_service.exec_deletion({ hash: 'abc' });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when hash is more than 6 characters', async () => {
    try {
      await deployment_service.exec_deletion({ hash: 'abcdefgh' });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when hash is missing', async () => {
    try {
      await deployment_service.exec_deletion({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should propagate error when a deletion fails', async () => {
    const mockError = new Error('Deletion failed');
    const mockStubs = {
      external_name_deletion: sinon.stub().rejects(mockError),
      namespace_deletion: sinon.stub().resolves(),
      registry_hub_deletion: sinon.stub().resolves(),
      deployment_deletion: sinon.stub().resolves(),
      service_deletion: sinon.stub().resolves(),
      deleteFromKong: sinon.stub().resolves(),
      delete_authorization_policy: sinon.stub().resolves(),
      delete_network_policy: sinon.stub().resolves(),
    };

    try {
      await deployment_service.exec_deletion(
        { hash: 'abc123' },
        mockStubs
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err.message).to.include('Deletion failed');
    }
  });
});

describe('deployment.service.exec_start()', () => {
  it('should execute start workflow successfully', async () => {
    const mockScale = sinon.stub().resolves();

    const result = await deployment_service.exec_start(
      { hash: 'abc123' },
      { scale: mockScale }
    );

    chai.expect(mockScale.calledOnce).to.be.true;
    chai.expect(mockScale.firstCall.args[0]).to.include({
      hash: 'abc123',
      replicas: 1,
    });
  });

  it('should throw error when hash is not exactly 6 characters', async () => {
    try {
      await deployment_service.exec_start({ hash: 'abc12' });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when hash is missing', async () => {
    try {
      await deployment_service.exec_start({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should propagate error when scale fails', async () => {
    const mockError = new Error('Scale failed');
    const mockScale = sinon.stub().rejects(mockError);

    try {
      await deployment_service.exec_start(
        { hash: 'abc123' },
        { scale: mockScale }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err.message).to.include('Scale failed');
    }
  });
});

describe('deployment.service.exec_shutdown()', () => {
  it('should execute shutdown workflow successfully', async () => {
    const mockScale = sinon.stub().resolves();

    const result = await deployment_service.exec_shutdown(
      { hash: 'abc123' },
      { scale: mockScale }
    );

    chai.expect(mockScale.calledOnce).to.be.true;
    chai.expect(mockScale.firstCall.args[0]).to.include({
      hash: 'abc123',
      replicas: 0,
    });
  });

  it('should throw error when hash is not exactly 6 characters', async () => {
    try {
      await deployment_service.exec_shutdown({ hash: 'abc' });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when hash is missing', async () => {
    try {
      await deployment_service.exec_shutdown({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should propagate error when scale fails', async () => {
    const mockError = new Error('Scale failed');
    const mockScale = sinon.stub().rejects(mockError);

    try {
      await deployment_service.exec_shutdown(
        { hash: 'abc123' },
        { scale: mockScale }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err.message).to.include('Scale failed');
    }
  });
});

describe('deployment.service.create()', () => {
  it('should create deployment architecture successfully', async () => {
    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'DC1',
      provider: 'AWS',
      city: 'Paris',
    });

    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'Environment 1',
      icon: 'icon1',
      interfaces: [],
    });

    const mockStubs = {
      create_namespace: sinon.stub().resolves(),
      create_registry_hub: sinon.stub().resolves(),
      create_authorization_policy: sinon.stub().resolves(),
      create_network_policy: sinon.stub().resolves(),
      create_service: sinon.stub().resolves(),
      create_externalname: sinon.stub().resolves(),
      create_pvc: sinon.stub().resolves(),
      create_deployment: sinon.stub().resolves(),
      addInKong: sinon.stub().resolves(),
    };

    const result = await deployment_service.create(
      {
        hash: 'abc123',
        datacenter: mockDatacenter,
        environment: mockEnvironment,
        generated_label: 'test-label',
        username: 'admin',
        password: 'password123',
        id_user: 1,
      },
      mockStubs
    );

    chai.expect(mockStubs.create_namespace.calledOnce).to.be.true;
    chai.expect(mockStubs.create_registry_hub.calledOnce).to.be.true;
  });

  it('should throw error when hash is not exactly 6 characters', async () => {
    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'DC1',
      provider: 'AWS',
      city: 'Paris',
    });
    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'Environment 1',
      icon: 'icon1',
      interfaces: [],
    });

    try {
      await deployment_service.create({
        hash: 'ab',
        datacenter: mockDatacenter,
        environment: mockEnvironment,
        generated_label: 'test',
        username: 'admin',
        password: 'pass',
        id_user: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_user is not positive', async () => {
    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'DC1',
      provider: 'AWS',
      city: 'Paris',
    });
    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'Environment 1',
      icon: 'icon1',
      interfaces: [],
    });

    try {
      await deployment_service.create({
        hash: 'abc123',
        datacenter: mockDatacenter,
        environment: mockEnvironment,
        generated_label: 'test',
        username: 'admin',
        password: 'pass',
        id_user: 0,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when required fields are missing', async () => {
    try {
      await deployment_service.create({
        hash: 'abc123',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
