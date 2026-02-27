import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import dbManager from '../../src/config/db.config.js';
import * as environment_builder from '../../src/builders/environment.builder.js';
import { Environment } from '../../src/objects/Environment.js';
import { Interface } from '../../src/objects/Interface.js';
import {
  DBObjectAlreadyExists,
  DBObjectNotFound,
} from '../../src/utils/errors.util.js';

chai.use(sinonChai);

describe('environment.builder.list()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(
      dbManager.models.ENVIRONMENT_HAS_INTERFACE,
      'findAll'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return all environments with interfaces', async () => {
    findAllStub.resolves([
      {
        id_environment: 1,
        id_interface: 1,
        ENVIRONMENT: {
          dataValues: {
            id_environment: 1,
            label: 'prod',
            icon: 'prod-icon',
          },
        },
        INTERFACE: {
          dataValues: {
            id_interface: 1,
            label: 'backend',
            command: 'node app.js',
          },
          IMAGE_TYPE: {
            label: 'Node.js',
          },
        },
      },
    ]);

    const result = await environment_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result[0]).to.be.instanceOf(Environment);
  });

  it('should return empty array when no environments exist', async () => {
    findAllStub.resolves([]);

    const result = await environment_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });

  it('should merge multiple interfaces into same environment', async () => {
    findAllStub.resolves([
      {
        id_environment: 1,
        id_interface: 1,
        ENVIRONMENT: {
          dataValues: {
            id_environment: 1,
            label: 'prod',
            icon: 'prod-icon',
          },
        },
        INTERFACE: {
          dataValues: {
            id_interface: 1,
            label: 'backend',
            command: 'node app.js',
          },
          IMAGE_TYPE: {
            label: 'Node.js',
          },
        },
      },
      {
        id_environment: 1,
        id_interface: 2,
        ENVIRONMENT: {
          dataValues: {
            id_environment: 1,
            label: 'prod',
            icon: 'prod-icon',
          },
        },
        INTERFACE: {
          dataValues: {
            id_interface: 2,
            label: 'frontend',
            command: 'npm start',
          },
          IMAGE_TYPE: {
            label: 'Node.js',
          },
        },
      },
    ]);

    const result = await environment_builder.list();

    chai.expect(result).to.have.lengthOf(1);
    chai.expect(result[0].interfaces).to.have.lengthOf(2);
    chai.expect(result[0]).to.be.instanceOf(Environment);
  });

  it('should handle database errors', async () => {
    findAllStub.rejects(new Error('Database connection failed'));

    try {
      await environment_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle large dataset of environments', async () => {
    const largeDataset = Array.from({ length: 30 }, (_, i) => ({
      id_environment: Math.floor(i / 2) + 1,
      id_interface: i + 1,
      ENVIRONMENT: {
        dataValues: {
          id_environment: Math.floor(i / 2) + 1,
          label: `env-${Math.floor(i / 2) + 1}`,
          icon: `icon-${Math.floor(i / 2) + 1}`,
        },
      },
      INTERFACE: {
        dataValues: {
          id_interface: i + 1,
          label: `interface-${i + 1}`,
          command: `cmd-${i + 1}`,
        },
        IMAGE_TYPE: {
          label: 'Node.js',
        },
      },
    }));
    findAllStub.resolves(largeDataset);

    const result = await environment_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.have.lengthOf(15);
  });
});

