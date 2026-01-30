import * as session_service from '../../src/services/session.service.js';
import { User } from '../../src/objects/User.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Application } from '../../src/objects/Application.js';
import { Environment } from '../../src/objects/Environment.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
import { Session } from '../../src/objects/Session.js';
import moment from 'moment-timezone';
import {
  MissingArgumentError,
  ParameterMisformed,
  UserIsNeitherProfOrAdmin,
} from '../../src/utils/errors.service.js';

chai.use(sinonChai);

describe('session.service.create()', () => {
  let fakeApplicationCreate,
    fakeSessionCreate,
    fakeSessionAttributeProfessor,
    fakeSessionAttributeUserAndApplication;
  beforeEach(() => {
    fakeApplicationCreate = sinon.stub();
    fakeSessionCreate = sinon.stub();
    fakeSessionAttributeProfessor = sinon.stub();
    fakeSessionAttributeUserAndApplication = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good arg and should return a new Session Object.', async () => {
    const begin_date = moment.tz('Europe/Paris');
    const end_date = moment.tz('Europe/Paris').add(2, 'hour');
    fakeApplicationCreate.resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          creation_date: begin_date,
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: null,
          id_environment: 2,
          state_application: 'Ready',
          state_changed_date: begin_date,
          programming_shutdown_date: end_date,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [],
          }),
        })
      )
    );
    fakeSessionCreate.resolves(
      Promise.resolve({
        id_session: 5,
        label: 'Session de travail',
        begin_date: begin_date,
        end_date: end_date,
        id_environment: 2,
        users: [],
        professors: [],
      })
    );
    fakeSessionAttributeProfessor.resolves(
      Promise.resolve({
        user: new User({
          id_user: 3,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit@lefebvre.fr',
        }),
        id_session: 5,
      })
    );
    fakeSessionAttributeUserAndApplication.resolves(
      Promise.resolve({
        user: new User({
          id_user: 2,
          lastname: 'VETU',
          firstname: 'Paul-Emile',
          mail: 'peheux@vetu.fr',
        }),
        id_session: 5,
        id_application: 8,
      })
    );
    const session = await session_service.create(
      {
        label_session: 'Session de travail',
        label_application: 'Application de travail super géniale',
        begin_date: begin_date,
        end_date: end_date,
        id_environment: 2,
        id_datacenter: 1,
        users: [2],
        professors: [3],
      },
      {
        application_create: fakeApplicationCreate,
        session_create: fakeSessionCreate,
        session_attribute_professor: fakeSessionAttributeProfessor,
        session_attribute_user_and_application:
          fakeSessionAttributeUserAndApplication,
      }
    );

    chai.expect(session).to.deep.equal(
      new Session({
        id_session: 5,
        label: 'Session de travail',
        begin_date: begin_date,
        end_date: end_date,
        environment: new Environment({
          id_environment: 2,
          label: 'Linux Alpine 3.19',
          icon: 'ereteret',
          interfaces: [],
        }),
        applications: [
          new Application({
            id_application: 8,
            custom_label: 'Application de travail super géniale',
            generated_label: 'shrek-fiona-donkey',
            creation_date: begin_date,
            hash: 'hash12',
            username: 'b_lefebvre',
            password: 'shrek-donkey-fiona',
            id_user: null,
            id_environment: 2,
            state_application: 'Ready',
            state_changed_date: begin_date,
            programming_shutdown_date: end_date,
            environment: new Environment({
              id_environment: 2,
              label: 'Linux Alpine 3.19',
              icon: 'ereteret',
              interfaces: [],
            }),
            datacenter: new Datacenter({
              id_datacenter: 1,
              label: 'testdc',
              provider: 'prov',
              city: 'paradise',
            }),
          }),
        ],
        users: [
          new User({
            id_user: 2,
            lastname: 'VETU',
            firstname: 'Paul-Emile',
            mail: 'peheux@vetu.fr',
            role: null,
          }),
        ],
        professors: [
          new User({
            id_user: 3,
            lastname: 'LEFEBVRE',
            firstname: 'Benoit',
            mail: 'benoit@lefebvre.fr',
            role: null,
          }),
        ],
        datacenter: new Datacenter({
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        }),
      })
    );
  });
  it('called with missing argument.', async () => {
    try {
      const begin_date = moment.tz('Europe/Paris');
      const end_date = moment.tz('Europe/Paris').add(2, 'hour');
      await session_service.create(
        {
          label_session: 'Session de travail',
          label_application: 'Application de travail super géniale',
          begin_date: begin_date,
          end_date: end_date,
          id_datacenter: 1,
          users: [2],
          professors: [3],
        },
        {
          application_create: fakeApplicationCreate,
          session_create: fakeSessionCreate,
          session_attribute_professor: fakeSessionAttributeProfessor,
          session_attribute_user_and_application:
            fakeSessionAttributeUserAndApplication,
        }
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });
  it('called with misformed id_argument.', async () => {
    try {
      const begin_date = moment.tz('Europe/Paris');
      const end_date = moment.tz('Europe/Paris').add(2, 'hour');
      await session_service.create(
        {
          label_session: 'Session de travail',
          label_application: 'Application de travail super géniale',
          begin_date: begin_date,
          end_date: end_date,
          id_datacenter: 1,
          id_environment: 'irub',
          users: [2],
          professors: [3],
        },
        {
          application_create: fakeApplicationCreate,
          session_create: fakeSessionCreate,
          session_attribute_professor: fakeSessionAttributeProfessor,
          session_attribute_user_and_application:
            fakeSessionAttributeUserAndApplication,
        }
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
  it('called with misformed id_datacenter.', async () => {
    try {
      const begin_date = moment.tz('Europe/Paris');
      const end_date = moment.tz('Europe/Paris').add(2, 'hour');
      await session_service.create(
        {
          label_session: 'Session de travail',
          label_application: 'Application de travail super géniale',
          begin_date: begin_date,
          end_date: end_date,
          id_datacenter: 'irub',
          id_environment: 3,
          users: [2],
          professors: [3],
        },
        {
          application_create: fakeApplicationCreate,
          session_create: fakeSessionCreate,
          session_attribute_professor: fakeSessionAttributeProfessor,
          session_attribute_user_and_application:
            fakeSessionAttributeUserAndApplication,
        }
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
  it('called with misformed professors.', async () => {
    try {
      const begin_date = moment.tz('Europe/Paris');
      const end_date = moment.tz('Europe/Paris').add(2, 'hour');
      await session_service.create(
        {
          label_session: 'Session de travail',
          label_application: 'Application de travail super géniale',
          begin_date: begin_date,
          end_date: end_date,
          id_datacenter: 2,
          id_environment: 3,
          users: [2],
          professors: 'zegfz',
        },
        {
          application_create: fakeApplicationCreate,
          session_create: fakeSessionCreate,
          session_attribute_professor: fakeSessionAttributeProfessor,
          session_attribute_user_and_application:
            fakeSessionAttributeUserAndApplication,
        }
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
  it('called with misformed label_session.', async () => {
    try {
      const begin_date = moment.tz('Europe/Paris');
      const end_date = moment.tz('Europe/Paris').add(2, 'hour');
      await session_service.create(
        {
          label_session: new Date(),
          label_application: 'Application de travail super géniale',
          begin_date: begin_date,
          end_date: end_date,
          id_datacenter: 2,
          id_environment: 3,
          users: [2],
          professors: [],
        },
        {
          application_create: fakeApplicationCreate,
          session_create: fakeSessionCreate,
          session_attribute_professor: fakeSessionAttributeProfessor,
          session_attribute_user_and_application:
            fakeSessionAttributeUserAndApplication,
        }
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
  it('called with misformed label_application.', async () => {
    try {
      const begin_date = moment.tz('Europe/Paris');
      const end_date = moment.tz('Europe/Paris').add(2, 'hour');
      await session_service.create(
        {
          label_session: 'session',
          label_application: new Date(),
          begin_date: begin_date,
          end_date: end_date,
          id_datacenter: 2,
          id_environment: 3,
          users: [2],
          professors: [],
        },
        {
          application_create: fakeApplicationCreate,
          session_create: fakeSessionCreate,
          session_attribute_professor: fakeSessionAttributeProfessor,
          session_attribute_user_and_application:
            fakeSessionAttributeUserAndApplication,
        }
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
  it('called with misformed begin_date.', async () => {
    try {
      const begin_date = 'zerg';
      const end_date = moment.tz('Europe/Paris').add(2, 'hour');
      await session_service.create(
        {
          label_session: 'session',
          label_application: 'app',
          begin_date: begin_date,
          end_date: end_date,
          id_datacenter: 2,
          id_environment: 3,
          users: [2],
          professors: [],
        },
        {
          application_create: fakeApplicationCreate,
          session_create: fakeSessionCreate,
          session_attribute_professor: fakeSessionAttributeProfessor,
          session_attribute_user_and_application:
            fakeSessionAttributeUserAndApplication,
        }
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
});
describe('session.service.list()', () => {
  let fakeUserGet, fakeSessionList, fakeUserList;
  beforeEach(() => {
    fakeUserGet = sinon.stub();
    fakeSessionList = sinon.stub();
    fakeUserList = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should return a list of sessions', async () => {
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'ADMINISTRATEUR',
        })
      )
    );
    fakeUserList.resolves(
      Promise.resolve([
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'ADMINISTRATEUR',
        }),
      ])
    );
    fakeSessionList.resolves(
      Promise.resolve([
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
        }),
      ])
    );
    const sessions = await Promise.resolve(
      session_service.list(
        { id_user: 1 },
        {
          user_get: fakeUserGet,
          user_list: fakeUserList,
          session_list: fakeSessionList,
        }
      )
    );
    chai.expect(sessions[0].toJSON()).to.be.deep.equal(
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
            lastname: 'LEFEBVRE',
            firstname: 'Benoit',
            mail: 'benoit.lefebvre@getcaelus.cloud',
            role: 'ADMINISTRATEUR',
          }),
        ],
        professors: [
          new User({
            id_user: 1,
            lastname: 'LEFEBVRE',
            firstname: 'Benoit',
            mail: 'benoit.lefebvre@getcaelus.cloud',
            role: 'ADMINISTRATEUR',
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
  it('called with ETUDIANT id_user and should reject with UserIsNeitherProfOrAdmin', async () => {
    try {
      fakeUserGet.resolves(
        Promise.resolve(
          new User({
            id_user: 1,
            lastname: 'LEFEBVRE',
            firstname: 'Benoit',
            mail: 'benoit.lefebvre@getcaelus.cloud',
            role: 'ETUDIANT',
          })
        )
      );
      await Promise.resolve(
        session_service.list(
          { id_user: 1 },
          {
            user_get: fakeUserGet,
            user_list: fakeUserList,
            session_list: fakeSessionList,
          }
        )
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(UserIsNeitherProfOrAdmin);
    }
  });
  it('called with missing id_user and should reject with MissingArgumentError', async () => {
    try {
      await Promise.resolve(
        session_service.list(
          {},
          {
            user_get: fakeUserGet,
            user_list: fakeUserList,
            session_list: fakeSessionList,
          }
        )
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });
});
describe('session.service.get()', () => {
  let fakeUserGet,
    fakeSessionOnProf,
    fakeSessionOnAdmin,
    fakeUserList,
    fakeAppGet;
  beforeEach(() => {
    fakeUserGet = sinon.stub();
    fakeSessionOnProf = sinon.stub();
    fakeSessionOnAdmin = sinon.stub();
    fakeUserList = sinon.stub();
    fakeAppGet = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with correct ADMIN argument and should return the correct Session', async () => {
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          role: 'ADMINISTRATEUR',
        })
      )
    );
    fakeSessionOnAdmin.resolves(
      Promise.resolve(
        new Session({
          id_session: 1,
          label: 'test',
          begin_date: '2025-11-10 11:11:11',
          end_date: '2025-11-12 11:11:11',
          environment: new Environment({
            id_environment: 1,
          }),
          applications: [
            new Application({
              id_application: 1,
            }),
          ],
          users: [new User({ id_user: 3 })],
          professors: [new User({ id_user: 3 })],
          datacenter: new Datacenter({
            id_datacenter: 1,
          }),
        })
      )
    );
    fakeUserList.resolves(
      Promise.resolve([
        new User({
          id_user: 3,
          mail: 'benoit.lefebvre@getcaelus.cloud',
        }),
      ])
    );
    fakeAppGet.resolves(
      Promise.resolve(
        new Application({
          id_application: 1,
          hash: 'xxxxxx',
        })
      )
    );
    const session = await session_service.get(
      {
        id_user: 1,
        id_session: 2,
      },
      {
        user_get: fakeUserGet,
        session_get_on_professeur: fakeSessionOnProf,
        session_get_on_administrateur: fakeSessionOnAdmin,
        user_list: fakeUserList,
        application_get: fakeAppGet,
      }
    );
    chai.expect(fakeSessionOnProf).to.not.have.been.called;
    chai.expect(session.toJSON()).to.deep.equal(
      new Session({
        id_session: 1,
        label: 'test',
        begin_date: '2025-11-10 11:11:11',
        end_date: '2025-11-12 11:11:11',
        environment: new Environment({
          id_environment: 1,
        }),
        applications: [
          new Application({
            id_application: 1,
            hash: 'xxxxxx',
          }),
        ],
        users: [
          new User({ id_user: 3, mail: 'benoit.lefebvre@getcaelus.cloud' }),
        ],
        professors: [
          new User({ id_user: 3, mail: 'benoit.lefebvre@getcaelus.cloud' }),
        ],
        datacenter: new Datacenter({
          id_datacenter: 1,
        }),
      }).toJSON()
    );
  });
  it('called with missing id_user and shoudl reject with MissingArgument', async () => {
    try {
      await session_service.get({
        id_session: 3,
      });
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });
  it('called with misformed id_session and should reject with ParameterMisformed', async () => {
    try {
      await session_service.get({
        id_user: 1,
        id_session: 'erger',
      });
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });
  it('called ETUDIANT role and should reject with UserIsNeitherProfOrAdmin', async () => {
    try {
      fakeUserGet.resolves(
        Promise.resolve(
          new User({
            id_user: 1,
            role: 'ETUDIANT',
          })
        )
      );
      await session_service.get(
        {
          id_user: 1,
          id_session: 2,
        },
        {
          user_get: fakeUserGet,
        }
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(UserIsNeitherProfOrAdmin);
      chai
        .expect(err.message)
        .to.be.eql('The user is neither PROFESSEUR or ADMINISTRATEUR.');
    }
  });
  it('called with correct PROFESSEUR argument and should return the correct Session', async () => {
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          role: 'PROFESSEUR',
        })
      )
    );
    fakeSessionOnProf.resolves(
      Promise.resolve(
        new Session({
          id_session: 1,
          label: 'test',
          begin_date: '2025-11-10 11:11:11',
          end_date: '2025-11-12 11:11:11',
          environment: new Environment({
            id_environment: 1,
          }),
          applications: [
            new Application({
              id_application: 1,
            }),
          ],
          users: [new User({ id_user: 3 })],
          professors: [new User({ id_user: 3 })],
          datacenter: new Datacenter({
            id_datacenter: 1,
          }),
        })
      )
    );
    fakeUserList.resolves(
      Promise.resolve([
        new User({
          id_user: 3,
          mail: 'benoit.lefebvre@getcaelus.cloud',
        }),
      ])
    );
    fakeAppGet.resolves(
      Promise.resolve(
        new Application({
          id_application: 1,
          hash: 'xxxxxx',
        })
      )
    );
    const session = await session_service.get(
      {
        id_user: 1,
        id_session: 2,
      },
      {
        user_get: fakeUserGet,
        session_get_on_professeur: fakeSessionOnProf,
        session_get_on_administrateur: fakeSessionOnAdmin,
        user_list: fakeUserList,
        application_get: fakeAppGet,
      }
    );
    chai.expect(fakeSessionOnAdmin).to.not.have.been.called;
    chai.expect(session.toJSON()).to.deep.equal(
      new Session({
        id_session: 1,
        label: 'test',
        begin_date: '2025-11-10 11:11:11',
        end_date: '2025-11-12 11:11:11',
        environment: new Environment({
          id_environment: 1,
        }),
        applications: [
          new Application({
            id_application: 1,
            hash: 'xxxxxx',
          }),
        ],
        users: [
          new User({ id_user: 3, mail: 'benoit.lefebvre@getcaelus.cloud' }),
        ],
        professors: [
          new User({ id_user: 3, mail: 'benoit.lefebvre@getcaelus.cloud' }),
        ],
        datacenter: new Datacenter({
          id_datacenter: 1,
        }),
      }).toJSON()
    );
  });
});
