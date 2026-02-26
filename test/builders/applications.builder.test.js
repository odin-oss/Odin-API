import * as chai from 'chai';
import * as sinon from 'sinon';
import moment from 'moment-timezone';
import sinonChai from 'sinon-chai';
import dbManager from '../../src/config/db.config.js';
import * as application_builder from '../../src/builders/applications.builder.js';
import { Application } from '../../src/objects/Application.js';
import { Environment } from '../../src/objects/Environment.js';
import CONFIG from '../../src/config/config.js';
import { DBObjectNotFound, MissingArgumentError, ParameterMisformed } from '../../src/utils/errors.util.js';
chai.use(sinonChai);

describe('applications.builder.get()', () => {
  let findOneStub;

  before(async () => {
    await dbManager.initModels(); 
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.APPLICATION, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good id_application and should returns hash.', async () => {
    findOneStub.resolves({
      id_application: 1,
      custom_label: 'Un vrai react',
      generated_label: 'colibri-dore-man',
      creation_date: new Date('2025-01-10T15:49:06.000Z'),
      hash: 'e3ea6f',
      username: 'b_lefebvre',
      password: 'repaire-queen-roi',
      id_user: 1,
      id_environment: 3,
      ENVIRONMENT: {
        id_environment: 1,
        label: 'Linux Alpine',
      },
      ENUM_STATE_APPLICATION: {
        label: 'Ready',
      },
      state_changed_date: new Date('2025-01-10T15:49:06.000Z'),
      programming_shutdown_date: new Date('2025-01-11T15:49:06.000Z'),
    });
    const result = await application_builder.get({ id_application: 1 });
    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(
      findOneStub.calledWith({
        where: { id_application: 1 },
        include: [
          {
            model: dbManager.models.ENUM_STATE_APPLICATION,
            required: true,
          },
          {
            model: dbManager.models.ENVIRONMENT,
            required: true,
          },
        ],
      })
    ).to.be.true;

    chai.expect(result).to.deep.equal(
      new Application({
        id_application: 1,
        custom_label: 'Un vrai react',
        generated_label: 'colibri-dore-man',
        creation_date: moment(new Date('2025-01-10T15:49:06.000Z')).tz(
          CONFIG.APP_TZ
        ),
        hash: 'e3ea6f',
        username: 'b_lefebvre',
        password: 'repaire-queen-roi',
        id_user: 1,
        id_environment: 3,
        state_application: 'Prête',
        state_changed_date: moment(new Date('2025-01-11T15:49:06.000Z')).tz(
          CONFIG.APP_TZ
        ),
        programming_shutdown_date: moment(
          new Date('2025-01-10T15:49:06.000Z')
        ).tz(CONFIG.APP_TZ),
        environment: new Environment({
          id_environment: 1,
          label: 'Linux Alpine',
          icon: 'ereteret',
          interfaces: [],
        }),
      })
    );
  });
  it('called with good key and should returns hash.', async () => {
    findOneStub.resolves({
      id_application: 1,
      custom_label: 'Un vrai react',
      generated_label: 'colibri-dore-man',
      creation_date: new Date('2025-01-10T15:49:06.000Z'),
      hash: 'e3ea6f',
      username: 'b_lefebvre',
      password: 'repaire-queen-roi',
      id_user: 1,
      id_environment: 3,
      ENVIRONMENT: {
        id_environment: 1,
        label: 'Linux Alpine',
      },
      ENUM_STATE_APPLICATION: {
        label: 'Ready',
      },
      state_changed_date: new Date('2025-01-10T15:49:06.000Z'),
      programming_shutdown_date: new Date('2025-01-11T15:49:06.000Z'),
    });
    const result = await application_builder.get({ key: 'colibri-dore-man' });
    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(
      findOneStub.calledWith({
        where: { generated_label: 'colibri-dore-man' },
        include: [
          {
            model: dbManager.models.ENUM_STATE_APPLICATION,
            required: true,
          },
          {
            model: dbManager.models.ENVIRONMENT,
            required: true,
          },
        ],
      })
    ).to.be.true;

    chai.expect(result).to.deep.equal(
      new Application({
        id_application: 1,
        custom_label: 'Un vrai react',
        generated_label: 'colibri-dore-man',
        creation_date: moment(new Date('2025-01-10T15:49:06.000Z')).tz(
          CONFIG.APP_TZ
        ),
        hash: 'e3ea6f',
        username: 'b_lefebvre',
        password: 'repaire-queen-roi',
        id_user: 1,
        id_environment: 3,
        state_application: 'Prête',
        state_changed_date: moment(new Date('2025-01-11T15:49:06.000Z')).tz(
          CONFIG.APP_TZ
        ),
        programming_shutdown_date: moment(
          new Date('2025-01-10T15:49:06.000Z')
        ).tz(CONFIG.APP_TZ),
        environment: new Environment({
          id_environment: 1,
          label: 'Linux Alpine',
          icon: 'ereteret',
          interfaces: [],
        }),
      })
    );
  });
  it('called with both id_application & key and should returns hash.', async () => {
    findOneStub.resolves({
      id_application: 1,
      custom_label: 'Un vrai react',
      generated_label: 'colibri-dore-man',
      creation_date: new Date('2025-01-10T15:49:06.000Z'),
      hash: 'e3ea6f',
      username: 'b_lefebvre',
      password: 'repaire-queen-roi',
      id_user: 1,
      id_environment: 3,
      ENVIRONMENT: {
        id_environment: 1,
        label: 'Linux Alpine',
      },
      ENUM_STATE_APPLICATION: {
        label: 'Ready',
      },
      state_changed_date: new Date('2025-01-10T15:49:06.000Z'),
      programming_shutdown_date: new Date('2025-01-11T15:49:06.000Z'),
    });
    const result = await application_builder.get({
      key: 'colibri-dore-man',
      id_application: 1,
    });
    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(
      findOneStub.calledWith({
        where: { generated_label: 'colibri-dore-man', id_application: 1 },
        include: [
          {
            model: dbManager.models.ENUM_STATE_APPLICATION,
            required: true,
          },
          {
            model: dbManager.models.ENVIRONMENT,
            required: true,
          },
        ],
      })
    ).to.be.true;

    chai.expect(result).to.deep.equal(
      new Application({
        id_application: 1,
        custom_label: 'Un vrai react',
        generated_label: 'colibri-dore-man',
        creation_date: moment(new Date('2025-01-10T15:49:06.000Z')).tz(
          CONFIG.APP_TZ
        ),
        hash: 'e3ea6f',
        username: 'b_lefebvre',
        password: 'repaire-queen-roi',
        id_user: 1,
        id_environment: 3,
        state_application: 'Prête',
        state_changed_date: moment(new Date('2025-01-11T15:49:06.000Z')).tz(
          CONFIG.APP_TZ
        ),
        programming_shutdown_date: moment(
          new Date('2025-01-10T15:49:06.000Z')
        ).tz(CONFIG.APP_TZ),
        environment: new Environment({
          id_environment: 1,
          label: 'Linux Alpine',
          icon: 'ereteret',
          interfaces: [],
        }),
      })
    );
  });
  it('called with inexisting id_application argument and should reject with an error.', async () => {
    try {
      findOneStub.resolves(null);
      await application_builder.get({ id_application: 100 });

      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(findOneStub.calledOnce).to.be.true;
      chai.expect(
        findOneStub.calledWith({
          where: { id_application: 100 },
          include: [
            {
              model: dbManager.models.ENUM_STATE_APPLICATION,
              required: true,
            },
            {
              model: dbManager.models.ENVIRONMENT,
              required: true,
            },
          ],
        })
      ).to.be.true;
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai
        .expect(err.message)
        .to.equal("The element id_application = '100' could not be found.");
    }
  });
  it('called with missing argument and should reject with an error.', async () => {
    try {
      await application_builder.get({});

      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(findOneStub).to.have.not.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal(
          'Either id_application, key, hash must be sent.'
        );
    }
  });
  it('called with misformed argument and should reject with an error.', async () => {
    try {
      await application_builder.get({ id_application: 'test' });

      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(findOneStub).to.have.not.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('Missing arguments: id_application');
    }
  });
  it('called with good hash and should return application data.', async () => {
    findOneStub.resolves({
      id_application: 1,
      custom_label: 'Un vrai react',
      generated_label: 'colibri-dore-man',
      creation_date: new Date('2025-01-10T15:49:06.000Z'),
      hash: 'e3ea6f',
      username: 'b_lefebvre',
      password: 'repaire-queen-roi',
      id_user: 1,
      id_environment: 3,
      id_datacenter: 1,
      ENVIRONMENT: {
        id_environment: 1,
        label: 'Linux Alpine',
      },
      ENUM_STATE_APPLICATION: {
        label: 'Prête',
      },
      state_changed_date: new Date('2025-01-10T15:49:06.000Z'),
      programming_shutdown_date: new Date('2025-01-11T15:49:06.000Z'),
    });
    const result = await application_builder.get({ hash: 'e3ea6f' });
    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(
      findOneStub.calledWith({
        where: { hash: 'e3ea6f' },
        include: [
          {
            model: dbManager.models.ENUM_STATE_APPLICATION,
            required: true,
          },
          {
            model: dbManager.models.ENVIRONMENT,
            required: true,
          },
        ],
      })
    ).to.be.true;

    chai.expect(result).to.deep.equal(
      new Application({
        id_application: 1,
        custom_label: 'Un vrai react',
        generated_label: 'colibri-dore-man',
        creation_date: moment(new Date('2025-01-10T15:49:06.000Z')).tz(
          CONFIG.APP_TZ
        ),
        hash: 'e3ea6f',
        username: 'b_lefebvre',
        password: 'repaire-queen-roi',
        id_user: 1,
        id_environment: 3,
        state_application: 'Prête',
        state_changed_date: moment(new Date('2025-01-11T15:49:06.000Z')).tz(
          CONFIG.APP_TZ
        ),
        programming_shutdown_date: moment(
          new Date('2025-01-10T15:49:06.000Z')
        ).tz(CONFIG.APP_TZ),
        environment: new Environment({
          id_environment: 1,
          label: 'Linux Alpine',
          icon: 'ereteret',
          interfaces: [],
        }),
      })
    );
  });
  it('called with misformed hash and should reject with ParameterMisformed.', async () => {
    try {
      await application_builder.get({ hash: 'invalid' });

      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(findOneStub).to.have.not.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('Too big: expected string to have <=6 characters');
    }
  });
});