describe('environment.builder.get()', () => {
  let findOneStub;
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.ENVIRONMENT, 'findOne');
    findAllStub = sinon.stub(dbManager.models.INTERFACE, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should get a complete environment by id with all details', async () => {
    findOneStub.resolves({
      dataValues: {
        id_environment: 1,
        label: 'prod',
        icon: 'prod-icon',
      },
      ENVIRONMENT_HAS_INTERFACEs: [
        {
          id_interface: 1,
          label: 'backend',
        },
      ],
    });

    findAllStub.resolves([
      {
        id_interface: 1,
        dataValues: {
          id_interface: 1,
          label: 'backend',
          command: 'node app.js',
        },
        IMAGE_TYPE: {
          id_type: 1,
          label: 'Node.js',
        },
        INTERFACE_HAS_ARGUMENTs: [],
        INTERFACE_HAS_NODE_SELECTORs: [],
        INTERFACE_HAS_PORTs: [],
        INTERFACE_HAS_VARIABLEs: [],
      },
    ]);

    const result = await environment_builder.get({ id_environment: 1 });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Environment);
    chai.expect(result.id_environment).to.equal(1);
  });

  it('should throw error when environment not found', async () => {
    findOneStub.resolves(null);

    try {
      await environment_builder.get({ id_environment: 999 });
      chai.expect.fail('Should have thrown DBObjectNotFound error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });

  it('should validate id_environment is positive integer', async () => {
    try {
      await environment_builder.get({ id_environment: -1 });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors', async () => {
    findOneStub.rejects(new Error('Database connection failed'));

    try {
      await environment_builder.get({ id_environment: 1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should include all interface details (args, node_selectors, ports, envs)', async () => {
    findOneStub.resolves({
      dataValues: {
        id_environment: 1,
        label: 'prod',
        icon: 'prod-icon',
      },
      ENVIRONMENT_HAS_INTERFACEs: [
        {
          id_interface: 1,
          label: 'backend',
        },
      ],
    });

    findAllStub.resolves([
      {
        id_interface: 1,
        dataValues: {
          id_interface: 1,
          label: 'backend',
          command: 'node app.js',
        },
        IMAGE_TYPE: {
          id_type: 1,
          label: 'Node.js',
        },
        INTERFACE_HAS_ARGUMENTs: [
          {
            ARGUMENT: {
              dataValues: {
                id_argument: 1,
                value: '--verbose',
              },
            },
            id_argument: 1,
          },
        ],
        INTERFACE_HAS_NODE_SELECTORs: [
          {
            NODE_SELECTOR: {
              dataValues: {
                id_node_selector: 1,
                key: 'gpu',
                value: 'true',
              },
            },
          },
        ],
        INTERFACE_HAS_PORTs: [
          {
            dataValues: {
              id_port: 1,
              port: 8080,
              protocol: 'TCP',
            },
            PORT_TYPE: {
              dataValues: {
                id_port_type: 1,
                label: 'http',
              },
            },
          },
        ],
        INTERFACE_HAS_VARIABLEs: [
          {
            VARIABLE_ENVIRONMENT: {
              dataValues: {
                id_variable_environment: 1,
                key: 'DEBUG',
                value: 'true',
              },
            },
          },
        ],
      },
    ]);

    const result = await environment_builder.get({ id_environment: 1 });

    chai.expect(result.interfaces[0].args).to.have.lengthOf(1);
    chai.expect(result.interfaces[0].node_selectors).to.have.lengthOf(1);
    chai.expect(result.interfaces[0].ports).to.have.lengthOf(1);
    chai.expect(result.interfaces[0].envs).to.have.lengthOf(1);
  });
});

describe('environment.builder.create()', () => {
  let createStub;
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    createStub = sinon.stub(dbManager.models.ENVIRONMENT, 'create');
    findOneStub = sinon.stub(dbManager.models.ENVIRONMENT, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create an environment with valid data', async () => {
    createStub.resolves({
      id_environment: 1,
      label: 'prod',
      icon: 'prod-icon',
    });
    findOneStub.resolves({
      id_environment: 1,
      label: 'prod',
      icon: 'prod-icon',
    });

    const result = await environment_builder.create({
      label: 'PROD',
      icon: 'prod-icon',
    });

    chai.expect(createStub.calledOnce).to.be.true;
    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Environment);
  });

  it('should preprocess label to lowercase and remove special chars', async () => {
    createStub.resolves({
      id_environment: 1,
      label: 'prodenv',
      icon: 'prod-icon',
    });
    findOneStub.resolves({
      id_environment: 1,
      label: 'prodenv',
      icon: 'prod-icon',
    });

    await environment_builder.create({
      label: 'PROD@ENV!',
      icon: 'prod-icon',
    });

    const callArgs = createStub.getCall(0).args[0];
    chai.expect(callArgs.label).to.equal('prodenv');
  });

  it('should validate label is minimum 2 characters (after preprocessing)', async () => {
    try {
      await environment_builder.create({
        label: 'A',
        icon: 'prod-icon',
      });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate icon is minimum 2 characters', async () => {
    try {
      await environment_builder.create({
        label: 'PROD',
        icon: 'A',
      });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors', async () => {
    createStub.rejects(new Error('Database connection failed'));

    try {
      await environment_builder.create({
        label: 'PROD',
        icon: 'prod-icon',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should require all parameters', async () => {
    try {
      await environment_builder.create({
        label: 'PROD',
      });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('environment.builder.attach_interface()', () => {
  let findByPkStub;
  let findOneStub;
  let createStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findByPkStub = sinon.stub(dbManager.models.ENVIRONMENT, 'findByPk');
    findOneStub = sinon.stub(
      dbManager.models.ENVIRONMENT_HAS_INTERFACE,
      'findOne'
    );
    createStub = sinon.stub(
      dbManager.models.ENVIRONMENT_HAS_INTERFACE,
      'create'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should attach interface to environment', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_INTERFACEs: [],
    });
    findOneStub.resolves(null);
    createStub.resolves({ id_environment: 1, id_interface: 1, label: 'api' });

    const mockGetFn = sinon.stub().resolves(
      new Environment({
        id_environment: 1,
        label: 'prod',
        icon: 'prod-icon',
        interfaces: [
          new Interface({
            id_interface: 1,
            label: 'api',
            command: 'node api.js',
          }),
        ],
      })
    );

    const result = await environment_builder.attach_interface(
      { id_environment: 1, id_interface: 1, label: 'API' },
      { get: mockGetFn }
    );

    chai.expect(findByPkStub.calledOnce).to.be.true;
    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(createStub.calledOnce).to.be.true;
    chai.expect(mockGetFn.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Environment);
  });

  it('should throw error when environment not found', async () => {
    findByPkStub.resolves(null);

    try {
      await environment_builder.attach_interface(
        { id_environment: 999, id_interface: 1, label: 'API' },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown DBObjectNotFound error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });

  it('should throw error when interface already attached', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_INTERFACEs: [],
    });
    findOneStub.resolves({ id_environment: 1, id_interface: 1 });

    try {
      await environment_builder.attach_interface(
        { id_environment: 1, id_interface: 1, label: 'API' },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown DBObjectAlreadyExists error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectAlreadyExists);
    }
  });

  it('should preprocess label to lowercase and remove special chars', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_INTERFACEs: [],
    });
    findOneStub.resolves(null);
    createStub.resolves({ id_environment: 1, id_interface: 1, label: 'api' });

    const mockGetFn = sinon.stub().resolves(
      new Environment({
        id_environment: 1,
        label: 'prod',
        icon: 'prod-icon',
        interfaces: [],
      })
    );

    await environment_builder.attach_interface(
      { id_environment: 1, id_interface: 1, label: 'API@123' },
      { get: mockGetFn }
    );

    const callArgs = createStub.getCall(0).args[0];
    chai.expect(callArgs.label).to.equal('api123');
  });

  it('should validate label is minimum 2 characters (after preprocessing)', async () => {
    try {
      await environment_builder.attach_interface(
        { id_environment: 1, id_interface: 1, label: 'A' },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate id_environment is positive integer', async () => {
    try {
      await environment_builder.attach_interface(
        { id_environment: -1, id_interface: 1, label: 'API' },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate id_interface is positive integer', async () => {
    try {
      await environment_builder.attach_interface(
        { id_environment: 1, id_interface: -1, label: 'API' },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('environment.builder.detach_interface()', () => {
  let findByPkStub;
  let findOneStub;
  let destroyStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findByPkStub = sinon.stub(dbManager.models.ENVIRONMENT, 'findByPk');
    findOneStub = sinon.stub(
      dbManager.models.ENVIRONMENT_HAS_INTERFACE,
      'findOne'
    );
    destroyStub = sinon.stub(
      dbManager.models.ENVIRONMENT_HAS_INTERFACE,
      'destroy'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should detach interface from environment', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_INTERFACEs: [],
    });
    findOneStub.resolves({ id_environment: 1, id_interface: 1, label: 'api' });
    destroyStub.resolves(1);

    const mockGetFn = sinon.stub().resolves(
      new Environment({
        id_environment: 1,
        label: 'prod',
        icon: 'prod-icon',
        interfaces: [],
      })
    );

    const result = await environment_builder.detach_interface(
      { id_environment: 1, id_interface: 1, label: 'API' },
      { get: mockGetFn }
    );

    chai.expect(findByPkStub.calledOnce).to.be.true;
    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(destroyStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Environment);
  });

  it('should throw error when environment not found', async () => {
    findByPkStub.resolves(null);

    try {
      await environment_builder.detach_interface(
        { id_environment: 999, id_interface: 1, label: 'API' },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown DBObjectNotFound error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });

  it('should throw error when interface is not attached', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_INTERFACEs: [],
    });
    findOneStub.resolves(null);

    try {
      await environment_builder.detach_interface(
        { id_environment: 1, id_interface: 999, label: 'API' },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown DBObjectAlreadyExists error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectAlreadyExists);
    }
  });

  it('should validate label is minimum 2 characters (after preprocessing)', async () => {
    try {
      await environment_builder.detach_interface(
        { id_environment: 1, id_interface: 1, label: 'A' },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should call get function with data params', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_INTERFACEs: [],
    });
    findOneStub.resolves({ id_environment: 1, id_interface: 1 });
    destroyStub.resolves(1);

    const mockGetFn = sinon.stub().resolves(
      new Environment({
        id_environment: 1,
        label: 'prod',
        icon: 'prod-icon',
        interfaces: [],
      })
    );

    await environment_builder.detach_interface(
      { id_environment: 1, id_interface: 1, label: 'API' },
      { get: mockGetFn }
    );

    chai.expect(mockGetFn.calledOnce).to.be.true;
  });
});

describe('environment.builder.update()', () => {
  let findByPkStub;
  let updateStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findByPkStub = sinon.stub(dbManager.models.ENVIRONMENT, 'findByPk');
    updateStub = sinon.stub(dbManager.models.ENVIRONMENT, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update environment label and icon', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_INTERFACEs: [],
    });
    updateStub.resolves([1]);

    const mockGetFn = sinon.stub().resolves(
      new Environment({
        id_environment: 1,
        label: 'staging',
        icon: 'staging-icon',
        interfaces: [],
      })
    );

    const result = await environment_builder.update(
      {
        id_environment: 1,
        label: 'STAGING',
        icon: 'staging-icon',
      },
      { get: mockGetFn }
    );

    chai.expect(findByPkStub.calledOnce).to.be.true;
    chai.expect(updateStub.calledOnce).to.be.true;
    chai.expect(mockGetFn.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Environment);
  });

  it('should preprocess label and icon', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_INTERFACEs: [],
    });
    updateStub.resolves([1]);

    const mockGetFn = sinon.stub().resolves(
      new Environment({
        id_environment: 1,
        label: 'staging',
        icon: 'stagingicon',
        interfaces: [],
      })
    );

    await environment_builder.update(
      {
        id_environment: 1,
        label: 'STAGING@123',
        icon: 'STAGING!ICON',
      },
      { get: mockGetFn }
    );

    const callArgs = updateStub.getCall(0).args[0];
    chai.expect(callArgs.label).to.equal('staging123');
    chai.expect(callArgs.icon).to.equal('stagingicon');
  });

  it('should throw error when environment not found', async () => {
    findByPkStub.resolves(null);

    try {
      await environment_builder.update(
        {
          id_environment: 999,
          label: 'STAGING',
          icon: 'staging-icon',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown DBObjectNotFound error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });

  it('should validate id_environment is positive integer', async () => {
    try {
      await environment_builder.update(
        {
          id_environment: -1,
          label: 'STAGING',
          icon: 'staging-icon',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate label is minimum 2 characters (after preprocessing)', async () => {
    try {
      await environment_builder.update(
        {
          id_environment: 1,
          label: 'A',
          icon: 'staging-icon',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate icon is minimum 2 characters (after preprocessing)', async () => {
    try {
      await environment_builder.update(
        {
          id_environment: 1,
          label: 'STAGING',
          icon: 'A',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors', async () => {
    findByPkStub.rejects(new Error('Database connection failed'));

    try {
      await environment_builder.update(
        {
          id_environment: 1,
          label: 'STAGING',
          icon: 'staging-icon',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('environment.builder.update_interface()', () => {
  let findByPkStub;
  let updateStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findByPkStub = sinon.stub(dbManager.models.ENVIRONMENT, 'findByPk');
    updateStub = sinon.stub(
      dbManager.models.ENVIRONMENT_HAS_INTERFACE,
      'update'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update interface label within environment', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_INTERFACEs: [],
    });
    updateStub.resolves([1]);

    const mockGetFn = sinon.stub().resolves(
      new Environment({
        id_environment: 1,
        label: 'prod',
        icon: 'prod-icon',
        interfaces: [],
      })
    );

    const result = await environment_builder.update_interface(
      { id_environment: 1, id_interface: 1, label: 'API_V2' },
      { get: mockGetFn }
    );

    chai.expect(findByPkStub.calledOnce).to.be.true;
    chai.expect(updateStub.calledOnce).to.be.true;
    chai.expect(mockGetFn.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Environment);
  });

  it('should preprocess label', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_INTERFACEs: [],
    });
    updateStub.resolves([1]);

    const mockGetFn = sinon.stub().resolves(
      new Environment({
        id_environment: 1,
        label: 'prod',
        icon: 'prod-icon',
        interfaces: [],
      })
    );

    await environment_builder.update_interface(
      { id_environment: 1, id_interface: 1, label: 'API@V2!' },
      { get: mockGetFn }
    );

    const callArgs = updateStub.getCall(0).args[0];
    chai.expect(callArgs.label).to.equal('apiv2');
  });

  it('should throw error when environment not found', async () => {
    findByPkStub.resolves(null);

    try {
      await environment_builder.update_interface(
        { id_environment: 999, id_interface: 1, label: 'API_V2' },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown DBObjectNotFound error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });

  it('should validate id_environment is positive integer', async () => {
    try {
      await environment_builder.update_interface(
        { id_environment: -1, id_interface: 1, label: 'API_V2' },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate id_interface is positive integer', async () => {
    try {
      await environment_builder.update_interface(
        { id_environment: 1, id_interface: -1, label: 'API_V2' },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate label is minimum 2 characters (after preprocessing)', async () => {
    try {
      await environment_builder.update_interface(
        { id_environment: 1, id_interface: 1, label: 'A' },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should call get function with data params', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_INTERFACEs: [],
    });
    updateStub.resolves([1]);

    const mockGetFn = sinon.stub().resolves(
      new Environment({
        id_environment: 1,
        label: 'prod',
        icon: 'prod-icon',
        interfaces: [],
      })
    );

    const props = { id_environment: 1, id_interface: 1, label: 'API_V2' };

    await environment_builder.update_interface(props, { get: mockGetFn });

    chai.expect(mockGetFn.calledOnce).to.be.true;
    const callArgs = mockGetFn.getCall(0).args[0];
    chai.expect(callArgs.id_environment).to.equal(1);
    chai.expect(callArgs.id_interface).to.equal(1);
  });
});

describe('environment.builder.del()', () => {
  let destroyStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    destroyStub = sinon.stub(dbManager.models.ENVIRONMENT, 'destroy');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should delete an environment', async () => {
    const mockEnv = new Environment({
      id_environment: 1,
      label: 'prod',
      icon: 'prod-icon',
      interfaces: [],
    });

    const mockGetFn = sinon.stub().resolves(mockEnv);
    destroyStub.resolves(1);

    const result = await environment_builder.del(
      { id_environment: 1 },
      { get: mockGetFn }
    );

    chai.expect(mockGetFn.calledOnce).to.be.true;
    chai.expect(destroyStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Environment);
    chai.expect(result.id_environment).to.equal(1);
  });

  it('should throw error when environment not found', async () => {
    const mockGetFn = sinon
      .stub()
      .rejects(new DBObjectNotFound('Environment not found'));

    try {
      await environment_builder.del(
        { id_environment: 999 },
        { get: mockGetFn }
      );
      chai.expect.fail('Should have thrown DBObjectNotFound error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });

  it('should validate id_environment is positive integer', async () => {
    try {
      await environment_builder.del(
        { id_environment: -1 },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors', async () => {
    const mockGetFn = sinon.stub().resolves(
      new Environment({
        id_environment: 1,
        label: 'prod',
        icon: 'prod-icon',
        interfaces: [],
      })
    );
    destroyStub.rejects(new Error('Database connection failed'));

    try {
      await environment_builder.del({ id_environment: 1 }, { get: mockGetFn });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should return the deleted environment object', async () => {
    const mockEnv = new Environment({
      id_environment: 2,
      label: 'staging',
      icon: 'staging-icon',
      interfaces: [
        new Interface({
          id_interface: 1,
          label: 'api',
          command: 'node api.js',
        }),
      ],
    });

    const mockGetFn = sinon.stub().resolves(mockEnv);
    destroyStub.resolves(1);

    const result = await environment_builder.del(
      { id_environment: 2 },
      { get: mockGetFn }
    );

    chai.expect(result.id_environment).to.equal(2);
    chai.expect(result.label).to.equal('staging');
    chai.expect(result.icon).to.equal('staging-icon');
    chai.expect(result.interfaces).to.have.lengthOf(1);
  });

  it('should call get function before destroy', async () => {
    const mockEnv = new Environment({
      id_environment: 1,
      label: 'prod',
      icon: 'prod-icon',
      interfaces: [],
    });

    const mockGetFn = sinon.stub().resolves(mockEnv);
    destroyStub.resolves(1);

    await environment_builder.del({ id_environment: 1 }, { get: mockGetFn });

    chai.expect(mockGetFn.calledBefore(destroyStub)).to.be.true;
  });
});
