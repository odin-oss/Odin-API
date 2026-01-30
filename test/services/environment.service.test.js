import * as environment_service from '../../src/services/environment.service.js';
import { Environment } from '../../src/objects/Environment.js';
import {
  DBConnexionRefused,
  MissingArgumentError,
  ParameterMisformed,
} from '../../src/utils/errors.service.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Interface } from '../../src/objects/Interface.js';
chai.use(sinonChai);

describe('environment.service.list()', () => {
  let fakeEnvironmentList;
  beforeEach(() => {
    fakeEnvironmentList = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it("should return an Environment's array.", async () => {
    fakeEnvironmentList.resolves(
      Promise.resolve([
        new Environment({
          id_environnement: 45,
          icon: 'ereteret',
          label: 'ssh-Ubuntu',
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
          id_environnement: 46,
          label: 'ssh-Ubuntu',
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

    const environments = await environment_service.list({
      environment_list: fakeEnvironmentList,
    });
    chai.expect(environments).to.deep.equal([
      new Environment({
        id_environnement: 45,
        icon: 'ereteret',
        label: 'ssh-Ubuntu',
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
        id_environnement: 46,
        label: 'ssh-Ubuntu',
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
    ]);
    chai.expect(fakeEnvironmentList).to.have.been.calledOnce;
  });
  it('should throw the DBConnexionRefused error.', async () => {
    try {
      fakeEnvironmentList.resolves(
        Promise.reject(
          new DBConnexionRefused('Connexion to the database refused.')
        )
      );
      await environment_service.list({
        environment_list: fakeEnvironmentList,
      });
      chai.expect.fail(
        'chai.expected to throw DBConnexionRefused, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeEnvironmentList).to.have.been.calledOnce;
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
      chai.expect(err.message).to.equal('Connexion to the database refused.');
    }
  });
});
describe('environment.service.get()', () => {
  let fakeEnvironmentGet;
  beforeEach(() => {
    fakeEnvironmentGet = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good arg and should send back a specific Environment object.', async () => {
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
    const result = await environment_service.get(
      { id_environment: 1 },
      { environment_get: fakeEnvironmentGet }
    );
    chai.expect(result).to.deep.equal(
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
    );
    chai.expect(fakeEnvironmentGet).to.have.been.calledOnceWithExactly({
      id_environment: 1,
    });
  });
  it('called with missing arg and should get MissingArgument Error.', async () => {
    try {
      await environment_service.get(
        {},
        { environment_get: fakeEnvironmentGet }
      );
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeEnvironmentGet).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_environment) are missing.');
    }
  });
  it('called with misformed arg and should get ParameterMisformed Error.', async () => {
    try {
      await environment_service.get(
        { id_environment: 'misformed' },
        { environment_get: fakeEnvironmentGet }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeEnvironmentGet).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_environment parameter is misformed.');
    }
  });
});