describe('applications.builder.list()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.APPLICATION, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called without arguments and should return all applications.', async () => {
    findAllStub.resolves([
      {
        id_application: 1,
        custom_label: 'App 1',
        generated_label: 'app-one',
        creation_date: new Date('2025-01-10T15:49:06.000Z'),
        hash: 'e3ea6f',
        username: 'user1',
        password: 'pass1',
        id_user: 1,
        id_environment: 3,
        id_datacenter: 1,
        ENVIRONMENT: {
          id_environment: 1,
          label: 'Linux Alpine',
        },
        ENUM_STATE_APPLICATION: {
          label: 'Ready',
        },
        state_changed_date: new Date('2025-01-10T15:49:06.000Z'),
        programming_shutdown_date: new Date('2025-01-11T15:49:06.000Z'),
      },
    ]);

    const result = await application_builder.list({});
    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(1);
  });

  it('called with id_user and should return filtered applications.', async () => {
    findAllStub.resolves([
      {
        id_application: 1,
        custom_label: 'App 1',
        generated_label: 'app-one',
        id_user: 5,
        id_datacenter: 1,
        ENVIRONMENT: { id_environment: 1, label: 'Linux Alpine' },
        ENUM_STATE_APPLICATION: { label: 'Ready' },
      },
    ]);

    const result = await application_builder.list({ id_user: 5 });
    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
  });

  it('called with filter array and should return filtered applications.', async () => {
    findAllStub.resolves([]);
    const result = await application_builder.list({
      filter: ['Ready', 'Getting ready'],
    });
    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
  });
});

