import * as environment_controller from '../../src/controllers/environment.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.service.js';
import { DBConnexionRefused } from '../../src/utils/errors.service.js';
import { Environment } from '../../src/objects/Environment.js';
import { Interface } from '../../src/objects/Interface.js';
chai.use(sinonChai);

describe('environment_controller.list()', () => {
  let fakeList, fakeRes, fakeReq;
  beforeEach(() => {
    fakeList = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      method: 'GET',
      originalUrl: '/me',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called and should get the list of environment in public format.', async () => {
    fakeList.resolves(
      Promise.resolve([
        new Environment({
          id_environment: 45,
          label: 'ssh-Ubuntu',
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
              ports: [],
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
        new Environment({
          id_environment: 46,
          label: 'ssh-Alpine',
          icon: 'ereteret',
          interfaces: [
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
      ])
    );
    await environment_controller.list(fakeReq, fakeRes, {
      environment_list: fakeList,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: [
        {
          id_environment: 45,
          label: 'ssh-Ubuntu',
          icon: 'ereteret',
          interfaces: [
            { id_interface: 46, label: 'SSHTerm', label_type_image: 'linux' },
            { id_interface: 1, label: 'Alpine318', label_type_image: 'linux' },
          ],
        },
        {
          id_environment: 46,
          label: 'ssh-Alpine',
          icon: 'ereteret',
          interfaces: [
            { id_interface: 1, label: 'Alpine318', label_type_image: 'linux' },
          ],
        },
      ],
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
  it('called and should reject with DBConnexionRefused.', async () => {
    try {
      fakeList.resolves(
        Promise.reject(
          new DBConnexionRefused('Connexion to the database refused.')
        )
      );
      await environment_controller.list(fakeReq, fakeRes, {
        environment_list: fakeList,
      });
    } catch (err) {
      chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
        result: {
          error: 'DBConnexionRefused',
          message: 'Connexion to the database refused.',
        },
      });
      chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    }
  });
});
