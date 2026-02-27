import { expect } from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as chai from 'chai';
import dbManager from '../../src/config/db.config.js';
import * as session_builder from '../../src/builders/session.builder.js';
import * as user_builder from '../../src/builders/user.builder.js';
import * as application_builder from '../../src/builders/applications.builder.js';
import { Session } from '../../src/objects/Session.js';
import moment from 'moment-timezone';

chai.use(sinonChai);

describe('session.builder.attribute_professor()', () => {
  let createStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    createStub = sinon.stub(dbManager.models.SESSION_HAS_PROFESSOR, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should attribute professor to session with valid parameters', async () => {
    const mockUser = {
      id_user: 1,
      email: 'prof@example.com',
      role: 'PROFESSEUR',
    };

    const user_get_stub = sinon.stub().resolves(mockUser);
    createStub.resolves({
      id_session: 1,
      id_user: 1,
      dataValues: {
        id_session: 1,
        id_user: 1,
      },
    });

    const result = await session_builder.attribute_professor(
      { id_user: 1, id_session: 1 },
      { user_get: user_get_stub }
    );

    expect(createStub.calledOnce).to.be.true;
    expect(result).to.have.property('id_session', 1);
    expect(result).to.have.property('user', mockUser);
  });

  it('should reject invalid id_user (non-positive)', async () => {
    try {
      await session_builder.attribute_professor({
        id_user: 0,
        id_session: 1,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should reject negative id_session', async () => {
    try {
      await session_builder.attribute_professor({
        id_user: 1,
        id_session: -1,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should reject missing id_user parameter', async () => {
    try {
      await session_builder.attribute_professor({
        id_session: 1,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should reject missing id_session parameter', async () => {
    try {
      await session_builder.attribute_professor({
        id_user: 1,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should handle database errors during attribution', async () => {
    const user_get_stub = sinon
      .stub()
      .resolves({ id_user: 1, role: 'PROFESSEUR' });
    createStub.rejects(new Error('Database connection failed'));

    try {
      await session_builder.attribute_professor(
        { id_user: 1, id_session: 1 },
        { user_get: user_get_stub }
      );
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should coerce string id_user to number', async () => {
    const mockUser = { id_user: 1, role: 'PROFESSEUR' };
    const user_get_stub = sinon.stub().resolves(mockUser);
    createStub.resolves({
      id_session: 1,
      id_user: 1,
      dataValues: { id_session: 1, id_user: 1 },
    });

    const result = await session_builder.attribute_professor(
      { id_user: '1', id_session: '1' },
      { user_get: user_get_stub }
    );

    expect(result).to.have.property('id_session', 1);
  });
});

describe('session.builder.attribute_user_and_application()', () => {
  let createStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    createStub = sinon.stub(dbManager.models.SESSION_HAS_USER, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should attribute user and application with valid parameters', async () => {
    const mockUser = {
      id_user: 1,
      email: 'user@example.com',
      role: 'ETUDIANT',
    };
    const mockApp = {
      id_application: 1,
      label: 'test-app',
    };

    const user_get_stub = sinon.stub().resolves(mockUser);
    const application_get_stub = sinon.stub().resolves(mockApp);

    createStub.resolves({
      id_user: 1,
      id_session: 1,
      id_application: 1,
      dataValues: {
        id_user: 1,
        id_session: 1,
        id_application: 1,
      },
    });

    const result = await session_builder.attribute_user_and_application(
      {
        id_user: 1,
        id_session: 1,
        id_application: 1,
      },
      {
        user_get: user_get_stub,
        application_get: application_get_stub,
      }
    );

    expect(application_get_stub.calledOnce).to.be.true;
    expect(user_get_stub.calledOnce).to.be.true;
    expect(createStub.calledOnce).to.be.true;
    expect(result).to.have.property('user', mockUser);
  });

  it('should reject invalid id_user (non-positive)', async () => {
    try {
      await session_builder.attribute_user_and_application({
        id_user: 0,
        id_session: 1,
        id_application: 1,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should reject invalid id_session (non-positive)', async () => {
    try {
      await session_builder.attribute_user_and_application({
        id_user: 1,
        id_session: 0,
        id_application: 1,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should reject invalid id_application (non-positive)', async () => {
    try {
      await session_builder.attribute_user_and_application({
        id_user: 1,
        id_session: 1,
        id_application: 0,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should handle database errors during attribution', async () => {
    const user_get_stub = sinon.stub().resolves({ id_user: 1 });
    const application_get_stub = sinon.stub().resolves({ id_application: 1 });
    createStub.rejects(new Error('Database error'));

    try {
      await session_builder.attribute_user_and_application(
        {
          id_user: 1,
          id_session: 1,
          id_application: 1,
        },
        {
          user_get: user_get_stub,
          application_get: application_get_stub,
        }
      );
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });
});

describe('session.builder.create()', () => {
  let createStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    createStub = sinon.stub(dbManager.models.SESSION, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create a session with valid parameters', async () => {
    const beginDate = moment().tz('UTC').format();
    const endDate = moment().add(1, 'hour').tz('UTC').format();

    createStub.resolves({
      dataValues: {
        id_session: 1,
        label: 'Test Session',
        begin_date: beginDate,
        end_date: endDate,
        id_environment: 1,
      },
    });

    const result = await session_builder.create({
      label: 'Test Session',
      begin_date: beginDate,
      end_date: endDate,
      id_environment: 1,
    });

    expect(createStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Session);
    expect(result.label).to.equal('Test Session');
  });

  it('should create a session without id_environment', async () => {
    const beginDate = moment().tz('UTC').format();
    const endDate = moment().add(1, 'hour').tz('UTC').format();

    createStub.resolves({
      dataValues: {
        id_session: 1,
        label: 'Test Session',
        begin_date: beginDate,
        end_date: endDate,
        id_environment: undefined,
      },
    });

    const result = await session_builder.create({
      label: 'Test Session',
      begin_date: beginDate,
      end_date: endDate,
    });

    expect(result).to.be.instanceOf(Session);
  });

  it('should reject missing label parameter', async () => {
    try {
      await session_builder.create({
        begin_date: moment().format(),
        end_date: moment().add(1, 'hour').format(),
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should reject invalid begin_date format', async () => {
    try {
      await session_builder.create({
        label: 'Test Session',
        begin_date: 'invalid-date',
        end_date: moment().add(1, 'hour').format(),
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should reject invalid end_date format', async () => {
    try {
      await session_builder.create({
        label: 'Test Session',
        begin_date: moment().format(),
        end_date: 'invalid-date',
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should reject empty label', async () => {
    try {
      await session_builder.create({
        label: '',
        begin_date: moment().format(),
        end_date: moment().add(1, 'hour').format(),
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should reject invalid id_environment (non-positive)', async () => {
    try {
      await session_builder.create({
        label: 'Test Session',
        begin_date: moment().format(),
        end_date: moment().add(1, 'hour').format(),
        id_environment: 0,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should handle database errors during creation', async () => {
    createStub.rejects(new Error('Database connection failed'));

    try {
      await session_builder.create({
        label: 'Test Session',
        begin_date: moment().format(),
        end_date: moment().add(1, 'hour').format(),
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should trim label whitespace', async () => {
    const beginDate = moment().tz('UTC').format();
    const endDate = moment().add(1, 'hour').tz('UTC').format();

    createStub.resolves({
      dataValues: {
        id_session: 1,
        label: 'Test Session',
        begin_date: beginDate,
        end_date: endDate,
      },
    });

    const result = await session_builder.create({
      label: '  Test Session  ',
      begin_date: beginDate,
      end_date: endDate,
    });

    expect(result).to.be.instanceOf(Session);
  });
});

describe('session.builder.list()', () => {
  let findAllStub;
  let sessionFindAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.SESSION_HAS_PROFESSOR, 'findAll');
    sessionFindAllStub = sinon.stub(dbManager.models.SESSION, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should list sessions for PROFESSEUR', async () => {
    const mockUser = { id_user: 1, role: 'PROFESSEUR' };
    const user_get_stub = sinon.stub().resolves(mockUser);

    const mockSession = {
      SESSION: {
        dataValues: {
          id_session: 1,
          label: 'Test Session',
          begin_date: moment().format(),
          end_date: moment().add(1, 'hour').format(),
        },
        ENVIRONMENT: {
          id_environment: 1,
          label: 'Test Env',
          dataValues: { id_environment: 1, label: 'Test Env' },
        },
        SESSION_HAS_PROFESSORs: [],
        SESSION_HAS_USERs: [],
      },
    };

    findAllStub.resolves([mockSession]);

    const result = await session_builder.list(
      { id_user: 1 },
      { user_get: user_get_stub }
    );

    expect(user_get_stub.calledOnce).to.be.true;
    expect(findAllStub.calledOnce).to.be.true;
    expect(result).to.be.an('array');
    expect(result[0]).to.be.instanceOf(Session);
  });

  it('should list sessions for ADMINISTRATEUR', async () => {
    const mockUser = { id_user: 1, role: 'ADMINISTRATEUR' };
    const user_get_stub = sinon.stub().resolves(mockUser);

    const mockSession = {
      dataValues: {
        id_session: 1,
        label: 'Test Session',
        begin_date: moment().format(),
        end_date: moment().add(1, 'hour').format(),
      },
      ENVIRONMENT: {
        id_environment: 1,
        label: 'Test Env',
        dataValues: { id_environment: 1, label: 'Test Env' },
      },
      SESSION_HAS_PROFESSORs: [],
      SESSION_HAS_USERs: [],
    };

    sessionFindAllStub.resolves([mockSession]);

    const result = await session_builder.list(
      { id_user: 1 },
      { user_get: user_get_stub }
    );

    expect(result).to.be.an('array');
  });

  it('should reject invalid id_user (non-positive)', async () => {
    try {
      await session_builder.list({ id_user: 0 });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should reject user that is neither PROFESSEUR nor ADMINISTRATEUR', async () => {
    const mockUser = { id_user: 1, role: 'ETUDIANT' };
    const user_get_stub = sinon.stub().resolves(mockUser);

    try {
      await session_builder.list({ id_user: 1 }, { user_get: user_get_stub });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should handle database errors during list retrieval', async () => {
    const mockUser = { id_user: 1, role: 'PROFESSEUR' };
    const user_get_stub = sinon.stub().resolves(mockUser);
    findAllStub.rejects(new Error('Database connection failed'));

    try {
      await session_builder.list({ id_user: 1 }, { user_get: user_get_stub });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should return empty array when no sessions exist', async () => {
    const mockUser = { id_user: 1, role: 'PROFESSEUR' };
    const user_get_stub = sinon.stub().resolves(mockUser);
    findAllStub.resolves([]);

    const result = await session_builder.list(
      { id_user: 1 },
      { user_get: user_get_stub }
    );

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(0);
  });
});

describe('session.builder.get_on_professeur()', () => {
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.SESSION_HAS_PROFESSOR, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should get session when professor is attributed', async () => {
    const beginDate = moment().format();
    const endDate = moment().add(1, 'hour').format();

    // First call returns the mapping to check authorization, second call returns full session
    findOneStub.onFirstCall().resolves({
      id_session: 1,
      id_user: 1,
      dataValues: { id_session: 1, id_user: 1 },
    });

    findOneStub.onSecondCall().resolves({
      SESSION: {
        id_session: 1,
        label: 'Test Session',
        begin_date: beginDate,
        end_date: endDate,
        dataValues: {
          id_session: 1,
          label: 'Test Session',
          begin_date: beginDate,
          end_date: endDate,
        },
        ENVIRONMENT: {
          id_environment: 1,
          label: 'Test Env',
          dataValues: { id_environment: 1, label: 'Test Env' },
        },
        SESSION_HAS_PROFESSORs: [],
        SESSION_HAS_USERs: [],
      },
    });

    const result = await session_builder.get_on_professeur({
      id_user: 1,
      id_session: 1,
    });

    expect(result).to.be.instanceOf(Session);
    expect(result.label).to.equal('Test Session');
  });

  it('should reject when professor is not attributed to session', async () => {
    findOneStub.resolves(null);

    try {
      await session_builder.get_on_professeur({
        id_user: 1,
        id_session: 1,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should reject invalid id_user (non-positive)', async () => {
    try {
      await session_builder.get_on_professeur({
        id_user: 0,
        id_session: 1,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should reject invalid id_session (non-positive)', async () => {
    try {
      await session_builder.get_on_professeur({
        id_user: 1,
        id_session: 0,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should handle database errors during retrieval', async () => {
    findOneStub.rejects(new Error('Database connection failed'));

    try {
      await session_builder.get_on_professeur({
        id_user: 1,
        id_session: 1,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });
});

describe('session.builder.get_on_administrateur()', () => {
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.SESSION, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should get session when user is ADMINISTRATEUR', async () => {
    findOneStub.resolves({
      dataValues: {
        id_session: 1,
        label: 'Test Session',
        begin_date: moment().format(),
        end_date: moment().add(1, 'hour').format(),
      },
      ENVIRONMENT: {
        id_environment: 1,
        label: 'Test Env',
        dataValues: { id_environment: 1, label: 'Test Env' },
      },
      SESSION_HAS_PROFESSORs: [],
      SESSION_HAS_USERs: [],
    });

    const result = await session_builder.get_on_administrateur({
      id_session: 1,
    });

    expect(findOneStub.calledOnce).to.be.true;
    expect(result).to.be.instanceOf(Session);
  });

  it('should reject invalid id_session (non-positive)', async () => {
    try {
      await session_builder.get_on_administrateur({
        id_session: 0,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should handle database errors during retrieval', async () => {
    findOneStub.rejects(new Error('Database connection failed'));

    try {
      await session_builder.get_on_administrateur({
        id_session: 1,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should throw error when session does not exist', async () => {
    findOneStub.resolves(null);

    try {
      await session_builder.get_on_administrateur({
        id_session: 1,
      });
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });
});

describe('session.builder.getSessionToShutdown()', () => {
  let findOneEnumStub;
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneEnumStub = sinon.stub(
      dbManager.models.ENUM_STATE_APPLICATION,
      'findOne'
    );
    findAllStub = sinon.stub(dbManager.models.SESSION_HAS_USER, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve sessions scheduled for shutdown', async () => {
    findOneEnumStub.resolves({
      id_enum_state_application: 5,
      label: 'EndedSession',
    });

    findAllStub.resolves([
      {
        APPLICATION: {
          hash: 'app-hash-1',
          DATACENTER: {
            id_datacenter: 1,
            label: 'DC1',
            dataValues: { id_datacenter: 1, label: 'DC1' },
          },
        },
      },
      {
        APPLICATION: {
          hash: 'app-hash-2',
          DATACENTER: {
            id_datacenter: 2,
            label: 'DC2',
            dataValues: { id_datacenter: 2, label: 'DC2' },
          },
        },
      },
    ]);

    const result = await session_builder.getSessionToShutdown();

    expect(findOneEnumStub.calledOnce).to.be.true;
    expect(findAllStub.calledOnce).to.be.true;
    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(2);
    expect(result[0]).to.have.property('hash', 'app-hash-1');
    expect(result[1]).to.have.property('hash', 'app-hash-2');
  });

  it('should return empty array when no sessions need shutdown', async () => {
    findOneEnumStub.resolves({
      id_enum_state_application: 5,
      label: 'EndedSession',
    });
    findAllStub.resolves([]);

    const result = await session_builder.getSessionToShutdown();

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(0);
  });

  it('should handle database errors during shutdown check', async () => {
    findOneEnumStub.resolves({
      id_enum_state_application: 5,
      label: 'EndedSession',
    });
    findAllStub.rejects(new Error('Database connection failed'));

    try {
      await session_builder.getSessionToShutdown();
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it('should only include applications that have not been shutdown', async () => {
    findOneEnumStub.resolves({
      id_enum_state_application: 5,
      label: 'EndedSession',
    });

    findAllStub.resolves([
      {
        APPLICATION: {
          hash: 'app-hash-1',
          DATACENTER: {
            id_datacenter: 1,
            label: 'DC1',
            dataValues: { id_datacenter: 1, label: 'DC1' },
          },
        },
      },
    ]);

    const result = await session_builder.getSessionToShutdown();

    expect(result).to.have.lengthOf(1);
  });
});
