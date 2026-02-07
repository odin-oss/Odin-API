import * as applications_controller from '../../src/controllers/applications.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import moment from 'moment-timezone';
import { DBConnexionRefused } from '../../src/utils/errors.service.js';
import CONFIG from '../../src/config/config.js';
import * as token_service from '../../src/utils/token.service.js';
import { Application } from '../../src/objects/Application.js';
import { Environment } from '../../src/objects/Environment.js';
import { Interface } from '../../src/objects/Interface.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
chai.use(sinonChai);

describe('applications_controller.list()', () => {
  let fakeList, fakeReq, fakeRes, saveCONFIG;
  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeList = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      method: 'GET',
      originalUrl: '/application/list',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.ms_apps_url = saveCONFIG.ms_apps_url;
  });
  it('called with good arguments and should return a list of applications.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeList.resolves(
      Promise.resolve([
        new Application({
          id_application: 8,
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 2,
          state_application: 'Ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: null,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [
              new Interface({
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
                ports: [
                  {
                    id_port_type: 1,
                    port: 3000,
                    label: 'WebTerm',
                    port_type: 'GUI',
                    icon: 'webterm',
                    display_name: 'Terminal',
                  },
                ],
              }),
              new Interface({
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
              }),
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
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          id_user: 1,
          id_environment: 3,
          state_application: 'Ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: null,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [],
          }),
        }),
      ])
    );
    await applications_controller.list(fakeReq, fakeRes, {
      applications_list: fakeList,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: [
        {
          interfaces: [
            {
              label: 'SSHTerm',
              link: 'https://apps.testdc.prov.launch.getodin.cloud/hash12/sshterm-webterm/',
              service: 'WebTerm',
              icon: 'webterm',
              display_name: 'Terminal',
            },
          ],
          id_application: 8,
          history: { records: [] },
          environment: 'Linux Alpine 3.19',
          id_environment: 2,
          datacenter: {
            id_datacenter: 1,
            provider: 'prov',
            label: 'testdc',
            city: 'paradise',
          },
          icon: 'ereteret',
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          state_application: 'Ready',
          programming_shutdown_date: null,
          hash: 'hash12',
        },
        {
          interfaces: [],
          id_application: 9,
          history: { records: [] },
          environment: 'Linux Alpine 3.19',
          id_environment: 2,
          datacenter: {
            id_datacenter: 1,
            provider: 'prov',
            label: 'testdc',
            city: 'paradise',
          },
          custom_label: 'Application de travail',
          generated_label: 'shrek-donkey-fiona',
          username: 'b_lefebvre',
          state_application: 'Ready',
          password: 'shrek-donkey-fiona',
          programming_shutdown_date: null,
          hash: 'hash13',
          icon: 'ereteret',
        },
      ],
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
  it('called with good arguments but should reject with DBConnexionRefused error.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeList.resolves(
      Promise.reject(
        new DBConnexionRefused('Connexion to the database refused.')
      )
    );
    await applications_controller.list(fakeReq, fakeRes, {
      applications_list: fakeList,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'DBConnexionRefused',
        message: 'Connexion to the database refused.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
  });
});
describe('applications_controller.get()', () => {
  let fakeGet, fakeReq, fakeRes, saveCONFIG;
  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeGet = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_application: 8,
      },
      method: 'GET',
      originalUrl: '/application',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.ms_apps_url = saveCONFIG.ms_apps_url;
  });
  it('called with key and should return informations about the application.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        key: 'shrek-donkey-fiona',
      },
      method: 'GET',
      originalUrl: '/application',
    };
    fakeGet.resolves(
      Promise.resolve(
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
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            city: 'paradise',
            provider: 'prov',
          }),
          state_application: 'Ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: null,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [
              new Interface({
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
                ports: [
                  {
                    id_port_type: 1,
                    port: 3000,
                    label: 'WebTerm',
                    port_type: 'GUI',
                    icon: 'webterm',
                    display_name: 'Terminal',
                  },
                ],
              }),
              new Interface({
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
              }),
            ],
          }),
        })
      )
    );
    await applications_controller.get(fakeReq, fakeRes, {
      application_get: fakeGet,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        interfaces: [
          {
            label: 'SSHTerm',
            link: 'https://apps.testdc.prov.launch.getodin.cloud/hash12/sshterm-webterm/',
            service: 'WebTerm',

            icon: 'webterm',
            display_name: 'Terminal',
          },
        ],
        environment: 'Linux Alpine 3.19',
        id_environment: 2,
        history: { records: [] },
        datacenter: {
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        },
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        hash: 'hash12',
        id_application: 8,
        icon: 'ereteret',
        programming_shutdown_date: null,
        state_application: 'Ready',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
  it('called with id_application and should return informations about the application.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeGet.resolves(
      Promise.resolve(
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
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          state_application: 'Ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: null,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [
              new Interface({
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
                ports: [
                  {
                    id_port_type: 1,
                    port: 3000,
                    label: 'WebTerm',
                    port_type: 'GUI',
                    icon: 'webterm',
                    display_name: 'Terminal',
                  },
                ],
              }),
              new Interface({
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
              }),
            ],
          }),
        })
      )
    );
    await applications_controller.get(fakeReq, fakeRes, {
      application_get: fakeGet,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        interfaces: [
          {
            label: 'SSHTerm',
            link: 'https://apps.testdc.prov.launch.getodin.cloud/hash12/sshterm-webterm/',
            service: 'WebTerm',
            icon: 'webterm',
            display_name: 'Terminal',
          },
        ],
        environment: 'Linux Alpine 3.19',
        id_environment: 2,
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        hash: 'hash12',
        history: { records: [] },
        datacenter: {
          id_datacenter: 1,
          provider: 'prov',
          city: 'paradise',
          label: 'testdc',
        },
        id_application: 8,
        icon: 'ereteret',
        programming_shutdown_date: null,
        state_application: 'Ready',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
  it('called without arguments and should reject with MissingArgument error.', async () => {
    try {
      CONFIG.ms_apps_url = 'launch.getodin.cloud';
      const token = token_service.generateToken({ id_user: 1 });
      fakeReq = {
        headers: {
          authorization: 'Bearer ' + token,
        },
        query: {},
        method: 'GET',
        originalUrl: '/application',
      };
      fakeRes = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      await applications_controller.get(fakeReq, fakeRes, {
        application_get: fakeGet,
      });
      chai.fail('chai expects to get MissingArgument error.');
    } catch (err) {
      chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
        result: {
          error: 'MissingArgumentError',
          message: 'The query parameter (id_application,key) is missing.',
        },
      });
      chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    }
  });
  it('called but should reject with DBConnexionRefused error.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeGet.resolves(
      Promise.reject(
        new DBConnexionRefused('Connexion to the database refused.')
      )
    );
    await applications_controller.get(fakeReq, fakeRes, {
      application_get: fakeGet,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'DBConnexionRefused',
        message: 'Connexion to the database refused.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
  });
});
describe('applications_controller.start()', () => {
  let fakeStart, fakeReq, fakeRes, saveCONFIG, clock, fakeMoment;
  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeStart = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_application: 8,
      },
      method: 'PUT',
      originalUrl: '/application/start',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    const fixedTime = '2025-03-07T01:00:00.000+01:00';
    clock = sinon.useFakeTimers(new Date(fixedTime).getTime());
    fakeMoment = sinon.stub(moment, 'tz').callsFake(() => moment(fixedTime));
  });
  afterEach(() => {
    sinon.restore();
    clock.restore();
    fakeMoment.restore();
    CONFIG.ms_apps_url = saveCONFIG.ms_apps_url;
  });
  it('called with good arguments and should start the application.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeStart.resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          id_environment: 2,
          state_application: 'Ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: null,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [
              new Interface({
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
                ports: [
                  {
                    id_port_type: 1,
                    port: 3000,
                    label: 'WebTerm',
                    port_type: 'GUI',
                    icon: 'webterm',
                    display_name: 'Terminal',
                  },
                ],
              }),
              new Interface({
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
              }),
            ],
          }),
        })
      )
    );
    await applications_controller.start(fakeReq, fakeRes, {
      application_start: fakeStart,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        interfaces: [
          {
            label: 'SSHTerm',
            link: 'https://apps.testdc.prov.launch.getodin.cloud/hash12/sshterm-webterm/',
            service: 'WebTerm',
            icon: 'webterm',
            display_name: 'Terminal',
          },
        ],
        history: { records: [] },
        id_application: 8,
        environment: 'Linux Alpine 3.19',
        id_environment: 2,
        datacenter: {
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        },
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        hash: 'hash12',
        icon: 'ereteret',
        programming_shutdown_date: null,
        state_application: 'Ready',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeStart.resolves(
      Promise.reject(
        new DBConnexionRefused('Connexion to the database refused.')
      )
    );
    await applications_controller.start(fakeReq, fakeRes, {
      application_start: fakeStart,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'DBConnexionRefused',
        message: 'Connexion to the database refused.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
  });
});
describe('applications_controller.stop()', () => {
  let fakeStop, fakeReq, fakeRes, saveCONFIG;
  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeStop = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_application: 8,
      },
      method: 'PUT',
      originalUrl: '/application/stop',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.ms_apps_url = saveCONFIG.ms_apps_url;
  });
  it('called with good arguments and should start the application.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeStop.resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          id_environment: 2,
          state_application: 'Off',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: undefined,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [
              new Interface({
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
                ports: [
                  {
                    id_port_type: 1,
                    port: 3000,
                    label: 'WebTerm',
                    port_type: 'GUI',
                    icon: 'webterm',
                    display_name: 'Terminal',
                  },
                ],
              }),
              new Interface({
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
              }),
            ],
          }),
        })
      )
    );
    await applications_controller.stop(fakeReq, fakeRes, {
      application_stop: fakeStop,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        interfaces: [
          {
            label: 'SSHTerm',
            link: 'https://apps.testdc.prov.launch.getodin.cloud/hash12/sshterm-webterm/',
            service: 'WebTerm',
            icon: 'webterm',
            display_name: 'Terminal',
          },
        ],
        history: { records: [] },
        id_application: 8,
        environment: 'Linux Alpine 3.19',
        id_environment: 2,
        datacenter: {
          id_datacenter: 1,
          label: 'testdc',
          city: 'paradise',
          provider: 'prov',
        },
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        hash: 'hash12',
        icon: 'ereteret',
        programming_shutdown_date: null,
        state_application: 'Off',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeStop.resolves(
      Promise.reject(
        new DBConnexionRefused('Connexion to the database refused.')
      )
    );
    await applications_controller.stop(fakeReq, fakeRes, {
      application_stop: fakeStop,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'DBConnexionRefused',
        message: 'Connexion to the database refused.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
  });
});
describe('applications_controller.deletion()', () => {
  let fakeDelete, fakeReq, fakeRes, saveCONFIG;
  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeDelete = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_application: 8,
      },
      body: {
        backup_storage: 'true',
      },
      method: 'DELETE',
      originalUrl: '/application/',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.ms_apps_url = saveCONFIG.ms_apps_url;
  });
  it('called with good arguments and should delete the application.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeDelete.resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          datacenter: new Datacenter({
            id_datacenter: 1,
            provider: 'prov',
            label: 'testdc',
            city: 'paradise',
          }),
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 2,
          state_application: 'Deleted',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: undefined,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [
              new Interface({
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
                ports: [
                  {
                    id_port_type: 1,
                    port: 3000,
                    label: 'WebTerm',
                    port_type: 'GUI',
                    icon: 'webterm',
                    display_name: 'Terminal',
                  },
                ],
              }),
              new Interface({
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
              }),
            ],
          }),
        })
      )
    );
    await applications_controller.deletion(fakeReq, fakeRes, {
      application_delete: fakeDelete,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        interfaces: [
          {
            label: 'SSHTerm',
            link: 'https://apps.testdc.prov.launch.getodin.cloud/hash12/sshterm-webterm/',
            service: 'WebTerm',
            icon: 'webterm',
            display_name: 'Terminal',
          },
        ],
        history: { records: [] },
        id_application: 8,
        environment: 'Linux Alpine 3.19',
        id_environment: 2,
        datacenter: {
          id_datacenter: 1,
          provider: 'prov',
          label: 'testdc',
          city: 'paradise',
        },
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        hash: 'hash12',
        icon: 'ereteret',
        programming_shutdown_date: null,
        state_application: 'Deleted',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeReq.body = {
      backup_storage: 'true',
    };
    fakeDelete.resolves(
      Promise.reject(
        new DBConnexionRefused('Connexion to the database refused.')
      )
    );
    await applications_controller.deletion(fakeReq, fakeRes, {
      application_delete: fakeDelete,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'DBConnexionRefused',
        message: 'Connexion to the database refused.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
  });

  it('called with invalid backup_storage and should reject with error.', async () => {
    fakeReq.body = {
      backup_storage: 'invalid',
    };
    await applications_controller.deletion(fakeReq, fakeRes, {
      application_delete: fakeDelete,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'ParameterMisformed',
        message: 'backup_storage must be a boolean string ("true" or "false").',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
  });

  it('called without backup_storage and should default to true.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeReq.body = {};
    fakeDelete.resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          datacenter: new Datacenter({
            id_datacenter: 1,
            provider: 'prov',
            label: 'testdc',
            city: 'paradise',
          }),
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 2,
          state_application: 'Deleted',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: undefined,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [],
          }),
        })
      )
    );
    await applications_controller.deletion(fakeReq, fakeRes, {
      application_delete: fakeDelete,
    });
    chai.expect(fakeDelete).to.have.been.calledOnceWithExactly({
      id_application: 8,
      backup_storage: true,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
});
describe('applications_controller.create()', () => {
  let fakeCreate, fakeReq, fakeRes, saveCONFIG;
  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeCreate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      body: {
        id_environment: 2,
        id_datacenter: 1,
      },
      method: 'POST',
      originalUrl: '/application/',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.ms_apps_url = saveCONFIG.ms_apps_url;
  });
  it('called with good arguments and should create the application.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeCreate.resolves(
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
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 2,
          state_application: 'Getting ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: undefined,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [
              new Interface({
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
                ports: [
                  {
                    id_port_type: 1,
                    port: 3000,
                    label: 'WebTerm',
                    port_type: 'GUI',
                    icon: 'webterm',
                    display_name: 'Terminal',
                  },
                ],
              }),
              new Interface({
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
              }),
            ],
          }),
        })
      )
    );
    await applications_controller.create(fakeReq, fakeRes, {
      application_create: fakeCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        interfaces: [
          {
            label: 'SSHTerm',
            link: 'https://apps.testdc.prov.launch.getodin.cloud/hash12/sshterm-webterm/',
            service: 'WebTerm',
            icon: 'webterm',
            display_name: 'Terminal',
          },
        ],
        id_application: 8,
        history: {
          records: [],
        },
        datacenter: {
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        },
        environment: 'Linux Alpine 3.19',
        id_environment: 2,
        custom_label: 'Application de travail super géniale',
        generated_label: 'shrek-fiona-donkey',
        username: 'b_lefebvre',
        password: 'shrek-donkey-fiona',
        hash: 'hash12',
        icon: 'ereteret',
        programming_shutdown_date: null,
        state_application: 'Getting ready',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeCreate.resolves(
      Promise.reject(
        new DBConnexionRefused('Connexion to the database refused.')
      )
    );
    await applications_controller.create(fakeReq, fakeRes, {
      application_create: fakeCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'DBConnexionRefused',
        message: 'Connexion to the database refused.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
  });

  it('called with label and should create application with custom label.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeReq.body = {
      id_environment: 2,
      id_datacenter: 1,
      label: 'My Custom Label',
    };
    fakeCreate.resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          custom_label: 'My Custom Label',
          generated_label: 'shrek-fiona-donkey',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 2,
          state_application: 'Getting ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: undefined,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [],
          }),
        })
      )
    );
    await applications_controller.create(fakeReq, fakeRes, {
      application_create: fakeCreate,
    });
    chai.expect(fakeCreate).to.have.been.calledOnce;
    chai
      .expect(fakeCreate.firstCall.args[0])
      .to.have.property('label', 'My Custom Label');
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called without label and should default to empty string.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeReq.body = {
      id_environment: 2,
      id_datacenter: 1,
    };
    fakeCreate.resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          custom_label: '',
          generated_label: 'shrek-fiona-donkey',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 2,
          state_application: 'Getting ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: undefined,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [],
          }),
        })
      )
    );
    await applications_controller.create(fakeReq, fakeRes, {
      application_create: fakeCreate,
    });
    chai.expect(fakeCreate).to.have.been.calledOnce;
    chai.expect(fakeCreate.firstCall.args[0]).to.have.property('label', '');
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called with state_changed_date and should use provided date.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    const customDate = '2025-01-15T10:30:00.000Z';
    fakeReq.body = {
      id_environment: 2,
      id_datacenter: 1,
      state_changed_date: customDate,
    };
    fakeCreate.resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          custom_label: '',
          generated_label: 'shrek-fiona-donkey',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 2,
          state_application: 'Getting ready',
          state_changed_date: moment(customDate).tz(CONFIG.APP_TZ),
          programming_shutdown_date: undefined,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [],
          }),
        })
      )
    );
    await applications_controller.create(fakeReq, fakeRes, {
      application_create: fakeCreate,
    });
    chai.expect(fakeCreate).to.have.been.calledOnce;
    const callArgs = fakeCreate.firstCall.args[0];
    chai.expect(callArgs).to.have.property('state_changed_date');
    chai
      .expect(callArgs.state_changed_date.toISOString())
      .to.equal(moment(customDate).tz(CONFIG.APP_TZ).toISOString());
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called without state_changed_date and should use current moment.', async () => {
    CONFIG.ms_apps_url = 'launch.getodin.cloud';
    fakeReq.body = {
      id_environment: 2,
      id_datacenter: 1,
    };
    fakeCreate.resolves(
      Promise.resolve(
        new Application({
          id_application: 8,
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          custom_label: '',
          generated_label: 'shrek-fiona-donkey',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 2,
          state_application: 'Getting ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: undefined,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [],
          }),
        })
      )
    );
    await applications_controller.create(fakeReq, fakeRes, {
      application_create: fakeCreate,
    });
    chai.expect(fakeCreate).to.have.been.calledOnce;
    const callArgs = fakeCreate.firstCall.args[0];
    chai.expect(callArgs).to.have.property('state_changed_date');
    chai.expect(moment.isMoment(callArgs.state_changed_date)).to.be.true;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
});
