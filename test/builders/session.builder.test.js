import * as session_builder from '../../src/builders/session.builder.js';
import * as chai from 'chai';
import db from '../../src/config/db.config.js';
import * as sinon from 'sinon';
import moment from 'moment-timezone';
import sinonChai from 'sinon-chai';
import { Sequelize } from 'sequelize';
import CONFIG from '../../src/config/config.js';
import { Environment } from '../../src/objects/Environment.js';
import { Session } from '../../src/objects/Session.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
import {
  DBConnexionRefused,
  MissingArgumentError,
  ParameterMisformed,
  ProfessorIsNotAttributed,
  UserIsNeitherProfOrAdmin,
} from '../../src/utils/errors.service.js';
import { User } from '../../src/objects/User.js';
import { Application } from '../../src/objects/Application.js';
chai.use(sinonChai);

describe('session.builder.create()', () => {
  let fakeSessionCreate;
  beforeEach(() => {
    fakeSessionCreate = sinon.stub(db.cirrus.SESSION, 'create');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with the good arguments and should create a new session.', async () => {
    const fakeBeginDate = moment.tz(CONFIG.timezone);
    const fakeEndDate = moment.tz(CONFIG.timezone).add(1, 'hour');
    const props = {
      label: 'test',
      begin_date: fakeBeginDate,
      end_date: fakeEndDate,
      id_environment: 2,
    };
    fakeSessionCreate.resolves(Promise.resolve({ id_session: 5 }));
    const result = await session_builder.create(props);
    chai.expect(result).to.deep.equal(
      new Session({
        id_session: 5,
        label: 'test',
        begin_date: fakeBeginDate,
        end_date: fakeEndDate,
        environment: new Environment(),
        applications: [],
        users: [],
        professors: [],
        datacenter: new Datacenter(),
      })
    );
  });
  it('should manage sequelize error.', async () => {
    try {
      const fakeBeginDate = moment.tz(CONFIG.timezone);
      const fakeEndDate = moment.tz(CONFIG.timezone).add(1, 'hour');
      const props = {
        label: 'test',
        begin_date: fakeBeginDate,
        end_date: fakeEndDate,
        id_environment: 2,
      };
      fakeSessionCreate.resolves(
        Promise.reject(new Sequelize.ConnectionRefusedError())
      );
      await session_builder.create(props);
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
    }
  });
  it('should reject for misformed begin_date.', async () => {
    try {
      const fakeBeginDate = 'oiznef';
      const fakeEndDate = moment.tz(CONFIG.timezone).add(1, 'hour');
      const props = {
        label: 'test',
        begin_date: fakeBeginDate,
        end_date: fakeEndDate,
        id_environment: 2,
      };
      await session_builder.create(props);
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
  it('should reject for misformed id_environment.', async () => {
    try {
      const fakeBeginDate = moment.tz(CONFIG.timezone);
      const fakeEndDate = moment.tz(CONFIG.timezone).add(1, 'hour');
      const props = {
        label: 'test',
        begin_date: fakeBeginDate,
        end_date: fakeEndDate,
        id_environment: 'erv',
      };
      await session_builder.create(props);
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
  it('should reject for misformed id_environment.', async () => {
    try {
      const fakeBeginDate = moment.tz(CONFIG.timezone);
      const fakeEndDate = moment.tz(CONFIG.timezone).add(1, 'hour');
      const props = {
        label: 'test',
        begin_date: fakeBeginDate,
        end_date: fakeEndDate,
      };
      await session_builder.create(props);
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });
});
describe('session.builder.attribute_professor()', () => {
  let fakeUserGet, fakeSessionHasProfessorCreate;
  beforeEach(() => {
    fakeSessionHasProfessorCreate = sinon.stub(
      db.cirrus.SESSION_HAS_PROFESSOR,
      'create'
    );
    fakeUserGet = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with the good arguments and should create a new session_has_user.', async () => {
    const props = {
      id_user: 3,
      id_session: 5,
    };
    fakeSessionHasProfessorCreate.resolves(Promise.resolve({ id_session: 5 }));
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 3,
          firstname: 'test',
          lastname: 'test',
          email: 'test@test.com',
          role: 'ETUDIANT',
        })
      )
    );
    const result = await session_builder.attribute_professor(props, {
      user_get: fakeUserGet,
    });
    chai.expect(result).to.deep.equal({
      id_session: 5,
      user: new User({
        id_user: 3,
        firstname: 'test',
        lastname: 'test',
        mail: 'test@test.com',
        role: 'ETUDIANT',
      }),
    });
  });
  it('called with missingargument.', async () => {
    try {
      const props = {
        id_user: 3,
      };
      await session_builder.attribute_professor(props, {
        user_get: fakeUserGet,
      });
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });
  it('called with misformed id_session.', async () => {
    try {
      const props = {
        id_user: 3,
        id_session: 'oiznef',
      };
      await session_builder.attribute_professor(props, {
        user_get: fakeUserGet,
      });
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
  it('should manage Sequelize error.', async () => {
    try {
      const props = {
        id_user: 3,
        id_session: 5,
      };
      fakeUserGet.resolves(
        Promise.reject(new Sequelize.ConnectionRefusedError())
      );
      await session_builder.attribute_professor(props, {
        user_get: fakeUserGet,
      });
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
    }
  });
});
describe('session.builder.attribute_user_and_application()', () => {
  let fakeUserGet, fakeApplicationGet, fakeSessionHasProfessorCreate;
  beforeEach(() => {
    fakeSessionHasProfessorCreate = sinon.stub(
      db.cirrus.SESSION_HAS_USER,
      'create'
    );
    fakeUserGet = sinon.stub();
    fakeApplicationGet = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with the good arguments and should create a new session_has_user.', async () => {
    const props = {
      id_user: 3,
      id_session: 5,
      id_application: 7,
    };
    fakeSessionHasProfessorCreate.resolves(
      Promise.resolve({ id_session: 5, id_application: 7 })
    );
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 3,
          firstname: 'test',
          lastname: 'test',
          email: 'test@test.com',
          role: 'ETUDIANT',
        })
      )
    );
    fakeApplicationGet.resolves(
      Promise.resolve(new Application({ id_application: 7 }))
    );
    const result = await session_builder.attribute_user_and_application(props, {
      user_get: fakeUserGet,
      application_get: fakeApplicationGet,
    });
    chai.expect(result).to.deep.equal({
      id_application: 7,
      id_session: 5,
      user: new User({
        id_user: 3,
        firstname: 'test',
        lastname: 'test',
        mail: 'test@test.com',
        role: 'ETUDIANT',
      }),
    });
  });
  it('called with missingargument.', async () => {
    try {
      const props = {
        id_user: 3,
        id_session: 5,
      };
      await session_builder.attribute_user_and_application(props, {
        user_get: fakeUserGet,
        application_get: fakeApplicationGet,
      });
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });
  it('called with misformed id_session.', async () => {
    try {
      const props = {
        id_user: 3,
        id_session: 'oiznef',
        id_application: 7,
      };
      await session_builder.attribute_user_and_application(props, {
        user_get: fakeUserGet,
        application_get: fakeApplicationGet,
      });
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
  it('called with misformed id_application.', async () => {
    try {
      const props = {
        id_user: 3,
        id_session: 3,
        id_application: 'oiznef',
      };
      await session_builder.attribute_user_and_application(props, {
        user_get: fakeUserGet,
        application_get: fakeApplicationGet,
      });
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
  it('should manage Sequelize error.', async () => {
    try {
      const props = {
        id_user: 3,
        id_session: 5,
        id_application: 7,
      };
      fakeApplicationGet.resolves(
        Promise.reject(new Sequelize.ConnectionRefusedError())
      );
      await session_builder.attribute_user_and_application(props, {
        user_get: fakeUserGet,
        application_get: fakeApplicationGet,
      });
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
    }
  });
});
describe('session.builder.list()', () => {
  let fakeSessionsFindAll, fakeSessionHasProfessor, fakeUserGet;
  beforeEach(() => {
    fakeSessionsFindAll = sinon.stub(db.cirrus.SESSION, 'findAll');
    fakeSessionHasProfessor = sinon.stub(
      db.cirrus.SESSION_HAS_PROFESSOR,
      'findAll'
    );
    fakeUserGet = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with ADMINISTRATEUR id_user and should sends Sessions back', async () => {
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          role: 'ADMINISTRATEUR',
        })
      )
    );
    fakeSessionsFindAll.resolves(
      Promise.resolve([
        {
          id_session: 1,
          label: 'test',
          begin_date: '2025-12-05 11:11:11',
          id_environment: 3,
          end_date: '2025-12-05 11:12:11',
          ENVIRONMENT: {
            id_environment: 1,
            label: 'env',
            icon: 'aaaaaaaa',
          },
          SESSION_HAS_PROFESSORs: [
            {
              id_user: 1,
            },
          ],
          SESSION_HAS_USERs: [
            {
              id_user: 1,
              id_application: 1,
              id_session: 1,
              APPLICATION: {
                id_application: 1,
                custom_label: 'TP noté 1',
                generated_label: 'rapunzel-petit-mechant',
                creation_date: '2025-09-16T14:26:38+02:00',
                hash: '5c4dc8',
                username: 'd_urbanski',
                password: 'paul-abandonnee-geants',
                id_user: 4,
                id_environment: 2,
                state_application: null,
                state_changed_date: '2025-09-11T17:00:00+02:00',
                programming_shutdown_date: '2025-09-12T05:00:00+02:00',
                environment: {
                  id_environment: null,
                  label: '',
                  icon: '',
                  interfaces: [],
                },
                DATACENTER: {
                  id_datacenter: 1,
                  label: 'gra9',
                  provider: 'ovh',
                  city: 'gravelines',
                },
              },
            },
          ],
        },
      ])
    );
    const sessions = await session_builder.list(
      { id_user: 1 },
      { user_get: fakeUserGet }
    );
    chai.expect(fakeSessionHasProfessor).to.not.have.been.called;
    chai.expect(fakeSessionsFindAll).to.have.been.calledOnceWithExactly({
      include: [
        {
          model: db.cirrus.ENVIRONMENT,
          required: true,
        },
        {
          model: db.cirrus.SESSION_HAS_PROFESSOR,
          required: false,
        },
        {
          model: db.cirrus.SESSION_HAS_USER,
          required: false,
          include: [
            {
              model: db.cirrus.APPLICATION,
              required: true,
              include: [
                {
                  model: db.cirrus.DATACENTER,
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });
    chai.expect(sessions[0].toJSON()).to.deep.equal(
      new Session({
        id_session: 1,
        label: 'test',
        begin_date: '2025-12-05 11:11:11',
        id_environment: 3,
        end_date: '2025-12-05 11:12:11',
        environment: new Environment({
          id_environment: 1,
          label: 'env',
          icon: 'aaaaaaaa',
        }),
        users: [
          new User({
            id_user: 1,
          }),
        ],
        professors: [
          new User({
            id_user: 1,
          }),
        ],
        applications: [
          new Application({
            id_application: 1,
            custom_label: 'TP noté 1',
            generated_label: 'rapunzel-petit-mechant',
            creation_date: '2025-09-16T14:26:38+02:00',
            hash: '5c4dc8',
            username: 'd_urbanski',
            password: 'paul-abandonnee-geants',
            id_user: 4,
            id_environment: 2,
            state_application: null,
            state_changed_date: '2025-09-11T17:00:00+02:00',
            programming_shutdown_date: '2025-09-12T05:00:00+02:00',
            environment: new Environment({
              id_environment: 1,
              label: 'env',
              icon: 'aaaaaaaa',
            }),
            datacenter: new Datacenter({
              id_datacenter: 1,
              label: 'gra9',
              provider: 'ovh',
              city: 'gravelines',
            }),
          }),
        ],
        datacenter: new Datacenter({
          id_datacenter: 1,
          label: 'gra9',
          provider: 'ovh',
          city: 'gravelines',
        }),
      }).toJSON()
    );
  });
  it('called with PROFESSEUR id_user and should sends Sessions back', async () => {
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          role: 'PROFESSEUR',
        })
      )
    );
    fakeSessionHasProfessor.resolves(
      Promise.resolve([
        {
          id_session: 1,
          SESSION: {
            label: 'test',
            begin_date: '2025-12-05 11:11:11',
            id_environment: 3,
            end_date: '2025-12-05 11:12:11',
            ENVIRONMENT: {
              id_environment: 1,
              label: 'env',
              icon: 'aaaaaaaa',
            },
            SESSION_HAS_PROFESSORs: [
              {
                id_user: 1,
              },
            ],
            SESSION_HAS_USERs: [
              {
                id_user: 1,
                id_application: 1,
                id_session: 1,
                APPLICATION: {
                  id_application: 1,
                  custom_label: 'TP noté 1',
                  generated_label: 'rapunzel-petit-mechant',
                  creation_date: '2025-09-16T14:26:38+02:00',
                  hash: '5c4dc8',
                  username: 'd_urbanski',
                  password: 'paul-abandonnee-geants',
                  id_user: 4,
                  id_environment: 2,
                  state_application: null,
                  state_changed_date: '2025-09-11T17:00:00+02:00',
                  programming_shutdown_date: '2025-09-12T05:00:00+02:00',
                  environment: {
                    id_environment: null,
                    label: '',
                    icon: '',
                    interfaces: [],
                  },
                  DATACENTER: {
                    id_datacenter: 1,
                    label: 'gra9',
                    provider: 'ovh',
                    city: 'gravelines',
                  },
                },
              },
            ],
          },
        },
      ])
    );
    const sessions = await session_builder.list(
      { id_user: 1 },
      { user_get: fakeUserGet }
    );
    chai.expect(fakeSessionsFindAll).to.not.have.been.called;
    chai.expect(fakeSessionHasProfessor).to.have.been.calledOnceWithExactly({
      where: {
        id_user: 1,
      },
      include: [
        {
          model: db.cirrus.SESSION,
          required: true,
          include: [
            {
              model: db.cirrus.ENVIRONMENT,
              required: true,
            },
            {
              model: db.cirrus.SESSION_HAS_PROFESSOR,
              required: false,
            },
            {
              model: db.cirrus.SESSION_HAS_USER,
              required: false,
              include: [
                {
                  model: db.cirrus.APPLICATION,
                  required: true,
                  include: [
                    {
                      model: db.cirrus.DATACENTER,
                      required: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    chai.expect(sessions[0].toJSON()).to.deep.equal(
      new Session({
        id_session: 1,
        label: 'test',
        begin_date: '2025-12-05 11:11:11',
        id_environment: 3,
        end_date: '2025-12-05 11:12:11',
        environment: new Environment({
          id_environment: 1,
          label: 'env',
          icon: 'aaaaaaaa',
        }),
        users: [
          new User({
            id_user: 1,
          }),
        ],
        professors: [
          new User({
            id_user: 1,
          }),
        ],
        applications: [
          new Application({
            id_application: 1,
            custom_label: 'TP noté 1',
            generated_label: 'rapunzel-petit-mechant',
            creation_date: '2025-09-16T14:26:38+02:00',
            hash: '5c4dc8',
            username: 'd_urbanski',
            password: 'paul-abandonnee-geants',
            id_user: 4,
            id_environment: 2,
            state_application: null,
            state_changed_date: '2025-09-11T17:00:00+02:00',
            programming_shutdown_date: '2025-09-12T05:00:00+02:00',
            environment: new Environment({
              id_environment: 1,
              label: 'env',
              icon: 'aaaaaaaa',
            }),
            datacenter: new Datacenter({
              id_datacenter: 1,
              label: 'gra9',
              provider: 'ovh',
              city: 'gravelines',
            }),
          }),
        ],
        datacenter: new Datacenter({
          id_datacenter: 1,
          label: 'gra9',
          provider: 'ovh',
          city: 'gravelines',
        }),
      }).toJSON()
    );
  });
  it('called with missing id_user and should reject with MissingArgument', async () => {
    try {
      await Promise.resolve(session_builder.list());
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });
  it('called with ETUDIANT and should reject with UserIsNeitherProfOrAdmin', async () => {
    try {
      fakeUserGet.resolves(
        Promise.resolve(
          new User({
            id_user: 1,
            role: 'ETUDIANT',
          })
        )
      );
      await Promise.resolve(
        session_builder.list({ id_user: 1 }, { user_get: fakeUserGet })
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(UserIsNeitherProfOrAdmin);
    }
  });
});
describe('session.builder.get_on_professeur()', async () => {
  let fakeSessionHasProfessorFindOne;
  beforeEach(() => {
    fakeSessionHasProfessorFindOne = sinon.stub(
      db.cirrus.SESSION_HAS_PROFESSOR,
      'findOne'
    );
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called and should send the proper Session.', async () => {
    fakeSessionHasProfessorFindOne.resolves(
      Promise.resolve({
        id_session: 1,
        SESSION: {
          label: 'test',
          begin_date: '2025-10-11 11:11:11',
          id_environment: 3,
          end_date: '2025-10-12 11:11:11',
          ENVIRONMENT: {
            id_environment: 1,
            label: 'env',
          },
          SESSION_HAS_USERs: [
            {
              id_user: 3,
              APPLICATION: {
                id_application: 3,
                DATACENTER: {
                  id_datacenter: 4,
                },
              },
            },
          ],
          SESSION_HAS_PROFESSORs: [
            {
              id_user: 2,
            },
          ],
        },
      })
    );
    const session = await Promise.resolve(
      session_builder.get_on_professeur({
        id_user: 2,
        id_session: 1,
      })
    );
    chai.expect(fakeSessionHasProfessorFindOne).to.have.been.calledWith({
      where: {
        id_user: 2,
        id_session: 1,
      },
    });
    chai.expect(fakeSessionHasProfessorFindOne).to.have.been.calledWith({
      where: {
        id_session: 1,
      },
      include: [
        {
          model: db.cirrus.SESSION,
          required: true,
          include: [
            {
              model: db.cirrus.ENVIRONMENT,
              required: true,
            },
            {
              model: db.cirrus.SESSION_HAS_PROFESSOR,
              required: false,
            },
            {
              model: db.cirrus.SESSION_HAS_USER,
              required: false,
              include: [
                {
                  model: db.cirrus.APPLICATION,
                  required: true,
                  include: [
                    {
                      model: db.cirrus.DATACENTER,
                      required: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    chai.expect(session.toJSON()).to.deep.equal(
      new Session({
        id_session: 1,
        label: 'test',
        begin_date: '2025-10-11 11:11:11',
        id_environment: 3,
        end_date: '2025-10-12 11:11:11',
        environment: new Environment({
          id_environment: 1,
          label: 'env',
        }),
        users: [new User({ id_user: 3 })],
        applications: [
          new Application({
            id_application: 3,
            datacenter: new Datacenter({
              id_datacenter: 4,
            }),
            environment: new Environment({
              id_environment: 1,
              label: 'env',
            }),
          }),
        ],
        professors: [
          new User({
            id_user: 2,
          }),
        ],
        datacenter: new Datacenter({
          id_datacenter: 4,
        }),
      }).toJSON()
    );
  });
  it('called with missing argument and should reject with a MissingArgument error', async () => {
    try {
      await Promise.resolve(session_builder.get_on_professeur({}));
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });
  it('called with misformed id_session and should reject with a ParameterMisformed eroor', async () => {
    try {
      await Promise.resolve(
        session_builder.get_on_professeur({ id_user: 1, id_session: 'erv' })
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
  it('called with non attributed professor and should reject with ProfessorIsNotAttributed', async () => {
    try {
      fakeSessionHasProfessorFindOne.resolves(Promise.resolve(null));
      await Promise.resolve(
        session_builder.get_on_professeur({
          id_user: 1,
          id_session: 2,
        })
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ProfessorIsNotAttributed);
      chai
        .expect(err.message)
        .to.be.equal('The session is not attributed to the current user.');
    }
  });
});
describe('session.builder.get_on_administrateur()', async () => {
  let fakeSessionFindOne;
  beforeEach(() => {
    fakeSessionFindOne = sinon.stub(db.cirrus.SESSION, 'findOne');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called and should return the Session', async () => {
    fakeSessionFindOne.resolves(
      Promise.resolve({
        id_session: 1,
        label: 'test',
        begin_date: moment('2025-10-11 11:11:11').tz(CONFIG.timezone),
        id_environment: 3,
        end_date: moment('2025-10-12 11:11:11').tz(CONFIG.timezone),
        ENVIRONMENT: {
          id_environment: 1,
          label: 'env',
        },
        SESSION_HAS_USERs: [
          {
            id_user: 3,
            APPLICATION: {
              id_application: 3,
              DATACENTER: {
                id_datacenter: 4,
              },
            },
          },
        ],
        SESSION_HAS_PROFESSORs: [
          {
            id_user: 2,
          },
        ],
      })
    );
    const session = await Promise.resolve(
      session_builder.get_on_administrateur({ id_session: 1 })
    );
    chai.expect(fakeSessionFindOne).to.have.been.calledOnceWithExactly({
      where: {
        id_session: 1,
      },
      include: [
        {
          model: db.cirrus.ENVIRONMENT,
          required: true,
        },
        {
          model: db.cirrus.SESSION_HAS_PROFESSOR,
          required: false,
        },
        {
          model: db.cirrus.SESSION_HAS_USER,
          required: false,
          include: [
            {
              model: db.cirrus.APPLICATION,
              required: true,
              include: [
                {
                  model: db.cirrus.DATACENTER,
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });
    chai.expect(session).to.deep.equal(
      new Session({
        id_session: 1,
        label: 'test',
        begin_date: moment('2025-10-11 11:11:11').tz(CONFIG.timezone),
        id_environment: 3,
        end_date: moment('2025-10-11 11:11:11').tz(CONFIG.timezone),
        environment: new Environment({
          id_environment: 1,
          label: 'env',
        }),
        users: [new User({ id_user: 3 })],
        applications: [
          new Application({
            id_application: 3,
            datacenter: new Datacenter({
              id_datacenter: 4,
            }),
            environment: new Environment({
              id_environment: 1,
              label: 'env',
            }),
          }),
        ],
        professors: [
          new User({
            id_user: 2,
          }),
        ],
        datacenter: new Datacenter({
          id_datacenter: 4,
        }),
      })
    );
  });
  it('called with missing argument and should reject with MissingArgument', async () => {
    try {
      await session_builder.get_on_administrateur({});
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });
  it('called with misformed id_session argument and should reject with ParameterMisformed', async () => {
    try {
      await session_builder.get_on_administrateur({ id_session: 'ete' });
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
});
