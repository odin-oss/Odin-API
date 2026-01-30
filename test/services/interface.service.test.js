import * as interface_service from '../../src/services/interface.service.js';
import { Interface } from '../../src/objects/Interface.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../src/utils/errors.service.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('interface.service.get()', () => {
  let fakeInterfaceGet;
  beforeEach(() => {
    fakeInterfaceGet = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good arg and should get the corresponding Interface object.', async () => {
    fakeInterfaceGet.resolves(
      Promise.resolve(
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
          node_selectors: [],
          ports: [],
          envs: [],
        })
      )
    );
    const int = await interface_service.get(
      { id_interface: 1 },
      { interface_get: fakeInterfaceGet }
    );
    chai.expect(int).to.deep.equal(
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
        node_selectors: [],
        ports: [],
        envs: [],
      })
    );
    chai.expect(fakeInterfaceGet).to.have.been.calledOnceWithExactly({
      id_interface: 1,
    });
  });
  it('called with missing arg and should get MissingArgument Error.', async () => {
    try {
      await interface_service.get({}, { interface_get: fakeInterfaceGet });
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeInterfaceGet).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_interface) are missing.');
    }
  });
  it('called with missing arg and should get ParameterMisformed Error.', async () => {
    try {
      await interface_service.get(
        { id_interface: 'misformed' },
        { interface_get: fakeInterfaceGet }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeInterfaceGet).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_interface parameter is misformed.');
    }
  });
});
