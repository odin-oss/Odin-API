import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as interface_service from '../../src/services/interface.service.js';

chai.use(sinonChai);

describe('interface.service.get()', () => {
  it('should get interface by id successfully', async () => {
    const mockInterface = {
      id_interface: 1,
      label: 'interface1',
      registry_link: 'hub.docker.com/image:latest',
      cpu_request: '1',
      ram_request: '1Gi',
    };
    const mockGet = sinon.stub().resolves(mockInterface);

    const result = await interface_service.get(
      { id_interface: 1 },
      { interface_get: mockGet }
    );

    chai.expect(result).to.deep.equal(mockInterface);
    chai.expect(mockGet.calledOnce).to.be.true;
  });

  it('should throw error when id_interface is not positive', async () => {
    try {
      await interface_service.get({ id_interface: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_interface is negative', async () => {
    try {
      await interface_service.get({ id_interface: -1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_interface is missing', async () => {
    try {
      await interface_service.get({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('interface.service.list()', () => {
  it('should list all interfaces successfully', async () => {
    const mockInterfaces = [
      { id_interface: 1, label: 'interface1' },
      { id_interface: 2, label: 'interface2' },
    ];
    const mockList = sinon.stub().resolves(mockInterfaces);

    const result = await interface_service.list({
      interface_list: mockList,
    });

    chai.expect(result).to.deep.equal(mockInterfaces);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should return empty array when no interfaces exist', async () => {
    const mockList = sinon.stub().resolves([]);

    const result = await interface_service.list({
      interface_list: mockList,
    });

    chai.expect(result).to.deep.equal([]);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should propagate error when builder throws', async () => {
    const mockError = new Error('Database error');
    const mockList = sinon.stub().rejects(mockError);

    try {
      await interface_service.list({ interface_list: mockList });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err.message).to.equal('Database error');
    }
  });
});

describe('interface.service.create()', () => {
  it('should create interface successfully with all required fields', async () => {
    const mockNewInterface = {
      id_interface: 1,
      label: 'newinterface',
      registry_link: 'hub.docker.com/image:latest',
      exec_command: 'python app.py',
      service_command: 'service start',
      id_type: 1,
      cpu_request: '1',
      ram_request: '1Gi',
      cpu_limit: '2',
      ram_limit: '2Gi',
      need_compute_gpu: false,
      need_graphical_rendering_gpu: false,
      readiness_probe_initial_delay: 10,
      readiness_probe_period: 5,
      liveness_probe_initial_delay: 15,
      liveness_probe_period: 10,
      egress_bandwidth: '100M',
      ingress_bandwidth: '100M',
    };
    const mockCreate = sinon.stub().resolves(mockNewInterface);

    const result = await interface_service.create(
      {
        label: 'NewInterface',
        registry_link: 'hub.docker.com/image:latest',
        exec_command: 'python app.py',
        service_command: 'service start',
        id_type: 1,
        cpu_request: '1',
        ram_request: '1Gi',
        cpu_limit: '2',
        ram_limit: '2Gi',
        readiness_probe_initial_delay: 10,
        readiness_probe_period: 5,
        liveness_probe_initial_delay: 15,
        liveness_probe_period: 10,
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
      },
      { create: mockCreate }
    );

    chai.expect(mockCreate.calledOnce).to.be.true;
  });

  it('should throw error when label is less than 2 characters', async () => {
    try {
      await interface_service.create({
        label: 'a',
        registry_link: 'hub.docker.com/image:latest',
        exec_command: 'python app.py',
        service_command: 'service start',
        id_type: 1,
        cpu_request: '1',
        ram_request: '1Gi',
        cpu_limit: '2',
        ram_limit: '2Gi',
        readiness_probe_initial_delay: 10,
        readiness_probe_period: 5,
        liveness_probe_initial_delay: 15,
        liveness_probe_period: 10,
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when RAM format is invalid', async () => {
    try {
      await interface_service.create({
        label: 'NewInterface',
        registry_link: 'hub.docker.com/image:latest',
        exec_command: 'python app.py',
        service_command: 'service start',
        id_type: 1,
        cpu_request: '1',
        ram_request: '1GB', // Invalid format - should be Gi or Mi
        cpu_limit: '2',
        ram_limit: '2Gi',
        readiness_probe_initial_delay: 10,
        readiness_probe_period: 5,
        liveness_probe_initial_delay: 15,
        liveness_probe_period: 10,
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when bandwidth format is invalid', async () => {
    try {
      await interface_service.create({
        label: 'NewInterface',
        registry_link: 'hub.docker.com/image:latest',
        exec_command: 'python app.py',
        service_command: 'service start',
        id_type: 1,
        cpu_request: '1',
        ram_request: '1Gi',
        cpu_limit: '2',
        ram_limit: '2Gi',
        readiness_probe_initial_delay: 10,
        readiness_probe_period: 5,
        liveness_probe_initial_delay: 15,
        liveness_probe_period: 10,
        egress_bandwidth: '100K', // Invalid - should be M or G
        ingress_bandwidth: '100M',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_type is not positive', async () => {
    try {
      await interface_service.create({
        label: 'NewInterface',
        registry_link: 'hub.docker.com/image:latest',
        exec_command: 'python app.py',
        service_command: 'service start',
        id_type: 0,
        cpu_request: '1',
        ram_request: '1Gi',
        cpu_limit: '2',
        ram_limit: '2Gi',
        readiness_probe_initial_delay: 10,
        readiness_probe_period: 5,
        liveness_probe_initial_delay: 15,
        liveness_probe_period: 10,
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle GPU flags correctly', async () => {
    const mockNewInterface = {
      id_interface: 1,
      label: 'gpuinterface',
      need_compute_gpu: true,
      need_graphical_rendering_gpu: true,
    };
    const mockCreate = sinon.stub().resolves(mockNewInterface);

    const result = await interface_service.create(
      {
        label: 'GPUInterface',
        registry_link: 'hub.docker.com/image:latest',
        exec_command: 'python app.py',
        service_command: 'service start',
        id_type: 1,
        cpu_request: '2',
        ram_request: '4Gi',
        cpu_limit: '4',
        ram_limit: '8Gi',
        need_compute_gpu: 'true',
        need_graphical_rendering_gpu: 'true',
        readiness_probe_initial_delay: 10,
        readiness_probe_period: 5,
        liveness_probe_initial_delay: 15,
        liveness_probe_period: 10,
        egress_bandwidth: '1000M',
        ingress_bandwidth: '1000M',
      },
      { create: mockCreate }
    );

    chai.expect(mockCreate.calledOnce).to.be.true;
  });
});

describe('interface.service.update()', () => {
  it('should update interface successfully with partial data', async () => {
    const mockUpdatedInterface = { id_interface: 1, label: 'updatedinterface' };
    const mockUpdate = sinon.stub().resolves(mockUpdatedInterface);
    const mockUpdateArgs = sinon.stub().resolves();
    const mockUpdateNodeselectors = sinon.stub().resolves();
    const mockUpdatePorts = sinon.stub().resolves();
    const mockUpdateEnvs = sinon.stub().resolves();

    const result = await interface_service.update(
      {
        id_interface: 1,
        label: 'UpdatedInterface',
      },
      {
        update: mockUpdate,
        update_args: mockUpdateArgs,
        update_nodeselectors: mockUpdateNodeselectors,
        update_ports: mockUpdatePorts,
        update_envs: mockUpdateEnvs,
      }
    );

    chai.expect(mockUpdate.calledOnce).to.be.true;
  });

  it('should update interface with args', async () => {
    const mockUpdatedInterface = {
      id_interface: 1,
      label: 'interface1',
      args: ['--arg1', '--arg2'],
    };
    const mockUpdate = sinon.stub().resolves(mockUpdatedInterface);
    const mockUpdateArgs = sinon.stub().resolves();
    const mockUpdateNodeselectors = sinon.stub().resolves();
    const mockUpdatePorts = sinon.stub().resolves();
    const mockUpdateEnvs = sinon.stub().resolves();

    const result = await interface_service.update(
      {
        id_interface: 1,
        args: ['--arg1', '--arg2'],
      },
      {
        update: mockUpdate,
        update_args: mockUpdateArgs,
        update_nodeselectors: mockUpdateNodeselectors,
        update_ports: mockUpdatePorts,
        update_envs: mockUpdateEnvs,
      }
    );

    chai.expect(mockUpdate.calledOnce).to.be.true;
  });

  it('should throw error when id_interface is not positive', async () => {
    try {
      await interface_service.update({ id_interface: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_interface is missing', async () => {
    try {
      await interface_service.update({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when RAM format is invalid in update', async () => {
    try {
      await interface_service.update({
        id_interface: 1,
        ram_request: '1GB', // Invalid
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
