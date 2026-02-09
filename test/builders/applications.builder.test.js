import * as application_builder from '../../src/builders/applications.builder.js';
import * as chai from 'chai';
import db from '../../src/config/db.config.js';
import * as sinon from 'sinon';
import moment from 'moment-timezone';
import Sequelize, { Op } from 'sequelize';
import sinonChai from 'sinon-chai';
import {
  DBObjectNotFound,
  DBConnexionRefused,
  MissingArgumentError,
  ParameterMisformed,
  DBForeignKeyConstraintError,
} from '../../src/utils/errors.service.js';
import CONFIG from '../../src/config/config.js';
import { Environment } from '../../src/objects/Environment.js';
import { Application } from '../../src/objects/Application.js';
chai.use(sinonChai);

describe('applications.builder.get()', () => {
  let fakeFindOne;
  beforeEach(() => {
    fakeFindOne = sinon.stub(db.cirrus.APPLICATION, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good id_application and should returns hash.', async () => {
    fakeFindOne.resolves({
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
        label: 'Prête',
      },
      state_changed_date: new Date('2025-01-10T15:49:06.000Z'),
      programming_shutdown_date: new Date('2025-01-11T15:49:06.000Z'),
    });
    const result = await application_builder.get({ id_application: 1 });
    chai.expect(fakeFindOne.calledOnce).to.be.true;
    chai.expect(
      fakeFindOne.calledWith({
        where: { id_application: 1 },
        include: [
          {
            model: db.cirrus.ENUM_STATE_APPLICATION,
            required: true,
          },
          {
            model: db.cirrus.ENVIRONMENT,
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
    fakeFindOne.resolves({
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
        label: 'Prête',
      },
      state_changed_date: new Date('2025-01-10T15:49:06.000Z'),
      programming_shutdown_date: new Date('2025-01-11T15:49:06.000Z'),
    });
    const result = await application_builder.get({ key: 'colibri-dore-man' });
    chai.expect(fakeFindOne.calledOnce).to.be.true;
    chai.expect(
      fakeFindOne.calledWith({
        where: { generated_label: 'colibri-dore-man' },
        include: [
          {
            model: db.cirrus.ENUM_STATE_APPLICATION,
            required: true,
          },
          {
            model: db.cirrus.ENVIRONMENT,
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
    fakeFindOne.resolves({
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
        label: 'Prête',
      },
      state_changed_date: new Date('2025-01-10T15:49:06.000Z'),
      programming_shutdown_date: new Date('2025-01-11T15:49:06.000Z'),
    });
    const result = await application_builder.get({
      key: 'colibri-dore-man',
      id_application: 1,
    });
    chai.expect(fakeFindOne.calledOnce).to.be.true;
    chai.expect(
      fakeFindOne.calledWith({
        where: { generated_label: 'colibri-dore-man', id_application: 1 },
        include: [
          {
            model: db.cirrus.ENUM_STATE_APPLICATION,
            required: true,
          },
          {
            model: db.cirrus.ENVIRONMENT,
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
      fakeFindOne.resolves(null);
      await application_builder.get({ id_application: 100 });

      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne.calledOnce).to.be.true;
      chai.expect(
        fakeFindOne.calledWith({
          where: { id_application: 100 },
          include: [
            {
              model: db.cirrus.ENUM_STATE_APPLICATION,
              required: true,
            },
            {
              model: db.cirrus.ENVIRONMENT,
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
      chai.expect(fakeFindOne).to.have.not.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal(
          'One or multiple arguments (id_application,key,hash) are missing.'
        );
    }
  });
  it('called with misformed argument and should reject with an error.', async () => {
    try {
      await application_builder.get({ id_application: 'test' });

      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.have.not.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_application parameter is misformed.');
    }
  });
  it('called with good hash and should return application data.', async () => {
    fakeFindOne.resolves({
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
    chai.expect(fakeFindOne.calledOnce).to.be.true;
    chai.expect(
      fakeFindOne.calledWith({
        where: { hash: 'e3ea6f' },
        include: [
          {
            model: db.cirrus.ENUM_STATE_APPLICATION,
            required: true,
          },
          {
            model: db.cirrus.ENVIRONMENT,
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
      chai.expect(fakeFindOne).to.have.not.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.hash parameter is misformed.');
    }
  });
});
describe('applications.builder.list()', () => {
  let fakeFindAll;
  beforeEach(() => {
    fakeFindAll = sinon.stub(db.cirrus.APPLICATION, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good argument and should returns hash.', async () => {
    fakeFindAll.resolves([
      {
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
          label: 'Prête',
        },
        state_changed_date: new Date('2025-01-10T15:49:06.000Z'),
        programming_shutdown_date: new Date('2025-01-11T15:49:06.000Z'),
      },
    ]);
    const result = await application_builder.list({ id_user: 1 });
    chai.expect(fakeFindAll.calledOnce).to.be.true;
    chai.expect(
      fakeFindAll.calledWith({
        where: { id_user: 1 },
        include: [
          {
            model: db.cirrus.ENUM_STATE_APPLICATION,
            required: true,
          },
          {
            model: db.cirrus.ENVIRONMENT,
            required: true,
          },
        ],
      })
    ).to.be.true;

    chai.expect(result).to.deep.equal([
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
      }),
    ]);
  });
  it('called with missing argument and should reject with an error.', async () => {
    try {
      await application_builder.list({});

      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindAll).to.have.not.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_user) are missing.');
    }
  });
  it('called with misformed argument and should reject with an error.', async () => {
    try {
      await application_builder.list({ id_user: 'test' });

      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindAll).to.have.not.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_user parameter is misformed.');
    }
  });
  it('called with missing argument and should reject with Sequelize.ForeignKeyConstraintError error.', async () => {
    try {
      fakeFindAll.resolves(
        Promise.reject(new Sequelize.ForeignKeyConstraintError())
      );
      await application_builder.list({ id_user: 1 });

      chai.expect.fail(
        'chai.expected to throw DBForeignKeyConstraintError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindAll).to.have.been.calledOnceWith({
        where: { id_user: 1 },
        include: [
          {
            model: db.cirrus.ENUM_STATE_APPLICATION,
            required: true,
          },
          {
            model: db.cirrus.ENVIRONMENT,
            required: true,
          },
        ],
      });
      chai.expect(err).to.be.instanceOf(DBForeignKeyConstraintError);
      chai
        .expect(err.message)
        .to.equal(
          'The foreign key cannot be deleted because it is still in use.'
        );
    }
  });
});
describe('applications.builder.create()', () => {
  let saveConfig, fakeApplicationCreate, fakeEnumStateAppFindOne;
  beforeEach(() => {
    fakeApplicationCreate = sinon.stub(db.cirrus.APPLICATION, 'create');
    fakeEnumStateAppFindOne = sinon.stub(
      db.cirrus.ENUM_STATE_APPLICATION,
      'findOne'
    );
    saveConfig = {
      ms_deployment_activated: CONFIG.ms_deployment_activated,
    };
  });
  afterEach(() => {
    CONFIG.ms_deployment_activated = saveConfig.ms_deployment_activated;
    sinon.restore();
  });
  it('called with the good arguments and ms_deployment_activated on false and should create an application.', async () => {
    CONFIG.ms_deployment_activated = false;
    const props = {
      id_user: 1,
      id_datacenter: 1,
      id_environment: 2,
      custom_label: 'Application de travail super géniale',
      generated_label: 'shrek-fiona-donkey',
      hash: 'hash12',
      username: 'b_lefebvre',
      password: 'shrek-donkey-fiona',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
    };
    fakeEnumStateAppFindOne.resolves(
      Promise.resolve({
        id_enum_state_application: 1,
      })
    );
    fakeApplicationCreate.resolves(
      Promise.resolve({
        id_application: 8,
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        creation_date: moment.tz(CONFIG.APP_TZ),
        hash: 'hash12',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        id_datacenter: 1,
        id_user: 1,
        id_environment: 2,
        state_application: 'Ready',
        state_changed_date: moment.tz(CONFIG.APP_TZ),
        programming_shutdown_date: moment.tz(CONFIG.APP_TZ),
      })
    );
    const result = await application_builder.create(props);
    const expected_app = new Application({
      id_application: 8,
      custom_label: 'Application de travail super géniale',
      generated_label: 'shrek-fiona-donkey',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'hash12',
      username: 'b_lefebvre',
      password: 'shrek-donkey-fiona',
      id_user: 1,
      id_environment: 2,
      state_application: 'Ready',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      programming_shutdown_date: moment.tz(CONFIG.APP_TZ),
      environment: new Environment({
        id_environnement: 2,
        label: '',
        icon: '',
        interfaces: [],
      }),
    });
    chai.expect(fakeEnumStateAppFindOne).to.have.been.calledOnceWithExactly({
      where: { label: 'Ready' },
    });
    chai.expect(result.id_application).to.be.equal(expected_app.id_application);
    chai.expect(result.custom_label).to.be.equal(expected_app.custom_label);
    chai
      .expect(result.generated_label)
      .to.be.equal(expected_app.generated_label);
    chai.expect(result.hash).to.be.equal(expected_app.hash);
    chai.expect(result.username).to.be.equal(expected_app.username);
    chai.expect(result.password).to.be.equal(expected_app.password);
    chai.expect(result.id_user).to.be.equal(expected_app.id_user);
    chai.expect(result.id_environment).to.be.equal(expected_app.id_environment);
    chai
      .expect(result.state_application)
      .to.be.equal(expected_app.state_application);
    chai.expect(result.environment).to.be.deep.equal(expected_app.environment);
  });
  it('called with the good arguments and ms_deployment_activated on true and should create an application.', async () => {
    CONFIG.ms_deployment_activated = true;
    const props = {
      id_user: 1,
      id_datacenter: 1,
      id_environment: 2,
      custom_label: 'Application de travail super géniale',
      generated_label: 'shrek-fiona-donkey',
      hash: 'hash12',
      username: 'b_lefebvre',
      password: 'shrek-donkey-fiona',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
    };
    fakeEnumStateAppFindOne.resolves(
      Promise.resolve({
        id_enum_state_application: 3,
      })
    );
    fakeApplicationCreate.resolves(
      Promise.resolve({
        id_application: 8,
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        creation_date: moment.tz(CONFIG.APP_TZ),
        hash: 'hash12',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        id_user: 1,
        id_environment: 2,
        state_application: 'Scheduled',
        state_changed_date: moment.tz(CONFIG.APP_TZ),
        programming_shutdown_date: moment.tz(CONFIG.APP_TZ),
      })
    );
    const result = await application_builder.create(props);
    const expected_app = new Application({
      id_application: 8,
      custom_label: 'Application de travail super géniale',
      generated_label: 'shrek-fiona-donkey',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'hash12',
      username: 'b_lefebvre',
      password: 'shrek-donkey-fiona',
      id_user: 1,
      id_environment: 2,
      state_application: 'Scheduled',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      programming_shutdown_date: moment.tz(CONFIG.APP_TZ),
      environment: new Environment({
        id_environnement: 2,
        label: '',
        icon: '',
        interfaces: [],
      }),
    });
    chai.expect(fakeEnumStateAppFindOne).to.have.been.calledOnceWithExactly({
      where: { label: 'Scheduled' },
    });
    chai.expect(result.id_application).to.be.equal(expected_app.id_application);
    chai.expect(result.custom_label).to.be.equal(expected_app.custom_label);
    chai
      .expect(result.generated_label)
      .to.be.equal(expected_app.generated_label);
    chai.expect(result.hash).to.be.equal(expected_app.hash);
    chai.expect(result.username).to.be.equal(expected_app.username);
    chai.expect(result.password).to.be.equal(expected_app.password);
    chai.expect(result.id_user).to.be.equal(expected_app.id_user);
    chai.expect(result.id_environment).to.be.equal(expected_app.id_environment);
    chai
      .expect(result.state_application)
      .to.be.equal(expected_app.state_application);
    chai.expect(result.environment).to.be.deep.equal(expected_app.environment);
  });
  it('called with the good arguments and ms_deployment_activated and schedule date in 11min and should create an application.', async () => {
    CONFIG.ms_deployment_activated = true;
    const scheduled_creation_date = moment.tz(CONFIG.APP_TZ).add(11, 'minutes');
    const props = {
      id_user: 1,
      id_environment: 2,
      id_datacenter: 1,
      custom_label: 'Application de travail super géniale',
      generated_label: 'shrek-fiona-donkey',
      hash: 'hash12',
      username: 'b_lefebvre',
      password: 'shrek-donkey-fiona',
      state_changed_date: scheduled_creation_date.clone(),
    };
    fakeEnumStateAppFindOne.resolves(
      Promise.resolve({
        id_enum_state_application: 5,
      })
    );
    fakeApplicationCreate.resolves(
      Promise.resolve({
        id_application: 8,
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        creation_date: moment.tz(CONFIG.APP_TZ),
        hash: 'hash12',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        id_user: 1,
        id_environment: 2,
        state_application: 'Scheduled',
        state_changed_date: scheduled_creation_date.clone(),
        programming_shutdown_date: null,
      })
    );
    const result = await application_builder.create(props);
    const expected_app = new Application({
      id_application: 8,
      custom_label: 'Application de travail super géniale',
      generated_label: 'shrek-fiona-donkey',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'hash12',
      username: 'b_lefebvre',
      password: 'shrek-donkey-fiona',
      id_user: 1,
      id_environment: 2,
      state_application: 'Scheduled',
      state_changed_date: scheduled_creation_date.clone(),
      programming_shutdown_date: null,
      environment: new Environment({
        id_environnement: 2,
        label: '',
        icon: '',
        interfaces: [],
      }),
    });
    chai.expect(fakeEnumStateAppFindOne).to.have.been.calledOnceWithExactly({
      where: { label: 'Scheduled' },
    });
    chai.expect(result.id_application).to.be.equal(expected_app.id_application);
    chai.expect(result.custom_label).to.be.equal(expected_app.custom_label);
    chai
      .expect(result.generated_label)
      .to.be.equal(expected_app.generated_label);
    chai.expect(result.hash).to.be.equal(expected_app.hash);
    chai.expect(result.username).to.be.equal(expected_app.username);
    chai.expect(result.password).to.be.equal(expected_app.password);
    chai.expect(result.id_user).to.be.equal(expected_app.id_user);
    chai.expect(result.id_environment).to.be.equal(expected_app.id_environment);
    chai
      .expect(result.state_application)
      .to.be.equal(expected_app.state_application);
    chai.expect(result.environment).to.be.deep.equal(expected_app.environment);
    chai.expect(result.programming_shutdown_date).to.be.equal(null);
    chai.expect(result.state_changed_date.isSame(scheduled_creation_date)).to.be
      .true;
  });
  it('called with without args and should reject with a MissingArgument error.', async () => {
    try {
      await application_builder.create({});
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationCreate).to.not.have.been.called;
      chai.expect(fakeEnumStateAppFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal(
          'One or multiple arguments (id_user,id_environment,id_datacenter,custom_label,generated_label,hash,username,password,state_changed_date) are missing.'
        );
    }
  });
  it('called with with a misformed id_environment and should reject with a ParameterMisformed error.', async () => {
    try {
      const props = {
        id_user: 1,
        id_datacenter: 1,
        id_environment: 'misformed',
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        hash: 'hash12',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        state_changed_date: moment.tz(CONFIG.APP_TZ),
      };
      await application_builder.create(props);
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationCreate).to.not.have.been.called;
      chai.expect(fakeEnumStateAppFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_environment parameter is misformed.');
    }
  });
  it('called with with a misformed id_datacenter and should reject with a ParameterMisformed error.', async () => {
    try {
      const props = {
        id_user: 1,
        id_datacenter: 'misformed',
        id_environment: 1,
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        hash: 'hash12',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        state_changed_date: moment.tz(CONFIG.APP_TZ),
      };
      await application_builder.create(props);
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationCreate).to.not.have.been.called;
      chai.expect(fakeEnumStateAppFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_datacenter parameter is misformed.');
    }
  });
  it('called with with a misformed generated_label and should reject with a ParameterMisformed error.', async () => {
    try {
      const props = {
        id_user: 1,
        id_datacenter: 1,
        id_environment: 1,
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona',
        hash: 'hash12',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        state_changed_date: moment.tz(CONFIG.APP_TZ),
      };
      await application_builder.create(props);
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationCreate).to.not.have.been.called;
      chai.expect(fakeEnumStateAppFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.generated_label parameter is misformed.');
    }
  });
  it('called but should get a DBConnexionError.', async () => {
    try {
      CONFIG.ms_deployment_activated = false;
      const props = {
        id_user: 1,
        id_environment: 2,
        id_datacenter: 1,
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        hash: 'hash12',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        state_changed_date: moment.tz(CONFIG.APP_TZ),
      };
      fakeEnumStateAppFindOne.resolves(
        Promise.reject(new Sequelize.ConnectionRefusedError('error'))
      );
      await application_builder.create(props);
      chai.expect.fail(
        'chai.expected to throw DBConnexionRefused, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationCreate).to.not.have.been.called;
      chai.expect(fakeEnumStateAppFindOne).to.have.been.called;
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
      chai.expect(err.message).to.equal('Connexion to the database refused.');
    }
  });
});
describe('applications.builder.is_owner()', () => {
  let fakeFindOne;
  beforeEach(() => {
    fakeFindOne = sinon.stub(db.cirrus.APPLICATION, 'findOne');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with a key and should return with true.', async () => {
    fakeFindOne.resolves(Promise.resolve('found'));
    const result = await application_builder.is_owner({
      id_user: 1,
      key: 'shrek-fiona-donkey',
    });
    chai.expect(result).to.be.true;
    chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
      where: {
        [Op.and]: [{ generated_label: 'shrek-fiona-donkey' }, { id_user: 1 }],
      },
    });
  });
  it('called with a key and should return with false.', async () => {
    fakeFindOne.resolves(Promise.resolve(null));
    const result = await application_builder.is_owner({
      id_user: 1,
      key: 'shrek-fiona-donkey',
    });
    chai.expect(result).to.be.false;
    chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
      where: {
        [Op.and]: [{ generated_label: 'shrek-fiona-donkey' }, { id_user: 1 }],
      },
    });
  });
  it('called with an id_application and should return with true.', async () => {
    fakeFindOne.resolves(Promise.resolve('found'));
    const result = await application_builder.is_owner({
      id_user: 1,
      id_application: 1,
    });
    chai.expect(result).to.be.true;
    chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
      where: {
        [Op.and]: [{ id_application: 1 }, { id_user: 1 }],
      },
    });
  });
  it('called with an id_application and should return with false.', async () => {
    fakeFindOne.resolves(Promise.resolve(null));
    const result = await application_builder.is_owner({
      id_user: 1,
      id_application: 1,
    });
    chai.expect(result).to.be.false;
    chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
      where: {
        [Op.and]: [{ id_application: 1 }, { id_user: 1 }],
      },
    });
  });
  it('called missing id_user and should reject with MissingArgumentError.', async () => {
    try {
      await application_builder.is_owner({
        id_application: 1,
      });
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;

      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_user) are missing.');
    }
  });
  it('called with no key and no id_application and should reject with MissingArgumentError.', async () => {
    try {
      await application_builder.is_owner({
        id_user: 1,
      });
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;

      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('You need to pass either id_application or key.');
    }
  });
  it('called with misformed id_user and should reject with ParameterMisformed.', async () => {
    try {
      await application_builder.is_owner({
        id_user: 'misformed',
        id_application: 1,
      });
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;

      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_user parameter is misformed.');
    }
  });
  it('called with misformed key and should reject with ParameterMisformed.', async () => {
    try {
      await application_builder.is_owner({
        id_user: 1,
        key: 'misformed',
      });
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;

      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.key parameter is misformed.');
    }
  });
  it('called with misformed id_application and should reject with ParameterMisformed.', async () => {
    try {
      await application_builder.is_owner({
        id_user: 1,
        id_application: 'misformed',
      });
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;

      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_application parameter is misformed.');
    }
  });
  it('called with misformed id_application and should reject with ParameterMisformed.', async () => {
    try {
      fakeFindOne.resolves(
        Promise.reject(new Sequelize.ConnectionRefusedError('error'))
      );
      await application_builder.is_owner({
        id_user: 1,
        id_application: 1,
      });
      chai.expect.fail(
        'chai.expected to throw DBConnexionRefused, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.have.been.called;

      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
      chai.expect(err.message).to.equal('Connexion to the database refused.');
    }
  });
});
describe('applications.builder.nameExists()', () => {
  let fakeFindOne;
  beforeEach(() => {
    fakeFindOne = sinon.stub(db.cirrus.APPLICATION, 'findOne');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with existing argument and should return true.', async () => {
    fakeFindOne.resolves(Promise.resolve(true));
    const result = await application_builder.nameExists({
      name: 'shrek-fiona-donkey',
    });
    chai.expect(result).to.be.true;
    chai.expect(fakeFindOne).to.have.been.calledOnceWith({
      where: { generated_label: 'shrek-fiona-donkey' },
    });
  });
  it('called with non-existing argument and should return false.', async () => {
    fakeFindOne.resolves(Promise.resolve(null));
    const result = await application_builder.nameExists({
      name: 'shrek-fiona-donkey',
    });
    chai.expect(result).to.be.false;
    chai.expect(fakeFindOne).to.have.been.calledOnceWith({
      where: { generated_label: 'shrek-fiona-donkey' },
    });
  });
  it('called without name argument and should return MissingArgumentError.', async () => {
    try {
      await application_builder.nameExists({});
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;

      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (name) are missing.');
    }
  });
  it('called with misformed name and should reject with ParameterMisformed.', async () => {
    try {
      await application_builder.nameExists({
        name: 'misformed',
      });
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;

      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.name parameter is misformed.');
    }
  });
  it('called with misformed name and should reject with DBForeignKeyConstraintError.', async () => {
    try {
      fakeFindOne.resolves(
        Promise.reject(new Sequelize.ForeignKeyConstraintError())
      );
      await application_builder.nameExists({
        name: 'shrek-fiona-donkey',
      });
      chai.expect.fail(
        'chai.expected to throw DBForeignKeyConstraintError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.have.been.calledOnceWith({
        where: {
          generated_label: 'shrek-fiona-donkey',
        },
      });

      chai.expect(err).to.be.instanceOf(DBForeignKeyConstraintError);
      chai
        .expect(err.message)
        .to.equal(
          'The foreign key cannot be deleted because it is still in use.'
        );
    }
  });
});
describe('applications.builder.hashExists()', () => {
  let fakeFindOne;
  beforeEach(() => {
    fakeFindOne = sinon.stub(db.cirrus.APPLICATION, 'findOne');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with existing argument and should return true.', async () => {
    fakeFindOne.resolves(Promise.resolve(true));
    const result = await application_builder.hashExists({ hash: 'hash12' });
    chai.expect(result).to.be.true;
    chai
      .expect(fakeFindOne)
      .to.have.been.calledOnceWith({ where: { hash: 'hash12' } });
  });
  it('called with non-existing argument and should return false.', async () => {
    fakeFindOne.resolves(Promise.resolve(null));
    const result = await application_builder.hashExists({ hash: 'hash12' });
    chai.expect(result).to.be.false;
    chai.expect(fakeFindOne).to.have.been.calledOnceWith({
      where: { hash: 'hash12' },
    });
  });
  it('called without name argument and should return MissingArgumentError.', async () => {
    try {
      await application_builder.hashExists({});
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;

      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (hash) are missing.');
    }
  });
  it('called with misformed name and should reject with ParameterMisformed.', async () => {
    try {
      await application_builder.hashExists({
        hash: 'misformed',
      });
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;

      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.hash parameter is misformed.');
    }
  });
  it('called with misformed name and should reject with ParameterMisformed.', async () => {
    try {
      fakeFindOne.resolves(
        Promise.reject(new Sequelize.ForeignKeyConstraintError())
      );
      await application_builder.hashExists({
        hash: 'hash12',
      });
      chai.expect.fail(
        'chai.expected to throw DBForeignKeyConstraintError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
        where: { hash: 'hash12' },
      });

      chai.expect(err).to.be.instanceOf(DBForeignKeyConstraintError);
      chai
        .expect(err.message)
        .to.equal(
          'The foreign key cannot be deleted because it is still in use.'
        );
    }
  });
});
describe('applications.builder.deletion()', () => {
  let fakeDestroy, fakeGet;
  beforeEach(() => {
    fakeDestroy = sinon.stub(db.cirrus.APPLICATION, 'update');
    fakeGet = sinon
      .stub(db.cirrus.ENUM_STATE_APPLICATION, 'findOne')
      .resolves(Promise.resolve({ id_enum_state_application: 4 }));
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with existing id_application and should delete the application from db.', async () => {
    fakeDestroy.resolves(Promise.resolve(1));
    const result = await application_builder.deletion({
      id_application: 1,
    });
    chai.expect(result).to.be.true;
    chai.expect(fakeDestroy).to.have.been.calledOnceWithExactly(
      {
        id_enum_state_application: 4,
      },
      {
        where: {
          id_application: 1,
        },
      }
    );
  });
  it('called with no-existing id_application and should return false.', async () => {
    fakeDestroy.resolves(Promise.resolve(0));
    const result = await application_builder.deletion({
      id_application: 1,
    });
    chai.expect(result).to.be.false;
    chai.expect(fakeDestroy).to.have.been.calledOnceWithExactly(
      {
        id_enum_state_application: 4,
      },
      {
        where: {
          id_application: 1,
        },
      }
    );
  });
  it('called without id_application argument and should return MissingArgumentError.', async () => {
    try {
      await application_builder.deletion({});
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeDestroy).to.not.have.been.called;

      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_application) are missing.');
    }
  });
  it('called with misformed name and should reject with ParameterMisformed.', async () => {
    try {
      await application_builder.deletion({
        id_application: 'misformed',
      });
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeDestroy).to.not.have.been.called;

      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_application parameter is misformed.');
    }
  });
  it('called with misformed name and should reject with ParameterMisformed.', async () => {
    try {
      fakeDestroy.resolves(
        Promise.reject(new Sequelize.ForeignKeyConstraintError())
      );
      await application_builder.deletion({
        id_application: 1,
      });
      chai.expect.fail(
        'chai.expected to throw DBForeignKeyConstraintError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeDestroy).to.have.been.calledOnceWith(
        {
          id_enum_state_application: 4,
        },
        {
          where: {
            id_application: 1,
          },
        }
      );

      chai.expect(err).to.be.instanceOf(DBForeignKeyConstraintError);
      chai
        .expect(err.message)
        .to.equal(
          'The foreign key cannot be deleted because it is still in use.'
        );
    }
  });
});
describe('applications.builder.update_state()', () => {
  let fakeFindOne, fakeUpdate, clock, fakeMoment;
  beforeEach(() => {
    fakeFindOne = sinon.stub(db.cirrus.ENUM_STATE_APPLICATION, 'findOne');
    fakeUpdate = sinon.stub(db.cirrus.APPLICATION, 'update');

    const fixedTime = '2025-03-06T12:00:00Z';
    clock = sinon.useFakeTimers(new Date(fixedTime).getTime());
    fakeMoment = sinon
      .stub(moment, 'tz')
      .callsFake(() => moment(fixedTime).tz('Europe/Paris'));
  });
  afterEach(() => {
    sinon.restore();
    clock.restore();
    fakeMoment.restore();
  });
  it('called with good argument to stop application and should update the state of the application.', async () => {
    fakeFindOne.resolves(
      Promise.resolve({
        id_enum_state_application: 2,
      })
    );
    fakeUpdate.resolves(Promise.resolve([1]));
    const result = await application_builder.update_state({
      id_application: 8,
      state_application: 'Off',
    });
    chai.expect(result).to.be.true;
    chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
      where: {
        label: 'Off',
      },
    });
    chai.expect(fakeUpdate).to.have.been.calledOnce;
    chai.expect(fakeUpdate).to.have.been.calledOnceWithExactly(
      {
        id_enum_state_application: 2,
        state_changed_date: moment.tz(CONFIG.APP_TZ).utc().format(),
        programming_shutdown_date: null,
      },
      {
        where: {
          id_application: 8,
        },
      }
    );
  });
  it('called with good argument to start application and should update the state of the application.', async () => {
    fakeFindOne.resolves(
      Promise.resolve({
        id_enum_state_application: 1,
      })
    );
    fakeUpdate.resolves(Promise.resolve([1]));
    const result = await application_builder.update_state({
      id_application: 8,
      state_application: 'Ready',
    });
    chai.expect(result).to.be.true;
    chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
      where: {
        label: 'Ready',
      },
    });
    chai.expect(fakeUpdate).to.have.been.calledOnce;
    chai.expect(fakeUpdate).to.have.been.calledOnceWithExactly(
      {
        id_enum_state_application: 1,
        state_changed_date: moment.tz(CONFIG.APP_TZ).utc().format(),
        programming_shutdown_date: moment
          .tz(CONFIG.APP_TZ)
          .clone()
          .utc()
          .add(CONFIG.expiration, 's')
          .format(),
      },
      {
        where: {
          id_application: 8,
        },
      }
    );
  });
  it('called with with non existing state_application and should reject with a ParameterMisformed error.', async () => {
    try {
      await application_builder.update_state({
        id_application: 8,
        state_application: 'Non existing',
      });
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;
      chai.expect(fakeUpdate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal("The props.state_application must be in ['Off','Ready'].");
    }
  });
  it('called with with misformed id_application and should reject with a ParameterMisformed error.', async () => {
    try {
      await application_builder.update_state({
        id_application: 'misformed',
        state_application: 'Ready',
      });
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;
      chai.expect(fakeUpdate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_application parameter is misformed.');
    }
  });
  it('called with without args and should reject with a MissingArgument error.', async () => {
    try {
      await application_builder.update_state({});
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;
      chai.expect(fakeUpdate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal(
          'One or multiple arguments (id_application,state_application) are missing.'
        );
    }
  });
  it('called with without args and should reject with a DBObjectNotFound error.', async () => {
    try {
      fakeFindOne.resolves(
        Promise.resolve({
          id_enum_state_application: 1,
        })
      );
      fakeUpdate.resolves(Promise.resolve([0]));
      await application_builder.update_state({
        id_application: 8,
        state_application: 'Off',
      });
      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.have.been.called;
      chai.expect(fakeUpdate).to.have.been.called;
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai
        .expect(err.message)
        .to.equal('The application to update does not exist.');
    }
  });
  it('called with without args and should reject with a DBObjectNotFound error.', async () => {
    try {
      fakeUpdate.resolves(
        Promise.reject(new Sequelize.ForeignKeyConstraintError())
      );
      fakeFindOne.resolves(
        Promise.resolve({
          id_enum_state_application: 1,
        })
      );
      await application_builder.update_state({
        id_application: 8,
        state_application: 'Off',
      });
      chai.expect.fail(
        'chai.expected to throw DBForeignKeyConstraintError, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBForeignKeyConstraintError);
      chai
        .expect(err.message)
        .to.equal(
          'The foreign key cannot be deleted because it is still in use.'
        );
    }
  });
});
describe('applications.builder.renew_expiration()', () => {
  let fakeFindOne, fakeUpdate;
  beforeEach(() => {
    fakeFindOne = sinon.stub(db.cirrus.APPLICATION, 'findOne');
    fakeUpdate = sinon.stub(db.cirrus.APPLICATION, 'update');
  });
  afterEach(() => {
    sinon.restore();
  });

  it('called without id_application and should reject MissingArgumentError', async () => {
    try {
      await application_builder.renew_expiration();
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });
  it('called with misformed id_application and should reject ParameterMisformed', async () => {
    try {
      await application_builder.renew_expiration({
        id_application: 'misformed',
      });
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
  it('called but DBConnectionError', async () => {
    try {
      fakeFindOne.resolves(
        Promise.reject(new Sequelize.ConnectionRefusedError())
      );
      await application_builder.renew_expiration({ id_application: 1 });
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
    }
  });
});
