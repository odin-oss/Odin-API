import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import dbManager from '../../src/config/db.config.js';
import * as interface_builder from '../../src/builders/interface.builder.js';
import { Interface } from '../../src/objects/Interface.js';
import Argument from '../../src/objects/Argument.js';
import NodeSelector from '../../src/objects/NodeSelector.js';
import Port from '../../src/objects/Port.js';
import PortType from '../../src/objects/Port_type.js';
import VariableEnvironment from '../../src/objects/Variable_environment.js';
import { ImageType } from '../../src/objects/Image_type.js';
import { id } from 'zod/locales';

chai.use(sinonChai);

describe('interface.builder.get()', () => {
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.INTERFACE, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve an interface with valid id_interface', async () => {
    const mockImageType = {
      id_type: 1,
      label: 'Ubuntu',
    };

    findOneStub.resolves({
      dataValues: {
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
      },
      IMAGE_TYPE: mockImageType,
      INTERFACE_HAS_ARGUMENTs: [],
      INTERFACE_HAS_NODE_SELECTORs: [],
      INTERFACE_HAS_PORTs: [],
      INTERFACE_HAS_VARIABLEs: [],
    });

    const result = await interface_builder.get({ id_interface: 1 });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Interface);
    chai.expect(result.id_interface).to.equal(1);
    chai.expect(result.label).to.equal('test-interface');
  });

  it('should reject invalid id_interface (non-positive)', async () => {
    try {
      await interface_builder.get({ id_interface: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject negative id_interface', async () => {
    try {
      await interface_builder.get({ id_interface: -1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject missing id_interface parameter', async () => {
    try {
      await interface_builder.get({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject non-numeric id_interface', async () => {
    try {
      await interface_builder.get({ id_interface: 'invalid' });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle interface not found', async () => {
    findOneStub.resolves(null);

    try {
      await interface_builder.get({ id_interface: 999 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors during retrieval', async () => {
    findOneStub.rejects(new Error('Database connection failed'));

    try {
      await interface_builder.get({ id_interface: 1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should include arguments in interface response', async () => {
    findOneStub.resolves({
      dataValues: {
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
      },
      IMAGE_TYPE: { id_type: 1, label: 'Ubuntu' },
      INTERFACE_HAS_ARGUMENTs: [
        {
          id_argument: 1,
          ARGUMENT: { dataValues: { id_argument: 1, label: 'arg1' } },
        },
      ],
      INTERFACE_HAS_NODE_SELECTORs: [],
      INTERFACE_HAS_PORTs: [],
      INTERFACE_HAS_VARIABLEs: [],
    });

    const result = await interface_builder.get({ id_interface: 1 });

    chai.expect(result.args).to.have.lengthOf(1);
    chai.expect(result.args[0]).to.be.instanceOf(Argument);
  });

  it('should include ports in interface response', async () => {
    findOneStub.resolves({
      dataValues: {
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
      },
      IMAGE_TYPE: { id_type: 1, label: 'Ubuntu' },
      INTERFACE_HAS_ARGUMENTs: [],
      INTERFACE_HAS_NODE_SELECTORs: [],
      INTERFACE_HAS_PORTs: [
        {
          dataValues: { id_port: 1, port: 8080 },
          PORT_TYPE: { dataValues: { id_port_type: 1, label: 'HTTP' } },
        },
      ],
      INTERFACE_HAS_VARIABLEs: [],
    });

    const result = await interface_builder.get({ id_interface: 1 });

    chai.expect(result.ports).to.have.lengthOf(1);
    chai.expect(result.ports[0]).to.be.instanceOf(Port);
  });

  it('should include environment variables in interface response', async () => {
    findOneStub.resolves({
      dataValues: {
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
      },
      IMAGE_TYPE: { id_type: 1, label: 'Ubuntu' },
      INTERFACE_HAS_ARGUMENTs: [],
      INTERFACE_HAS_NODE_SELECTORs: [],
      INTERFACE_HAS_PORTs: [],
      INTERFACE_HAS_VARIABLEs: [
        {
          VARIABLE_ENVIRONMENT: {
            dataValues: { id_variable_environment: 1, label: 'ENV_VAR' },
          },
        },
      ],
    });

    const result = await interface_builder.get({ id_interface: 1 });

    chai.expect(result.envs).to.have.lengthOf(1);
    chai.expect(result.envs[0]).to.be.instanceOf(VariableEnvironment);
  });
});

describe('interface.builder.list()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.INTERFACE, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve all interfaces', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_interface: 1,
          label: 'interface1',
          default_label: 'Interface 1',
          registry_link: 'docker.io/test1',
          exec_command: '/bin/bash',
          service_command: 'start',
          privileged: false,
          readiness_probe_initial_delay: 5,
          liveness_probe_initial_delay: 200,
          readiness_probe_period: 10,
          liveness_probe_period: 20,
          need_compute_gpu: false,
          need_graphical_rendering_gpu: false,
          cpu_request: '2',
          cpu_limit: '4',
          ram_request: '4Gi',
          ram_limit: '8Gi',
          egress_bandwidth: '100M',
          ingress_bandwidth: '100M',
        },
        IMAGE_TYPE: { id_type: 1, label: 'Ubuntu' },
        INTERFACE_HAS_ARGUMENTs: [],
        INTERFACE_HAS_NODE_SELECTORs: [],
        INTERFACE_HAS_PORTs: [],
        INTERFACE_HAS_VARIABLEs: [],
      },
      {
        dataValues: {
          id_interface: 2,
          label: 'interface2',
          default_label: 'Interface 2',
          registry_link: 'docker.io/test2',
          exec_command: '/bin/bash',
          service_command: 'start',
          privileged: false,
          readiness_probe_initial_delay: 5,
          liveness_probe_initial_delay: 200,
          readiness_probe_period: 10,
          liveness_probe_period: 20,
          need_compute_gpu: false,
          need_graphical_rendering_gpu: false,
          cpu_request: '2',
          cpu_limit: '4',
          ram_request: '4Gi',
          ram_limit: '8Gi',
          egress_bandwidth: '100M',
          ingress_bandwidth: '100M',
        },
        IMAGE_TYPE: { id_type: 1, label: 'Ubuntu' },
        INTERFACE_HAS_ARGUMENTs: [],
        INTERFACE_HAS_NODE_SELECTORs: [],
        INTERFACE_HAS_PORTs: [],
        INTERFACE_HAS_VARIABLEs: [],
      },
    ]);

    const result = await interface_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(2);
    chai.expect(result[0]).to.be.instanceOf(Interface);
    chai.expect(result[1]).to.be.instanceOf(Interface);
  });

  it('should return empty array when no interfaces exist', async () => {
    findAllStub.resolves([]);

    const result = await interface_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });

  it('should handle database errors during list retrieval', async () => {
    findAllStub.rejects(new Error('Database connection failed'));

    try {
      await interface_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should include all interface properties in response', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_interface: 1,
          label: 'interface1',
          default_label: 'Interface 1',
          registry_link: 'docker.io/test1',
          exec_command: '/bin/bash',
          service_command: 'start',
          privileged: false,
          readiness_probe_initial_delay: 5,
          liveness_probe_initial_delay: 200,
          readiness_probe_period: 10,
          liveness_probe_period: 20,
          need_compute_gpu: false,
          need_graphical_rendering_gpu: false,
          cpu_request: '2',
          cpu_limit: '4',
          ram_request: '4Gi',
          ram_limit: '8Gi',
          egress_bandwidth: '100M',
          ingress_bandwidth: '100M',
        },
        IMAGE_TYPE: { id_type: 1, label: 'Ubuntu' },
        INTERFACE_HAS_ARGUMENTs: [],
        INTERFACE_HAS_NODE_SELECTORs: [],
        INTERFACE_HAS_PORTs: [],
        INTERFACE_HAS_VARIABLEs: [],
      },
    ]);

    const result = await interface_builder.list();

    const inter = result[0];
    chai.expect(inter.id_interface).to.equal(1);
    chai.expect(inter.label).to.equal('interface1');
    chai.expect(inter.registry_link).to.equal('docker.io/test1');
    chai.expect(inter.exec_command).to.equal('/bin/bash');
  });
});

describe('interface.builder.create()', () => {
  let createStub;
  let getStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    createStub = sinon.stub(dbManager.models.INTERFACE, 'create');
    getStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create an interface with valid parameters', async () => {
    createStub.resolves({
      dataValues: {
        id_interface: 1,
        label: 'new-interface',
        default_label: 'New Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        id_type: 1,
      },
    });

    getStub.resolves(
      new Interface({
        id_interface: 1,
        label: 'new-interface',
        default_label: 'New Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        type: new ImageType({
          id_type: 1,
          label: 'Ubuntu',
        }),
      })
    );

    const result = await interface_builder.create(
      {
        label: 'new-interface',
        default_label: 'New Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        id_type: 1,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        readiness_probe_initial_delay: 5,
        readiness_probe_period: 10,
        liveness_probe_initial_delay: 200,
        liveness_probe_period: 20,
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
      },
      { get: getStub }
    );

    chai.expect(createStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Interface);
  });

  it('should reject missing label parameter', async () => {
    try {
      await interface_builder.create(
        {
          default_label: 'New Interface',
          registry_link: 'docker.io/test',
          exec_command: '/bin/bash',
          service_command: 'start',
          id_type: 1,
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid id_type (non-positive)', async () => {
    try {
      await interface_builder.create(
        {
          label: 'new-interface',
          default_label: 'New Interface',
          registry_link: 'docker.io/test',
          exec_command: '/bin/bash',
          service_command: 'start',
          id_type: 0,
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid CPU request format', async () => {
    try {
      await interface_builder.create(
        {
          label: 'new-interface',
          default_label: 'New Interface',
          registry_link: 'docker.io/test',
          exec_command: '/bin/bash',
          service_command: 'start',
          id_type: 1,
          cpu_request: 'invalid',
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid RAM request format', async () => {
    try {
      await interface_builder.create(
        {
          label: 'new-interface',
          default_label: 'New Interface',
          registry_link: 'docker.io/test',
          exec_command: '/bin/bash',
          service_command: 'start',
          id_type: 1,
          ram_request: '4GB',
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid bandwidth format', async () => {
    try {
      await interface_builder.create(
        {
          label: 'new-interface',
          default_label: 'New Interface',
          registry_link: 'docker.io/test',
          exec_command: '/bin/bash',
          service_command: 'start',
          id_type: 1,
          egress_bandwidth: '100K',
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors during creation', async () => {
    createStub.rejects(new Error('Database connection failed'));

    try {
      await interface_builder.create(
        {
          label: 'new-interface',
          default_label: 'New Interface',
          registry_link: 'docker.io/test',
          exec_command: '/bin/bash',
          service_command: 'start',
          id_type: 1,
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('interface.builder.update()', () => {
  let updateStub;
  let getStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    updateStub = sinon.stub(dbManager.models.INTERFACE, 'update');
    sinon
      .stub(dbManager.models.INTERFACE, 'findByPk')
      .resolves({ id_interface: 1 });
    getStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update interface with valid parameters', async () => {
    updateStub.resolves([1]);

    getStub.resolves(
      new Interface({
        id_interface: 1,
        label: 'updated-interface',
        default_label: 'Updated Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 10,
        liveness_probe_initial_delay: 210,
        readiness_probe_period: 15,
        liveness_probe_period: 25,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        type: new ImageType({
          id_type: 1,
          label: 'Ubuntu',
        }),
      })
    );

    const result = await interface_builder.update(
      {
        id_interface: 1,
        label: 'updated-interface',
        default_label: 'Updated Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        id_type: 1,
      },
      { get: getStub }
    );

    chai.expect(updateStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Interface);
  });

  it('should reject invalid id_interface (non-positive)', async () => {
    try {
      await interface_builder.update(
        {
          id_interface: 0,
          label: 'updated-interface',
          default_label: 'Updated Interface',
          registry_link: 'docker.io/test',
          exec_command: '/bin/bash',
          service_command: 'start',
          id_type: 1,
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject missing id_interface parameter', async () => {
    try {
      await interface_builder.update(
        {
          label: 'updated-interface',
          default_label: 'Updated Interface',
          registry_link: 'docker.io/test',
          exec_command: '/bin/bash',
          service_command: 'start',
          id_type: 1,
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors during update', async () => {
    updateStub.rejects(new Error('Database connection failed'));

    try {
      await interface_builder.update(
        {
          id_interface: 1,
          label: 'updated-interface',
          default_label: 'Updated Interface',
          registry_link: 'docker.io/test',
          exec_command: '/bin/bash',
          service_command: 'start',
          id_type: 1,
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('interface.builder.update_args()', () => {
  let destroyStub;
  let createStub;
  let getStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    destroyStub = sinon.stub(
      dbManager.models.INTERFACE_HAS_ARGUMENT,
      'destroy'
    );
    createStub = sinon.stub(dbManager.models.INTERFACE_HAS_ARGUMENT, 'create');
    sinon
      .stub(dbManager.models.INTERFACE, 'findByPk')
      .resolves({ id_interface: 1 });
    sinon.stub(dbManager.models.INTERFACE, 'findOne').resolves({
      dataValues: {
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        id_type: 1,
      },
      IMAGE_TYPE: { id_type: 1, label: 'Ubuntu' },
      INTERFACE_HAS_ARGUMENTs: [],
      INTERFACE_HAS_NODE_SELECTORs: [],
      INTERFACE_HAS_PORTs: [],
      INTERFACE_HAS_VARIABLEs: [],
    });
    sinon.stub(dbManager.models.ARGUMENT, 'findOne').resolves(null);
    sinon.stub(dbManager.models.ARGUMENT, 'create').resolves({
      id_argument: 1,
      value: 'test-arg',
    });
    getStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update interface arguments with valid parameters', async () => {
    destroyStub.resolves(1);
    createStub.resolves({});

    getStub.resolves(
      new Interface({
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        type: new ImageType({
          id_type: 1,
          label: 'Ubuntu',
        }),
        args: [new Argument({ id_argument: 1, label: 'arg1' })],
      })
    );

    const result = await interface_builder.update_args(
      {
        id_interface: 1,
        args: ['arg1', 'arg2'],
      },
      { get: getStub }
    );

    chai.expect(destroyStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Interface);
  });

  it('should reject invalid id_interface (non-positive)', async () => {
    try {
      await interface_builder.update_args(
        {
          id_interface: 0,
          args: [{ id_argument: 1 }],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject missing id_interface parameter', async () => {
    try {
      await interface_builder.update_args(
        {
          args: [{ id_argument: 1 }],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors during update', async () => {
    destroyStub.rejects(new Error('Database connection failed'));

    try {
      await interface_builder.update_args(
        {
          id_interface: 1,
          args: [{ id_argument: 1 }],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('interface.builder.update_ports()', () => {
  let destroyStub;
  let createStub;
  let getStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    destroyStub = sinon.stub(dbManager.models.INTERFACE_HAS_PORT, 'destroy');
    createStub = sinon.stub(dbManager.models.INTERFACE_HAS_PORT, 'create');
    sinon
      .stub(dbManager.models.INTERFACE, 'findByPk')
      .resolves({ id_interface: 1 });
    sinon.stub(dbManager.models.INTERFACE, 'findOne').resolves({
      dataValues: {
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        id_type: 1,
      },
      IMAGE_TYPE: { id_type: 1, label: 'Ubuntu' },
      INTERFACE_HAS_ARGUMENTs: [],
      INTERFACE_HAS_NODE_SELECTORs: [],
      INTERFACE_HAS_PORTs: [],
      INTERFACE_HAS_VARIABLEs: [],
    });
    getStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update interface ports with valid parameters', async () => {
    destroyStub.resolves(1);
    createStub.resolves({});

    getStub.resolves(
      new Interface({
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        type: new ImageType({
          id_type: 1,
          label: 'Ubuntu',
        }),
        ports: [
          new Port({
            id_port: 1,
            port: 8080,
            port_type: new PortType({ id_port_type: 1, label: 'HTTP' }),
          }),
        ],
      })
    );

    const result = await interface_builder.update_ports(
      {
        id_interface: 1,
        ports: [
          {
            id_port: 1,
            port: 8080,
            id_port_type: 1,
            icon: 'http',
            label: 'HTTP',
            display_name: 'HTTP Port',
          },
        ],
      },
      { get: getStub }
    );

    chai.expect(destroyStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Interface);
  });

  it('should reject invalid id_interface (non-positive)', async () => {
    try {
      await interface_builder.update_ports(
        {
          id_interface: 0,
          ports: [{ id_port: 1, port: 8080, id_port_type: 1 }],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors during update', async () => {
    destroyStub.rejects(new Error('Database connection failed'));

    try {
      await interface_builder.update_ports(
        {
          id_interface: 1,
          ports: [{ id_port: 1, port: 8080, id_port_type: 1 }],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('interface.builder.update_envs()', () => {
  let destroyStub;
  let createStub;
  let getStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    destroyStub = sinon.stub(
      dbManager.models.INTERFACE_HAS_VARIABLE,
      'destroy'
    );
    createStub = sinon.stub(dbManager.models.INTERFACE_HAS_VARIABLE, 'create');
    sinon
      .stub(dbManager.models.INTERFACE, 'findByPk')
      .resolves({ id_interface: 1 });
    sinon.stub(dbManager.models.INTERFACE, 'findOne').resolves({
      dataValues: {
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        id_type: 1,
      },
      IMAGE_TYPE: { id_type: 1, label: 'Ubuntu' },
      INTERFACE_HAS_ARGUMENTs: [],
      INTERFACE_HAS_NODE_SELECTORs: [],
      INTERFACE_HAS_PORTs: [],
      INTERFACE_HAS_VARIABLEs: [],
    });
    sinon.stub(dbManager.models.VARIABLE_ENVIRONMENT, 'create').resolves({
      id_variable_environment: 1,
      key: 'TEST_VAR',
      value: 'test-value',
    });
    sinon
      .stub(dbManager.models.INTERFACE_HAS_VARIABLE, 'findOne')
      .resolves(null);
    getStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update interface environment variables with valid parameters', async () => {
    destroyStub.resolves(1);
    createStub.resolves({});

    getStub.resolves(
      new Interface({
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        type: new ImageType({
          id_type: 1,
          label: 'Ubuntu',
        }),
        envs: [new VariableEnvironment({ id_variable_environment: 1 })],
      })
    );

    const result = await interface_builder.update_envs(
      {
        id_interface: 1,
        envs: [{ id_variable_environment: 1 }],
      },
      { get: getStub }
    );

    chai.expect(destroyStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Interface);
  });

  it('should reject invalid id_interface (non-positive)', async () => {
    try {
      await interface_builder.update_envs(
        {
          id_interface: 0,
          envs: [{ id_variable_environment: 1 }],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors during update', async () => {
    destroyStub.rejects(new Error('Database connection failed'));

    try {
      await interface_builder.update_envs(
        {
          id_interface: 1,
          envs: [{ id_variable_environment: 1 }],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('interface.builder.update_nodeselectors()', () => {
  let destroyStub;
  let createStub;
  let getStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    destroyStub = sinon.stub(
      dbManager.models.INTERFACE_HAS_NODE_SELECTOR,
      'destroy'
    );
    createStub = sinon.stub(
      dbManager.models.INTERFACE_HAS_NODE_SELECTOR,
      'create'
    );
    sinon
      .stub(dbManager.models.INTERFACE, 'findByPk')
      .resolves({ id_interface: 1 });
    sinon.stub(dbManager.models.INTERFACE, 'findOne').resolves({
      dataValues: {
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        id_type: 1,
      },
      IMAGE_TYPE: { id_type: 1, label: 'Ubuntu' },
      INTERFACE_HAS_ARGUMENTs: [],
      INTERFACE_HAS_NODE_SELECTORs: [],
      INTERFACE_HAS_PORTs: [],
      INTERFACE_HAS_VARIABLEs: [],
    });
    sinon
      .stub(dbManager.models.INTERFACE_HAS_NODE_SELECTOR, 'findOne')
      .resolves(null);
    getStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update interface node selectors with valid parameters', async () => {
    destroyStub.resolves(1);
    createStub.resolves({});

    getStub.resolves(
      new Interface({
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        type: new ImageType({
          id_type: 1,
          label: 'Ubuntu',
        }),
        node_selectors: [new NodeSelector({ id_node_selector: 1 })],
      })
    );

    const result = await interface_builder.update_nodeselectors(
      {
        id_interface: 1,
        node_selectors: [1, 2],
      },
      { get: getStub }
    );

    chai.expect(destroyStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Interface);
  });

  it('should reject invalid id_interface (non-positive)', async () => {
    try {
      await interface_builder.update_nodeselectors(
        {
          id_interface: 0,
          node_selectors: [{ id_node_selector: 1 }],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors during update', async () => {
    destroyStub.rejects(new Error('Database connection failed'));

    try {
      await interface_builder.update_nodeselectors(
        {
          id_interface: 1,
          node_selectors: [{ id_node_selector: 1 }],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('interface.builder.attach_nodeselectors()', () => {
  let createStub;
  let getStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    createStub = sinon.stub(
      dbManager.models.INTERFACE_HAS_NODE_SELECTOR,
      'create'
    );
    sinon
      .stub(dbManager.models.INTERFACE, 'findByPk')
      .resolves({ id_interface: 1 });
    sinon.stub(dbManager.models.INTERFACE, 'findOne').resolves({
      dataValues: {
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        id_type: 1,
      },
      IMAGE_TYPE: { id_type: 1, label: 'Ubuntu' },
      INTERFACE_HAS_ARGUMENTs: [],
      INTERFACE_HAS_NODE_SELECTORs: [],
      INTERFACE_HAS_PORTs: [],
      INTERFACE_HAS_VARIABLEs: [],
    });
    sinon
      .stub(dbManager.models.INTERFACE_HAS_NODE_SELECTOR, 'findOne')
      .resolves(null);
    getStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should attach node selectors to interface with valid parameters', async () => {
    createStub.resolves({});

    getStub.resolves(
      new Interface({
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        type: new ImageType({
          id_type: 1,
          label: 'Ubuntu',
        }),
        node_selectors: [new NodeSelector({ id_node_selector: 1 })],
      })
    );

    const result = await interface_builder.attach_nodeselectors(
      {
        id_interface: 1,
        ids_node_selector: [1, 2],
      },
      { get: getStub }
    );

    chai.expect(createStub.calledTwice).to.be.true;
    chai.expect(result).to.be.instanceOf(Interface);
  });

  it('should reject invalid id_interface (non-positive)', async () => {
    try {
      await interface_builder.attach_nodeselectors(
        {
          id_interface: 0,
          ids_node_selector: [1],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors during attachment', async () => {
    createStub.rejects(new Error('Database connection failed'));

    try {
      await interface_builder.attach_nodeselectors(
        {
          id_interface: 1,
          ids_node_selector: [1],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('interface.builder.attach_ports()', () => {
  let createStub;
  let getStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    createStub = sinon.stub(dbManager.models.INTERFACE_HAS_PORT, 'create');
    sinon
      .stub(dbManager.models.INTERFACE, 'findByPk')
      .resolves({ id_interface: 1 });
    getStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should attach ports to interface with valid parameters', async () => {
    createStub.resolves({});

    getStub.resolves(
      new Interface({
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        type: new ImageType({
          id_type: 1,
          label: 'Ubuntu',
        }),
        ports: [
          new Port({
            id_port: 1,
            port: 8080,
            port_type: new PortType({ id_port_type: 1, label: 'HTTP' }),
          }),
        ],
      })
    );

    const result = await interface_builder.attach_ports(
      {
        id_interface: 1,
        ports: [
          {
            id_port: 1,
            port: 8080,
            id_port_type: 1,
            icon: 'http',
            label: 'HTTP',
            display_name: 'HTTP Port',
          },
        ],
      },
      { get: getStub }
    );

    chai.expect(createStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Interface);
  });

  it('should reject invalid id_interface (non-positive)', async () => {
    try {
      await interface_builder.attach_ports(
        {
          id_interface: 0,
          ports: [{ id_port: 1, port: 8080, id_port_type: 1 }],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors during attachment', async () => {
    createStub.rejects(new Error('Database connection failed'));

    try {
      await interface_builder.attach_ports(
        {
          id_interface: 1,
          ports: [{ id_port: 1, port: 8080, id_port_type: 1 }],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('interface.builder.attach_envs()', () => {
  let createStub;
  let getStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    createStub = sinon.stub(dbManager.models.INTERFACE_HAS_VARIABLE, 'create');
    sinon
      .stub(dbManager.models.INTERFACE, 'findByPk')
      .resolves({ id_interface: 1 });
    sinon.stub(dbManager.models.INTERFACE, 'findOne').resolves({
      dataValues: {
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        id_type: 1,
      },
      IMAGE_TYPE: { id_type: 1, label: 'Ubuntu' },
      INTERFACE_HAS_ARGUMENTs: [],
      INTERFACE_HAS_NODE_SELECTORs: [],
      INTERFACE_HAS_PORTs: [],
      INTERFACE_HAS_VARIABLEs: [],
    });
    sinon.stub(dbManager.models.VARIABLE_ENVIRONMENT, 'create').resolves({
      id_variable_environment: 1,
      key: 'TEST_VAR',
      value: 'test-value',
    });
    sinon
      .stub(dbManager.models.INTERFACE_HAS_VARIABLE, 'findOne')
      .resolves(null);
    getStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should attach environment variables to interface with valid parameters', async () => {
    createStub.resolves({});

    getStub.resolves(
      new Interface({
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        type: new ImageType({
          id_type: 1,
          label: 'Ubuntu',
        }),
        envs: [new VariableEnvironment({ id_variable_environment: 1 })],
      })
    );

    getStub.resolves(
      new Interface({
        id_interface: 1,
        label: 'test-interface',
        default_label: 'Test Interface',
        registry_link: 'docker.io/test',
        exec_command: '/bin/bash',
        service_command: 'start',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        cpu_request: '2',
        cpu_limit: '4',
        ram_request: '4Gi',
        ram_limit: '8Gi',
        egress_bandwidth: '100M',
        ingress_bandwidth: '100M',
        type: new ImageType({
          id_type: 1,
          label: 'Ubuntu',
        }),
        envs: [new VariableEnvironment({ id_variable_environment: 1 })],
      })
    );

    const result = await interface_builder.attach_envs(
      {
        id_interface: 1,
        envs: [{ id_variable_environment: 1 }],
      },
      { get: getStub }
    );

    chai.expect(createStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Interface);
  });

  it('should reject invalid id_interface (non-positive)', async () => {
    try {
      await interface_builder.attach_envs(
        {
          id_interface: 0,
          envs: [{ id_variable_environment: 1 }],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors during attachment', async () => {
    createStub.rejects(new Error('Database connection failed'));

    try {
      await interface_builder.attach_envs(
        {
          id_interface: 1,
          envs: [{ id_variable_environment: 1 }],
        },
        { get: getStub }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
