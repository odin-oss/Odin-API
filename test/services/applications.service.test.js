import * as application_service from '../../src/services/applications.service.js';
import {
  DBObjectNotFound,
  MissingArgumentError,
  ParameterMisformed,
  ApplicationInvalidStateError,
} from '../../src/utils/errors.service.js';
import moment from 'moment-timezone';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Application } from '../../src/objects/Application.js';
import CONFIG from '../../src/config/config.js';
import { Environment } from '../../src/objects/Environment.js';
import { User } from '../../src/objects/User.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
import { History, Record } from '../../src/objects/History.js';
chai.use(sinonChai);

describe('applications.service.get()', () => {
  let fakeApplicationGet, fakeEnvironmentGet, fakeDatacenterGet, fakeHistoryGet;
  beforeEach(() => {
    fakeApplicationGet = sinon.stub();
    fakeEnvironmentGet = sinon.stub();
    fakeDatacenterGet = sinon.stub();
    fakeHistoryGet = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with id_application and should return an Application object.', async () => {
    const application = new Application({
      id_application: 8,
      datacenter: new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      }),
      custom_label: 'Application de travail super géniale',
      generated_label: 'shrek-fiona-donkey',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'hash12',
      username: 'b_lefebvre',
      password: 'shrek-donkey-fiona',
      id_user: null,
      id_environment: 2,
      state_application: 'Ready',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      history: new History({
        records: [
          new Record({
            id_application: 1,
            id_user: 1,
            id_history: 2,
            datetime: moment('2025-09-26 11:11:11').tz(CONFIG.APP_TZ),
          }),
        ],
      }),
      programming_shutdown_date: moment
        .tz(CONFIG.APP_TZ)
        .add(CONFIG.expiration, 's'),
      environment: new Environment({
        id_environment: 2,
        label: 'Linux Alpine 3.19',
        icon: 'ereteret',
        interfaces: [],
      }),
    });

    fakeApplicationGet.resolves(Promise.resolve(application));
    fakeEnvironmentGet.resolves(
      Promise.resolve(
        new Environment({
          id_environnement: 1,
          icon: 'ereteret',
          label: 'Alpine',
          interfaces: [
            {
              id_interface: 1,
              label: 'Alpine318',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/linux-alpine-3.18:recette',
              exec_command: '/bin/sh',
              service_command: 'sh /var/launch.sh',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
            {
              id_interface: 46,
              label: 'SSHTerm',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/terminalssh:recette',
              exec_command: '/bin/bash',
              service_command: '',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
          ],
        })
      )
    );
    fakeHistoryGet.resolves(
      Promise.resolve([
        {
          id_user: 1,
          id_application: 1,
          id_history: 2,
          datetime: moment('2025-09-26 11:11:11').tz(CONFIG.APP_TZ),
        },
      ])
    );
    const app = await application_service.get(
      {
        id_application: 8,
        public_format: false,
      },
      {
        application_get: fakeApplicationGet,
        environment_get: fakeEnvironmentGet,
        datacenter_get: fakeDatacenterGet,
        history_get_last_record: fakeHistoryGet,
      }
    );
    application.environment = new Environment({
      id_environnement: 1,
      label: 'Alpine',
      icon: 'ereteret',
      interfaces: [
        {
          id_interface: 1,
          label: 'Alpine318',
          registry_link:
            'registry.gitlab.com/caelus-team/application-cirrus/applications/linux-alpine-3.18:recette',
          exec_command: '/bin/sh',
          service_command: 'sh /var/launch.sh',
          privileged: false,
          readiness_probe_initial_delay: 5,
          liveness_probe_initial_delay: 200,
          readiness_probe_period: 10,
          liveness_probe_period: 20,
          id_type: 1,
          label_type_image: 'linux',
          args: [],
          envs: [],
          node_selectors: [],
          ports: [],
        },
        {
          id_interface: 46,
          label: 'SSHTerm',
          registry_link:
            'registry.gitlab.com/caelus-team/application-cirrus/applications/terminalssh:recette',
          exec_command: '/bin/bash',
          service_command: '',
          privileged: false,
          readiness_probe_initial_delay: 5,
          liveness_probe_initial_delay: 200,
          readiness_probe_period: 10,
          liveness_probe_period: 20,
          id_type: 1,
          label_type_image: 'linux',
          args: [],
          envs: [],
          node_selectors: [],
          ports: [],
        },
      ],
    });
    chai.expect(app).to.deep.equal(application);
  });
  it('called with key and should return an Application object.', async () => {
    const application = new Application({
      id_application: 8,
      history: new History(),
      datacenter: new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        city: 'paradise',
        provider: 'prov',
      }),
      custom_label: 'Application de travail super géniale',
      generated_label: 'shrek-fiona-donkey',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'hash12',
      username: 'b_lefebvre',
      password: 'shrek-donkey-fiona',
      id_user: null,
      id_environment: 2,
      state_application: 'Ready',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      programming_shutdown_date: moment
        .tz(CONFIG.APP_TZ)
        .add(CONFIG.expiration, 's'),
      environment: new Environment({
        id_environment: 2,
        label: 'Linux Alpine 3.19',
        icon: 'ereteret',
        interfaces: [],
      }),
    });
    fakeApplicationGet.resolves(Promise.resolve(application));
    fakeHistoryGet.resolves(Promise.resolve(new History()));
    fakeEnvironmentGet.resolves(
      Promise.resolve(
        new Environment({
          id_environnement: 1,
          label: 'Alpine',
          icon: 'ereteret',
          interfaces: [
            {
              id_interface: 1,
              label: 'Alpine318',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/linux-alpine-3.18:recette',
              exec_command: '/bin/sh',
              service_command: 'sh /var/launch.sh',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
            {
              id_interface: 46,
              label: 'SSHTerm',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/terminalssh:recette',
              exec_command: '/bin/bash',
              service_command: '',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
          ],
        })
      )
    );
    const app = await application_service.get(
      {
        key: 'shrek-fiona-donkey',
      },
      {
        application_get: fakeApplicationGet,
        environment_get: fakeEnvironmentGet,
        datacenter_get: fakeDatacenterGet,
        history_get_last_record: fakeHistoryGet,
      }
    );
    application.environment = new Environment({
      id_environnement: 1,
      label: 'Alpine',
      icon: 'ereteret',
      interfaces: [
        {
          id_interface: 1,
          label: 'Alpine318',
          registry_link:
            'registry.gitlab.com/caelus-team/application-cirrus/applications/linux-alpine-3.18:recette',
          exec_command: '/bin/sh',
          service_command: 'sh /var/launch.sh',
          privileged: false,
          readiness_probe_initial_delay: 5,
          liveness_probe_initial_delay: 200,
          readiness_probe_period: 10,
          liveness_probe_period: 20,
          id_type: 1,
          label_type_image: 'linux',
          args: [],
          envs: [],
          node_selectors: [],
          ports: [],
        },
        {
          id_interface: 46,
          label: 'SSHTerm',
          registry_link:
            'registry.gitlab.com/caelus-team/application-cirrus/applications/terminalssh:recette',
          exec_command: '/bin/bash',
          service_command: '',
          privileged: false,
          readiness_probe_initial_delay: 5,
          liveness_probe_initial_delay: 200,
          readiness_probe_period: 10,
          liveness_probe_period: 20,
          id_type: 1,
          label_type_image: 'linux',
          args: [],
          envs: [],
          node_selectors: [],
          ports: [],
        },
      ],
    });
    chai.expect(app).to.deep.equal(application);
  });
  it('should reject with MissingArgument error.', async () => {
    try {
      await application_service.get(
        {},
        {
          application_get: fakeApplicationGet,
        }
      );
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal(
          'One or multiple arguments (id_application,key) are missing.'
        );
    }
  });
  it('should reject with ParameterMisformed error.', async () => {
    try {
      await application_service.get(
        {
          id_application: 'benoit.lefebvre',
        },
        {
          application_get: fakeApplicationGet,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_application parameter is misformed.');
    }
  });
  it('called with inexisting user id and shoud reject with DBObjectNotFound.', async () => {
    try {
      fakeApplicationGet.resolves(
        Promise.reject(
          new DBObjectNotFound('The application could not be found.')
        )
      );
      await application_service.get(
        {
          id_application: 1,
        },
        {
          application_get: fakeApplicationGet,
        }
      );
      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationGet).to.have.been.calledOnceWithExactly({
        id_application: 1,
      });
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The application could not be found.');
    }
  });
});
describe('applications.service.list()', () => {
  let fakeApplicationList,
    fakeEnvironmentGet,
    fakeDatacenterList,
    fakeHistoryGet;
  beforeEach(() => {
    fakeApplicationList = sinon.stub();
    fakeEnvironmentGet = sinon.stub();
    fakeDatacenterList = sinon.stub();
    fakeHistoryGet = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called and should return a list Application object.', async () => {
    fakeApplicationList.resolves(
      Promise.resolve([
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
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 2,
          state_application: 'Ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: moment
            .tz(CONFIG.APP_TZ)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            id_environment: 2,
            icon: 'ereteret',
            label: 'Linux Alpine 3.19',
            interfaces: [],
          }),
        }),
        new Application({
          id_application: 9,
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          custom_label: 'Application de travail',
          generated_label: 'shrek-donkey-fiona',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash13',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 2,
          state_application: 'Ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: moment
            .tz(CONFIG.APP_TZ)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            id_environment: 2,
            icon: 'ereteret',
            label: 'Linux Alpine 3.19',
            interfaces: [],
          }),
        }),
      ])
    );
    fakeEnvironmentGet.resolves(
      Promise.resolve(
        new Environment({
          id_environnement: 2,
          label: 'Alpine',
          icon: 'ereteret',
          interfaces: [
            {
              id_interface: 1,
              label: 'Alpine318',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/linux-alpine-3.18:recette',
              exec_command: '/bin/sh',
              service_command: 'sh /var/launch.sh',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
            {
              id_interface: 46,
              label: 'SSHTerm',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/terminalssh:recette',
              exec_command: '/bin/bash',
              service_command: '',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
          ],
        })
      )
    );
    fakeDatacenterList.resolves(
      Promise.resolve([
        new Datacenter({
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        }),
      ])
    );
    fakeHistoryGet.resolves(
      Promise.resolve(
        new History({
          records: [
            new Record({
              id_application: 8,
              id_user: 1,
              id_history: 2,
              datetime: moment('2025-09-16 11:11:11').tz(CONFIG.APP_TZ),
            }),
          ],
        })
      )
    );
    const result = await application_service.list(
      {
        id_user: 1,
      },
      {
        application_list: fakeApplicationList,
        environment_get: fakeEnvironmentGet,
        datacenter_list: fakeDatacenterList,
        history_get_last_record: fakeHistoryGet,
      }
    );
    chai.expect(result).to.be.deep.equal([
      new Application({
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
        programming_shutdown_date: moment
          .tz(CONFIG.APP_TZ)
          .add(CONFIG.expiration, 's'),
        history: new History({
          records: [
            new Record({
              id_application: 8,
              id_user: 1,
              id_history: 2,
              datetime: moment('2025-09-16 11:11:11').tz(CONFIG.APP_TZ),
            }),
          ],
        }),
        environment: new Environment({
          id_environnement: 2,
          icon: 'ereteret',
          label: 'Alpine',
          interfaces: [
            {
              id_interface: 1,
              label: 'Alpine318',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/linux-alpine-3.18:recette',
              exec_command: '/bin/sh',
              service_command: 'sh /var/launch.sh',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
            {
              id_interface: 46,
              label: 'SSHTerm',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/terminalssh:recette',
              exec_command: '/bin/bash',
              service_command: '',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
          ],
        }),
      }),
      new Application({
        id_application: 9,
        custom_label: 'Application de travail',
        generated_label: 'shrek-donkey-fiona',
        creation_date: moment.tz(CONFIG.APP_TZ),
        hash: 'hash13',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        id_user: 1,
        id_environment: 2,
        state_application: 'Ready',
        state_changed_date: moment.tz(CONFIG.APP_TZ),
        history: new History(),
        programming_shutdown_date: moment
          .tz(CONFIG.APP_TZ)
          .add(CONFIG.expiration, 's'),
        environment: new Environment({
          id_environnement: 2,
          icon: 'ereteret',
          label: 'Alpine',
          interfaces: [
            {
              id_interface: 1,
              label: 'Alpine318',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/linux-alpine-3.18:recette',
              exec_command: '/bin/sh',
              service_command: 'sh /var/launch.sh',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
            {
              id_interface: 46,
              label: 'SSHTerm',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/terminalssh:recette',
              exec_command: '/bin/bash',
              service_command: '',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
          ],
        }),
      }),
    ]);
    chai.expect(fakeEnvironmentGet).to.have.been.calledOnceWithExactly({
      id_environment: 2,
    });
    chai.expect(fakeApplicationList).to.have.been.calledWith({
      id_user: 1,
    });
  });
  it('should reject with MissingArgument error.', async () => {
    try {
      await application_service.list(
        {},
        {
          application_list: fakeApplicationList,
        }
      );
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationList).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_user) are missing.');
    }
  });
  it('should reject with ParameterMisformed error.', async () => {
    try {
      await application_service.list(
        {
          id_user: 'benoit.lefebvre',
        },
        {
          application_list: fakeApplicationList,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationList).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_user parameter is misformed.');
    }
  });
});
describe('applications.service.update_state()', () => {
  let fakeApplicationGet,
    fakeApplicationUpdate,
    fakeExecStart,
    fakeExecShutDown,
    fakeEnvironmentGet,
    fakeDatacenterGet;
  beforeEach(() => {
    fakeApplicationGet = sinon.stub();
    fakeApplicationUpdate = sinon.stub();
    fakeExecStart = sinon.stub();
    fakeExecShutDown = sinon.stub();
    fakeEnvironmentGet = sinon.stub();
    fakeDatacenterGet = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good args and should start the application.', async () => {
    fakeApplicationGet.onCall(0).resolves(
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
          creation_date: moment('1999-08-23T12:00:00Z').tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 2,
          state_application: 'Off',
          state_changed_date: moment('1999-08-23T12:00:00Z').tz(
            CONFIG.APP_TZ
          ),
          programming_shutdown_date: null,
          environment: new Environment({
            id_environment: 2,
            icon: 'ereteret',
            label: 'Linux Alpine 3.19',
            interfaces: [],
          }),
        })
      )
    );
    fakeEnvironmentGet.resolves(
      Promise.resolve(
        new Environment({
          id_environnement: 2,
          icon: 'ereteret',
          label: 'Alpine',
          interfaces: [
            {
              id_interface: 1,
              label: 'Alpine318',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/linux-alpine-3.18:recette',
              exec_command: '/bin/sh',
              service_command: 'sh /var/launch.sh',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
            {
              id_interface: 46,
              label: 'SSHTerm',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/terminalssh:recette',
              exec_command: '/bin/bash',
              service_command: '',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
          ],
        })
      )
    );
    fakeDatacenterGet.resolves(
      Promise.resolve({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      })
    );
    fakeApplicationUpdate.resolves(Promise.resolve(true));
    fakeApplicationGet.onCall(1).resolves(
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
          creation_date: moment('1999-08-23T12:00:01Z').tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 2,
          state_application: 'Ready',
          state_changed_date: moment('1999-08-23T12:00:01Z').tz(
            CONFIG.APP_TZ
          ),
          programming_shutdown_date: moment('1999-08-23T12:00:01Z')
            .tz(CONFIG.APP_TZ)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            id_environment: 2,
            icon: 'ereteret',
            label: 'Linux Alpine 3.19',
            interfaces: [],
          }),
        })
      )
    );
    const application = await application_service.update_state(
      {
        id_application: 8,
        state_application: 'Ready',
      },
      {
        application_get: fakeApplicationGet,
        application_update: fakeApplicationUpdate,
        exec_start: fakeExecStart,
        exec_shutdown: fakeExecShutDown,
        environment_get: fakeEnvironmentGet,
        datacenter_get: fakeDatacenterGet,
      }
    );
    chai.expect(application).to.deep.equal(
      new Application({
        id_application: 8,
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        creation_date: moment('1999-08-23T12:00:01Z').tz(CONFIG.APP_TZ),
        hash: 'hash12',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        id_user: 1,
        id_environment: 2,
        state_application: 'Ready',
        state_changed_date: moment('1999-08-23T12:00:01Z').tz(CONFIG.APP_TZ),
        programming_shutdown_date: moment('1999-08-23T12:00:01Z')
          .tz(CONFIG.APP_TZ)
          .add(CONFIG.expiration, 's'),
        environment: new Environment({
          id_environnement: 2,
          icon: 'ereteret',
          label: 'Alpine',
          interfaces: [
            {
              id_interface: 1,
              label: 'Alpine318',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/linux-alpine-3.18:recette',
              exec_command: '/bin/sh',
              service_command: 'sh /var/launch.sh',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
            {
              id_interface: 46,
              label: 'SSHTerm',
              registry_link:
                'registry.gitlab.com/caelus-team/application-cirrus/applications/terminalssh:recette',
              exec_command: '/bin/bash',
              service_command: '',
              privileged: false,
              readiness_probe_initial_delay: 5,
              liveness_probe_initial_delay: 200,
              readiness_probe_period: 10,
              liveness_probe_period: 20,
              id_type: 1,
              label_type_image: 'linux',
              args: [],
              envs: [],
              node_selectors: [],
              ports: [],
            },
          ],
        }),
      })
    );
    chai.expect(fakeApplicationGet).to.have.been.calledTwice;
    chai.expect(fakeApplicationUpdate).to.have.been.calledOnceWithExactly({
      id_application: 8,
      state_application: 'Ready',
    });
    chai.expect(fakeEnvironmentGet).to.have.been.calledOnceWithExactly({
      id_environment: 2,
    });
    chai.expect(fakeExecShutDown).to.not.have.been.called;
    chai.expect(fakeExecStart).to.have.been.called;
  });
  it('called with good args and should shut the application down.', async () => {
    fakeApplicationGet.onCall(0).resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          creation_date: moment('1999-08-23T12:00:01Z').tz(CONFIG.APP_TZ),
          hash: 'hash12',
          datacenter: new Datacenter({
            id_datacenter: 1,
          }),
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 2,
          state_application: 'Ready',
          state_changed_date: moment('1999-08-23T12:00:01Z').tz(
            CONFIG.APP_TZ
          ),
          programming_shutdown_date: moment('1999-08-23T12:00:01Z')
            .tz(CONFIG.APP_TZ)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            id_environment: 2,
            icon: 'ereteret',
            label: 'Linux Alpine 3.19',
            interfaces: [],
          }),
        })
      )
    );
    fakeDatacenterGet.resolves(
      Promise.resolve(
        new Datacenter({
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        })
      )
    );
    fakeApplicationUpdate.resolves(Promise.resolve(true));
    fakeApplicationGet.onCall(1).resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          creation_date: moment('1999-08-23T12:00:02Z').tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          datacenter: new Datacenter({
            id_datacenter: 1,
          }),
          id_user: 1,
          id_environment: 2,
          state_application: 'Off',
          state_changed_date: moment('1999-08-23T12:00:02Z').tz(
            CONFIG.APP_TZ
          ),
          programming_shutdown_date: null,
          environment: new Environment({
            id_environment: 2,
            icon: 'ereteret',
            label: 'Linux Alpine 3.19',
            interfaces: [],
          }),
        })
      )
    );
    const application = await application_service.update_state(
      {
        id_application: 8,
        state_application: 'Off',
      },
      {
        application_get: fakeApplicationGet,
        application_update: fakeApplicationUpdate,
        exec_start: fakeExecStart,
        exec_shutdown: fakeExecShutDown,
        datacenter_get: fakeDatacenterGet,
      }
    );
    chai.expect(application).to.deep.equal(
      new Application({
        id_application: 8,
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        creation_date: moment('1999-08-23T12:00:02Z').tz(CONFIG.APP_TZ),
        hash: 'hash12',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        id_user: 1,
        id_environment: 2,
        state_application: 'Off',
        state_changed_date: moment('1999-08-23T12:00:02Z').tz(CONFIG.APP_TZ),
        programming_shutdown_date: null,
        environment: new Environment({
          id_environment: 2,
          icon: 'ereteret',
          label: 'Linux Alpine 3.19',
          interfaces: [],
        }),
      })
    );
    chai.expect(fakeApplicationGet).to.have.been.calledTwice;
    chai.expect(fakeApplicationUpdate).to.have.been.calledOnceWithExactly({
      id_application: 8,
      state_application: 'Off',
    });
    chai.expect(fakeExecStart).to.not.have.been.called;
    chai.expect(fakeExecShutDown).to.have.been.called;
  });
  it('should reject with MissingArgument error.', async () => {
    try {
      await application_service.update_state(
        {},
        {
          application_get: fakeApplicationGet,
          application_update: fakeApplicationUpdate,
          exec_start: fakeExecStart,
          exec_shutdown: fakeExecShutDown,
        }
      );
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeApplicationUpdate).to.not.have.been.called;
      chai.expect(fakeExecStart).to.not.have.been.called;
      chai.expect(fakeExecShutDown).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal(
          'One or multiple arguments (id_application,state_application) are missing.'
        );
    }
  });
  it('should reject with ParameterMisformed error.', async () => {
    try {
      await application_service.update_state(
        {
          id_application: 8,
          state_application: 'No',
        },
        {
          application_get: fakeApplicationGet,
          application_update: fakeApplicationUpdate,
          exec_start: fakeExecStart,
          exec_shutdown: fakeExecShutDown,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeApplicationUpdate).to.not.have.been.called;
      chai.expect(fakeExecStart).to.not.have.been.called;
      chai.expect(fakeExecShutDown).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal("The props.state_application must be in ['Off','Ready'].");
    }
  });
  it('should reject with ParameterMisformed error (id_application).', async () => {
    try {
      await application_service.update_state(
        {
          id_application: 'Misformed',
          state_application: 'Off',
        },
        {
          application_get: fakeApplicationGet,
          application_update: fakeApplicationUpdate,
          exec_start: fakeExecStart,
          exec_shutdown: fakeExecShutDown,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeApplicationUpdate).to.not.have.been.called;
      chai.expect(fakeExecStart).to.not.have.been.called;
      chai.expect(fakeExecShutDown).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_application parameter is misformed.');
    }
  });

  it('should reject with ParameterMisformed error for invalid state_application', async () => {
    try {
      await application_service.update_state(
        {
          id_application: 1,
          state_application: 'InvalidState',
        },
        {
          application_get: fakeApplicationGet,
          application_update: fakeApplicationUpdate,
          exec_start: fakeExecStart,
          exec_shutdown: fakeExecShutDown,
        }
      );
      chai.expect.fail(
        'Expected to throw ParameterMisformed error, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal("The props.state_application must be in ['Off','Ready'].");
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeApplicationUpdate).to.not.have.been.called;
      chai.expect(fakeExecStart).to.not.have.been.called;
      chai.expect(fakeExecShutDown).to.not.have.been.called;
    }
  });

  it('should successfully get application and datacenter when state is valid', async () => {
    const fakeApp = {
      id_application: 1,
      id_environment: 2,
      datacenter: { id_datacenter: 3 },
      hash: 'test-hash',
      state_application: 'Off',
    };
    const fakeDatacenter = {
      id_datacenter: 3,
      label: 'Test Datacenter',
    };

    fakeApplicationGet.resolves(fakeApp);
    fakeDatacenterGet.resolves(fakeDatacenter);
    fakeApplicationUpdate.resolves();
    fakeExecStart.resolves();

    // First call to application_get
    fakeApplicationGet.onFirstCall().resolves(fakeApp);
    // Second call to application_get (after update)
    fakeApplicationGet.onSecondCall().resolves({
      ...fakeApp,
      state_application: 'Ready',
    });

    const result = await application_service.update_state(
      {
        id_application: 1,
        state_application: 'Ready',
      },
      {
        application_get: fakeApplicationGet,
        application_update: fakeApplicationUpdate,
        exec_start: fakeExecStart,
        exec_shutdown: fakeExecShutDown,
        environment_get: fakeEnvironmentGet,
        datacenter_get: fakeDatacenterGet,
      }
    );

    chai.expect(fakeApplicationGet).to.have.been.calledTwice;
    chai.expect(fakeApplicationGet.firstCall).to.have.been.calledWith({
      id_application: 1,
    });
    chai.expect(fakeDatacenterGet).to.have.been.calledOnceWith({
      id_datacenter: 3,
    });
    chai.expect(result).to.have.property('datacenter', fakeDatacenter);
  });
});
describe('applications.service.deletion()', () => {
  let fakeApplicationGet,
    fakeApplicationDelete,
    fakeExecDeletion,
    fakeDatacenterGet,
    fakeDownloadDeletion,
    fakeExecShutdown,
    fakeExportStorage;
  beforeEach(() => {
    fakeApplicationDelete = sinon.stub();
    fakeApplicationGet = sinon.stub();
    fakeDatacenterGet = sinon.stub();
    fakeExecDeletion = sinon.stub();
    fakeDownloadDeletion = sinon.stub();
    fakeExecShutdown = sinon.stub();
    fakeExportStorage = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good arg and should execute the deletion of the application.', async () => {
    fakeApplicationGet.resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          datacenter: new Datacenter({
            id_datacenter: 1,
          }),
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: null,
          id_environment: 2,
          state_application: 'Ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: moment
            .tz(CONFIG.APP_TZ)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            id_environment: 2,
            icon: 'ereteret',
            label: 'Linux Alpine 3.19',
            interfaces: [],
          }),
        })
      )
    );
    fakeDatacenterGet.resolves(
      Promise.resolve(
        new Datacenter({
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        })
      )
    );
    fakeApplicationDelete.resolves(Promise.resolve(true));
    fakeExecDeletion.resolves(Promise.resolve(true));
    const application = await application_service.deletion(
      {
        id_application: 8,
      },
      {
        application_get: fakeApplicationGet,
        application_delete: fakeApplicationDelete,
        exec_deletion: fakeExecDeletion,
        datacenter_get: fakeDatacenterGet,
      }
    );
    chai.expect(application).to.deep.equal(
      new Application({
        id_application: 8,
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        creation_date: moment.tz(CONFIG.APP_TZ),
        hash: 'hash12',
        datacenter: new Datacenter({
          id_datacenter: 1,
          label: 'testdc',
          city: 'paradise',
          provider: 'prov',
        }),
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        id_user: null,
        id_environment: 2,
        state_application: 'Ready',
        state_changed_date: moment.tz(CONFIG.APP_TZ),
        programming_shutdown_date: moment
          .tz(CONFIG.APP_TZ)
          .add(CONFIG.expiration, 's'),
        environment: new Environment({
          id_environment: 2,
          icon: 'ereteret',
          label: 'Linux Alpine 3.19',
          interfaces: [],
        }),
      })
    );
    chai.expect(fakeApplicationDelete).to.have.been.called;
    chai.expect(fakeExecDeletion).to.have.been.called;
  });
  it('called with backup_storage: true and should execute backup deletion workflow.', async () => {
    fakeApplicationGet.resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          datacenter: new Datacenter({
            id_datacenter: 1,
          }),
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: null,
          id_environment: 2,
          state_application: 'Ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: moment
            .tz(CONFIG.APP_TZ)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            id_environment: 2,
            icon: 'ereteret',
            label: 'Linux Alpine 3.19',
            interfaces: [],
          }),
        })
      )
    );
    fakeDatacenterGet.resolves(
      Promise.resolve(
        new Datacenter({
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        })
      )
    );
    fakeDownloadDeletion.resolves(Promise.resolve(true));
    fakeExecShutdown.resolves(Promise.resolve(true));
    fakeExportStorage.resolves(Promise.resolve(true));

    const application = await application_service.deletion(
      {
        id_application: 8,
        backup_storage: true,
      },
      {
        application_get: fakeApplicationGet,
        application_delete: fakeApplicationDelete,
        exec_deletion: fakeExecDeletion,
        datacenter_get: fakeDatacenterGet,
        download_deletion: fakeDownloadDeletion,
        exec_shutdown: fakeExecShutdown,
        export_storage: fakeExportStorage,
      }
    );

    chai.expect(application).to.deep.equal(
      new Application({
        id_application: 8,
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        creation_date: moment.tz(CONFIG.APP_TZ),
        hash: 'hash12',
        datacenter: new Datacenter({
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        }),
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        id_user: null,
        id_environment: 2,
        state_application: 'Ready',
        state_changed_date: moment.tz(CONFIG.APP_TZ),
        programming_shutdown_date: moment
          .tz(CONFIG.APP_TZ)
          .add(CONFIG.expiration, 's'),
        environment: new Environment({
          id_environment: 2,
          icon: 'ereteret',
          label: 'Linux Alpine 3.19',
          interfaces: [],
        }),
      })
    );
    chai
      .expect(fakeDownloadDeletion)
      .to.have.been.calledWith({ id_application: 8 });
    chai.expect(fakeExecShutdown).to.have.been.called;
    chai.expect(fakeExportStorage).to.have.been.calledWith({
      id_application: 8,
      delete_existing_export: true,
      app_deletion: true,
    });
  });
  it('should reject with MissingArgument error.', async () => {
    try {
      await application_service.deletion(
        {},
        {
          application_get: fakeApplicationGet,
          application_delete: fakeApplicationDelete,
          exec_deletion: fakeExecDeletion,
        }
      );
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeApplicationDelete).to.not.have.been.called;
      chai.expect(fakeExecDeletion).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_application) are missing.');
    }
  });
  it('should reject with ParameterMisformed error for id_user.', async () => {
    try {
      await application_service.deletion(
        {
          id_application: 'Misformed',
        },
        {
          application_get: fakeApplicationGet,
          application_delete: fakeApplicationDelete,
          exec_deletion: fakeExecDeletion,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeApplicationDelete).to.not.have.been.called;
      chai.expect(fakeExecDeletion).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_application parameter is misformed.');
    }
  });
  it('should reject with ParameterMisformed error for backup_storage.', async () => {
    try {
      await application_service.deletion(
        {
          id_application: 8,
          backup_storage: 'Misformed',
        },
        {
          application_get: fakeApplicationGet,
          application_delete: fakeApplicationDelete,
          exec_deletion: fakeExecDeletion,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeApplicationDelete).to.not.have.been.called;
      chai.expect(fakeExecDeletion).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.backup_storage parameter is misformed.');
    }
  });
  it('should reject with ApplicationInvalidStateError.', async () => {
    fakeApplicationGet.resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          datacenter: new Datacenter({
            id_datacenter: 1,
          }),
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: null,
          id_environment: 2,
          state_application: 'Deleted',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: moment
            .tz(CONFIG.APP_TZ)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            id_environment: 2,
            icon: 'ereteret',
            label: 'Linux Alpine 3.19',
            interfaces: [],
          }),
        })
      )
    );
    try {
      await application_service.deletion(
        {
          id_application: 8,
        },
        {
          application_get: fakeApplicationGet,
          application_delete: fakeApplicationDelete,
          exec_deletion: fakeExecDeletion,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ApplicationInvalidStateError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationGet).to.have.been.calledOnce;
      chai.expect(fakeApplicationDelete).to.not.have.been.called;
      chai.expect(fakeExecDeletion).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ApplicationInvalidStateError);
      chai
        .expect(err.message)
        .to.equal(
          'The application must be in states Ready or Off to be deleted, current state is Deleted'
        );
    }
  });
});
describe('applications.service.create()', () => {
  let fakeUserGet,
    fakePasswordGenerate,
    fakeUniqueNameGenerate,
    fakeUniqueHashGenerate,
    fakeEnvironmentGet,
    fakeDatacenterGet,
    fakeApplicationCreate,
    clock,
    fakeMoment;
  beforeEach(() => {
    fakeUserGet = sinon.stub();
    fakePasswordGenerate = sinon.stub();
    fakeUniqueNameGenerate = sinon.stub();
    fakeUniqueHashGenerate = sinon.stub();
    fakeEnvironmentGet = sinon.stub();
    fakeDatacenterGet = sinon.stub();
    fakeApplicationCreate = sinon.stub();
    const fixedTime = '1999-08-23T12:00:00Z';
    clock = sinon.useFakeTimers(new Date(fixedTime).getTime());
    fakeMoment = sinon.stub(moment, 'tz').callsFake(() => moment(fixedTime));
  });
  afterEach(() => {
    sinon.restore();
    clock.restore();
    fakeMoment.restore();
  });
  it('called with good args and should execute the deployment of the app.', async () => {
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: undefined,
        })
      )
    );
    fakeDatacenterGet.resolves(
      Promise.resolve(
        new Datacenter({
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        })
      )
    );
    fakePasswordGenerate.resolves(Promise.resolve('louis-daphne-peheux'));
    fakeUniqueNameGenerate.resolves(Promise.resolve('ulfi-blacky-donkey'));
    fakeUniqueHashGenerate.resolves(Promise.resolve('hash12'));
    fakeEnvironmentGet.resolves(
      Promise.resolve(
        new Environment({
          id_environment: 1,
          icon: 'ereteret',
          label: 'ReactJS',
        })
      )
    );
    fakeApplicationCreate.resolves(
      Promise.resolve(
        new Application({
          id_application: 1,
          custom_label: 'Wow ça marche',
          generated_label: 'ulfi-blacky-donkey',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'louis-daphne-peheux',
          id_user: 1,
          id_environment: 1,
          state_application: 'Scheduled',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: moment
            .tz(CONFIG.APP_TZ)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            id_environment: 1,
            icon: 'ereteret',
            label: 'ReactJS',
          }),
        })
      )
    );
    const application = await application_service.create(
      {
        id_user: 1,
        id_datacenter: 1,
        id_environment: 1,
        label: 'Wow ça marche',
      },
      {
        user_get: fakeUserGet,
        password_generate: fakePasswordGenerate,
        generate_unique_label: fakeUniqueNameGenerate,
        unique_hash_generate: fakeUniqueHashGenerate,
        environment_get: fakeEnvironmentGet,
        application_create: fakeApplicationCreate,
        datacenter_get: fakeDatacenterGet,
      }
    );
    chai.expect(application).to.deep.equal(
      new Application({
        id_application: 1,
        custom_label: 'Wow ça marche',
        generated_label: 'ulfi-blacky-donkey',
        creation_date: moment.tz(CONFIG.APP_TZ),
        hash: 'hash12',
        username: 'b_lefebvre',
        password: 'louis-daphne-peheux',
        id_user: 1,
        id_environment: 1,
        state_application: 'Scheduled',
        datacenter: new Datacenter({
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        }),
        state_changed_date: moment.tz(CONFIG.APP_TZ),
        programming_shutdown_date: moment
          .tz(CONFIG.APP_TZ)
          .add(CONFIG.expiration, 's'),
        environment: new Environment({
          icon: 'ereteret',
          id_environment: 1,
          label: 'ReactJS',
        }),
      })
    );
    chai.expect(fakeUserGet).to.have.been.calledOnceWithExactly({
      id_user: 1,
    });
    chai
      .expect(fakePasswordGenerate)
      .to.have.been.calledOnceWithExactly({ count: 3 });
    chai
      .expect(fakeUniqueNameGenerate)
      .to.have.been.calledOnceWithExactly({ count: 3 });
    chai.expect(fakeUniqueHashGenerate).to.have.been.called;
    chai.expect(fakeEnvironmentGet).to.have.been.calledOnceWithExactly({
      id_environment: 1,
    });
    chai.expect(fakeApplicationCreate).to.have.been.calledOnceWithExactly({
      id_user: 1,
      id_environment: 1,
      id_datacenter: 1,
      custom_label: 'Wow ça marche',
      generated_label: 'ulfi-blacky-donkey',
      hash: 'hash12',
      username: 'b_lefebvre',
      password: 'louis-daphne-peheux',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
    });
  });
  it('called with good args and should schedule the deployment of the app.', async () => {
    clock.restore();
    fakeMoment.restore();
    fakeDatacenterGet.resolves(
      Promise.resolve(
        new Datacenter({
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        })
      )
    );
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: undefined,
        })
      )
    );
    fakePasswordGenerate.resolves(Promise.resolve('louis-daphne-peheux'));
    fakeUniqueNameGenerate.resolves(Promise.resolve('ulfi-blacky-donkey'));
    fakeUniqueHashGenerate.resolves(Promise.resolve('hash12'));
    fakeEnvironmentGet.resolves(
      Promise.resolve(
        new Environment({
          icon: 'ereteret',
          id_environment: 1,
          label: 'ReactJS',
        })
      )
    );
    fakeApplicationCreate.resolves(
      Promise.resolve(
        new Application({
          id_application: 1,
          custom_label: 'Wow ça marche',
          generated_label: 'ulfi-blacky-donkey',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'louis-daphne-peheux',
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          id_user: 1,
          id_environment: 1,
          state_application: 'Ready',
          state_changed_date: moment('2199-08-23T12:00:00Z').tz(
            CONFIG.APP_TZ
          ),
          programming_shutdown_date: moment('2199-08-23T12:00:00Z')
            .tz(CONFIG.APP_TZ)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            icon: 'ereteret',
            id_environment: 1,
            label: 'ReactJS',
          }),
        })
      )
    );
    const application = await application_service.create(
      {
        id_user: 1,
        id_datacenter: 1,
        id_environment: 1,
        label: 'Wow ça marche',
        state_changed_date: '2199-08-23T12:00:00Z',
      },
      {
        user_get: fakeUserGet,
        password_generate: fakePasswordGenerate,
        generate_unique_label: fakeUniqueNameGenerate,
        unique_hash_generate: fakeUniqueHashGenerate,
        environment_get: fakeEnvironmentGet,
        application_create: fakeApplicationCreate,
        datacenter_get: fakeDatacenterGet,
      }
    );
    chai.expect(application.id_application).to.be.equal(1);
    chai.expect(application.custom_label).to.be.equal('Wow ça marche');
    chai.expect(application.generated_label).to.be.equal('ulfi-blacky-donkey');
    chai.expect(application.hash).to.be.equal('hash12');
    chai.expect(application.username).to.be.equal('b_lefebvre');
    chai.expect(application.password).to.be.equal('louis-daphne-peheux');

    chai.expect(application.id_user).to.be.equal(1);
    chai.expect(application.id_environment).to.be.equal(1);
    chai.expect(application.state_application).to.be.equal('Ready');
    chai
      .expect(application.state_changed_date)
      .to.deep.equal(moment('2199-08-23T12:00:00Z').tz(CONFIG.APP_TZ));
    chai
      .expect(application.programming_shutdown_date)
      .to.deep.equal(
        moment('2199-08-23T12:00:00Z')
          .tz(CONFIG.APP_TZ)
          .add(CONFIG.expiration, 's')
      );
    chai.expect(application.environment).to.deep.equal(
      new Environment({
        id_environment: 1,
        icon: 'ereteret',
        label: 'ReactJS',
      })
    );
    chai.expect(fakeUserGet).to.have.been.calledOnceWithExactly({
      id_user: 1,
    });
    chai
      .expect(fakePasswordGenerate)
      .to.have.been.calledOnceWithExactly({ count: 3 });
    chai
      .expect(fakeUniqueNameGenerate)
      .to.have.been.calledOnceWithExactly({ count: 3 });
    chai.expect(fakeUniqueHashGenerate).to.have.been.called;
    chai.expect(fakeEnvironmentGet).to.have.been.calledOnceWithExactly({
      id_environment: 1,
    });
    chai.expect(fakeApplicationCreate).to.have.been.calledOnceWithExactly({
      id_user: 1,
      id_environment: 1,
      id_datacenter: 1,
      custom_label: 'Wow ça marche',
      generated_label: 'ulfi-blacky-donkey',
      hash: 'hash12',
      username: 'b_lefebvre',
      password: 'louis-daphne-peheux',
      state_changed_date: moment('2199-08-23T12:00:00Z').tz(CONFIG.APP_TZ),
    });
  });
  it('called with missing arguments and should reject with MissingArgument error.', async () => {
    try {
      await application_service.create(
        {
          state_changed_date: '2199-08-23T12:00:00Z',
        },
        {
          user_get: fakeUserGet,
          password_generate: fakePasswordGenerate,
          unique_name_generate: fakeUniqueNameGenerate,
          unique_hash_generate: fakeUniqueHashGenerate,
          environment_get: fakeEnvironmentGet,
          application_create: fakeApplicationCreate,
        }
      );
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.not.have.been.called;
      chai.expect(fakePasswordGenerate).to.not.have.been.called;
      chai.expect(fakeUniqueNameGenerate).to.not.have.been.called;
      chai.expect(fakeUniqueHashGenerate).to.not.have.been.called;
      chai.expect(fakeEnvironmentGet).to.not.have.been.called;
      chai.expect(fakeApplicationCreate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal(
          'One or multiple arguments (id_user,id_environment,id_datacenter,label) are missing.'
        );
    }
  });
  it('called with misformed id_environment and should reject with ParameterMisformed error.', async () => {
    try {
      await application_service.create(
        {
          id_user: 1,
          id_datacenter: 1,
          id_environment: 'misformed',
          label: 'Wow ça marche',
          state_changed_date: '2199-08-23T12:00:00Z',
        },
        {
          user_get: fakeUserGet,
          password_generate: fakePasswordGenerate,
          unique_name_generate: fakeUniqueNameGenerate,
          unique_hash_generate: fakeUniqueHashGenerate,
          environment_get: fakeEnvironmentGet,
          application_create: fakeApplicationCreate,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.not.have.been.called;
      chai.expect(fakePasswordGenerate).to.not.have.been.called;
      chai.expect(fakeUniqueNameGenerate).to.not.have.been.called;
      chai.expect(fakeUniqueHashGenerate).to.not.have.been.called;
      chai.expect(fakeEnvironmentGet).to.not.have.been.called;
      chai.expect(fakeApplicationCreate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_environment parameter is misformed.');
    }
  });
  it('called with misformed id_datacenter and should reject with ParameterMisformed error.', async () => {
    try {
      await application_service.create(
        {
          id_user: 1,
          id_datacenter: 'misformed',
          id_environment: 1,
          label: 'Wow ça marche',
          state_changed_date: '2199-08-23T12:00:00Z',
        },
        {
          user_get: fakeUserGet,
          password_generate: fakePasswordGenerate,
          unique_name_generate: fakeUniqueNameGenerate,
          unique_hash_generate: fakeUniqueHashGenerate,
          environment_get: fakeEnvironmentGet,
          application_create: fakeApplicationCreate,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.not.have.been.called;
      chai.expect(fakePasswordGenerate).to.not.have.been.called;
      chai.expect(fakeUniqueNameGenerate).to.not.have.been.called;
      chai.expect(fakeUniqueHashGenerate).to.not.have.been.called;
      chai.expect(fakeEnvironmentGet).to.not.have.been.called;
      chai.expect(fakeApplicationCreate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_datacenter parameter is misformed.');
    }
  });
  it('called with misformed id_user and should reject with ParameterMisformed error.', async () => {
    try {
      await application_service.create(
        {
          id_user: 'misformed',
          id_environment: 1,
          id_datacenter: 1,
          label: 'Wow ça marche',
          state_changed_date: '2199-08-23T12:00:00Z',
        },
        {
          user_get: fakeUserGet,
          password_generate: fakePasswordGenerate,
          unique_name_generate: fakeUniqueNameGenerate,
          unique_hash_generate: fakeUniqueHashGenerate,
          environment_get: fakeEnvironmentGet,
          application_create: fakeApplicationCreate,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.not.have.been.called;
      chai.expect(fakePasswordGenerate).to.not.have.been.called;
      chai.expect(fakeUniqueNameGenerate).to.not.have.been.called;
      chai.expect(fakeUniqueHashGenerate).to.not.have.been.called;
      chai.expect(fakeEnvironmentGet).to.not.have.been.called;
      chai.expect(fakeApplicationCreate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_user parameter is misformed.');
    }
  });
});