describe('applications.builder.create()', () => {
  let createStub;
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    createStub = sinon.stub(dbManager.models.APPLICATION, 'create');
    findOneStub = sinon.stub(
      dbManager.models.ENUM_STATE_APPLICATION,
      'findOne'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid parameters and should create application.', async () => {
    findOneStub.resolves({ id_enum_state_application: 1, label: 'Scheduled' });
    createStub.resolves({
      id_application: 1,
      id_environment: 3,
    });

    const result = await application_builder.create({
      id_user: 1,
      id_environment: 3,
      id_datacenter: 1,
      custom_label: 'My App',
      generated_label: 'my-test-app',
      hash: 'abc123',
      username: 'testuser',
      password: 'testpass',
    });

    chai.expect(createStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Application);
    chai.expect(result.id_application).to.equal(1);
  });

  it('called with missing required parameters and should throw error.', async () => {
    try {
      await application_builder.create({
        id_user: 1,
        id_environment: 3,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('applications.builder.is_owner()', () => {
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.APPLICATION, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with id_application and id_user and should return true if owner.', async () => {
    findOneStub.resolves({
      id_application: 1,
      id_user: 5,
    });

    const result = await application_builder.is_owner({
      id_user: 5,
      id_application: 1,
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.true;
  });

  it('called with id_application and id_user and should return false if not owner.', async () => {
    findOneStub.resolves(null);

    const result = await application_builder.is_owner({
      id_user: 5,
      id_application: 1,
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.false;
  });

  it('called with key and id_user and should return true if owner.', async () => {
    findOneStub.resolves({
      generated_label: 'my-app',
      id_user: 5,
    });

    const result = await application_builder.is_owner({
      id_user: 5,
      key: 'my-app',
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.true;
  });
});

describe('applications.builder.nameExists()', () => {
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.APPLICATION, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with existing name and should return true.', async () => {
    findOneStub.resolves({ generated_label: 'existing-app' });

    const result = await application_builder.nameExists({ name: 'existing-app' });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.true;
  });

  it('called with non-existing name and should return false.', async () => {
    findOneStub.resolves(null);

    const result = await application_builder.nameExists({
      name: 'non-existing-app',
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.false;
  });
});

describe('applications.builder.hashExists()', () => {
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.APPLICATION, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with existing hash and should return true.', async () => {
    findOneStub.resolves({ hash: 'abc123' });

    const result = await application_builder.hashExists({ hash: 'abc123' });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.true;
  });

  it('called with non-existing hash and should return false.', async () => {
    findOneStub.resolves(null);

    const result = await application_builder.hashExists({
      hash: 'xyz789',
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.false;
  });
});

describe('applications.builder.renew_expiration()', () => {
  let findOneStub;
  let updateStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.APPLICATION, 'findOne');
    updateStub = sinon.stub(dbManager.models.APPLICATION, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_application and should update expiration date.', async () => {
    findOneStub.resolves({
      id_application: 1,
      programming_shutdown_date: new Date('2025-01-11T15:49:06.000Z'),
    });
    updateStub.resolves([1]);

    const result = await application_builder.renew_expiration({
      id_application: 1,
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(updateStub.calledOnce).to.be.true;
    chai.expect(result).to.equal('The application expiration have been renewed.');
  });

  it('called with non-existing application and should throw error.', async () => {
    findOneStub.resolves(null);

    try {
      await application_builder.renew_expiration({ id_application: 999 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });
});

describe('applications.builder.deletion()', () => {
  let updateStub;
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    updateStub = sinon.stub(dbManager.models.APPLICATION, 'update');
    findOneStub = sinon.stub(
      dbManager.models.ENUM_STATE_APPLICATION,
      'findOne'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_application and should mark as deleted.', async () => {
    findOneStub.resolves({ id_enum_state_application: 5 });
    updateStub.resolves([1]);

    const result = await application_builder.deletion({
      id_application: 1,
    });

    chai.expect(updateStub.calledOnce).to.be.true;
    chai.expect(result).to.be.true;
  });

  it('called with non-existing application and should return false.', async () => {
    findOneStub.resolves({ id_enum_state_application: 5 });
    updateStub.resolves([0]);

    const result = await application_builder.deletion({
      id_application: 999,
    });

    chai.expect(result).to.be.false;
  });
});

describe('applications.builder.download_deletion()', () => {
  let updateStub;
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    updateStub = sinon.stub(dbManager.models.APPLICATION, 'update');
    findOneStub = sinon.stub(
      dbManager.models.ENUM_STATE_APPLICATION,
      'findOne'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_application and should mark as deleted with launch.', async () => {
    findOneStub.resolves({ id_enum_state_application: 6 });
    updateStub.resolves([1]);

    const result = await application_builder.download_deletion({
      id_application: 1,
    });

    chai.expect(updateStub.calledOnce).to.be.true;
    chai.expect(result).to.be.true;
  });

  it('called with non-existing application and should return false.', async () => {
    findOneStub.resolves({ id_enum_state_application: 6 });
    updateStub.resolves([0]);

    const result = await application_builder.download_deletion({
      id_application: 999,
    });

    chai.expect(result).to.be.false;
  });
});

describe('applications.builder.update_state()', () => {
  let updateStub;
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    updateStub = sinon.stub(dbManager.models.APPLICATION, 'update');
    findOneStub = sinon.stub(
      dbManager.models.ENUM_STATE_APPLICATION,
      'findOne'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with id_application and state Ready and should update state.', async () => {
    findOneStub.resolves({ id_enum_state_application: 2 });
    updateStub.resolves([1]);

    const result = await application_builder.update_state({
      id_application: 1,
      state_application: 'Ready',
    });

    chai.expect(updateStub.calledOnce).to.be.true;
    chai.expect(result).to.be.true;
  });

  it('called with hash and state Off and should update state.', async () => {
    findOneStub.resolves({ id_enum_state_application: 1 });
    updateStub.resolves([1]);

    const result = await application_builder.update_state({
      hash: 'abc123',
      state_application: 'Off',
    });

    chai.expect(updateStub.calledOnce).to.be.true;
    chai.expect(result).to.be.true;
  });

  it('called without id_application and hash and should throw error.', async () => {
    try {
      await application_builder.update_state({
        state_application: 'Ready',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });

  it('called with non-existing application and should throw error.', async () => {
    findOneStub.resolves({ id_enum_state_application: 2 });
    updateStub.resolves([0]);

    try {
      await application_builder.update_state({
        id_application: 999,
        state_application: 'Ready',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });
});

describe('applications.builder.getScheduledApplications()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.APPLICATION, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return list of scheduled applications.', async () => {
    findAllStub.resolves([
      {
        id_application: 1,
        custom_label: 'App 1',
        generated_label: 'app-one',
        creation_date: new Date('2025-01-10T15:49:06.000Z'),
        hash: 'e3ea6f',
        username: 'user1',
        password: 'pass1',
        id_user: 1,
        id_environment: 3,
        ENVIRONMENT: {
          id_environment: 1,
          label: 'Linux Alpine',
        },
        ENUM_STATE_APPLICATION: {
          label: 'Scheduled',
        },
        DATACENTER: {
          id_datacenter: 1,
          label: 'DC1',
        },
        state_changed_date: new Date('2025-01-10T15:49:06.000Z'),
        programming_shutdown_date: new Date('2025-01-11T15:49:06.000Z'),
      },
    ]);

    const result = await application_builder.getScheduledApplications();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(1);
    chai.expect(result[0]).to.be.instanceOf(Application);
  });

  it('should return empty array when no scheduled applications.', async () => {
    findAllStub.resolves([]);

    const result = await application_builder.getScheduledApplications();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });
});

describe('applications.builder.getApplicationToShutdown()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.APPLICATION, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return list of applications to shutdown.', async () => {
    findAllStub.resolves([
      {
        id_application: 1,
        custom_label: 'App 1',
        generated_label: 'app-one',
        creation_date: new Date('2025-01-10T15:49:06.000Z'),
        hash: 'e3ea6f',
        username: 'user1',
        password: 'pass1',
        id_user: 1,
        id_environment: 3,
        ENVIRONMENT: {
          id_environment: 1,
          label: 'Linux Alpine',
        },
        ENUM_STATE_APPLICATION: {
          label: 'Ready',
        },
        DATACENTER: {
          id_datacenter: 1,
          label: 'DC1',
        },
        state_changed_date: new Date('2025-01-10T15:49:06.000Z'),
        programming_shutdown_date: new Date('2025-01-11T15:49:06.000Z'),
      },
    ]);

    const result = await application_builder.getApplicationToShutdown();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
  });

  it('should return empty array when no applications to shutdown.', async () => {
    findAllStub.resolves([]);

    const result = await application_builder.getApplicationToShutdown();

    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });
});

describe('applications.builder.getApplicationToDelete()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.APPLICATION, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return list of applications to delete.', async () => {
    findAllStub.resolves([
      {
        id_application: 1,
        custom_label: 'App 1',
        generated_label: 'app-one',
        creation_date: new Date('2025-01-10T15:49:06.000Z'),
        hash: 'e3ea6f',
        username: 'user1',
        password: 'pass1',
        id_user: 1,
        id_environment: 3,
        ENVIRONMENT: {
          id_environment: 1,
          label: 'Linux Alpine',
        },
        ENUM_STATE_APPLICATION: {
          label: 'DeletedDone',
        },
        DATACENTER: {
          id_datacenter: 1,
          label: 'DC1',
        },
        state_changed_date: new Date('2025-01-10T15:49:06.000Z'),
        programming_shutdown_date: new Date('2025-01-11T15:49:06.000Z'),
      },
    ]);

    const result = await application_builder.getApplicationToDelete();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(1);
  });

  it('should return empty array when no applications to delete.', async () => {
    findAllStub.resolves([]);

    const result = await application_builder.getApplicationToDelete();

    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });
});

describe('applications.builder.update_application_export_state()', () => {
  let updateStub;
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    updateStub = sinon.stub(dbManager.models.APPLICATION_EXPORT, 'update');
    findOneStub = sinon.stub(dbManager.models.ENUM_EXPORT_STATE, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid parameters and should update export state.', async () => {
    findOneStub.resolves({ id_enum_export_state: 2 });
    updateStub.resolves([1]);

    const result = await application_builder.update_application_export_state({
      id_export: 1,
      hash: 'abc123',
      state: 'Available',
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(updateStub.calledOnce).to.be.true;
    chai.expect(result).to.be.true;
  });

  it('called with app_deletion flag and should update export state and delete app.', async () => {
    findOneStub.resolves({ id_enum_export_state: 2 });
    updateStub.resolves([1]);

    const mockUpdateState = sinon.stub().resolves(true);
    const result = await application_builder.update_application_export_state(
      {
        id_export: 1,
        hash: 'abc123',
        state: 'Available',
        app_deletion: 'true',
      },
      { update_state: mockUpdateState }
    );

    chai.expect(mockUpdateState.calledOnce).to.be.true;
    chai.expect(result).to.be.true;
  });

  it('called with non-existing export and should throw error.', async () => {
    findOneStub.resolves({ id_enum_export_state: 2 });
    updateStub.resolves([0]);

    try {
      await application_builder.update_application_export_state({
        id_export: 999,
        hash: 'abc123',
        state: 'Available',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });

  it('called with invalid state and should throw error.', async () => {

    try {
      await application_builder.update_application_export_state({
        id_export: 1,
        hash: 'abc123',
        state: 'InvalidState',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      console.log(err)
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
});
