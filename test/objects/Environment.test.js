import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Environment } from '../../src/objects/Environment.js';
import { Interface } from '../../src/objects/Interface.js';
chai.use(sinonChai);

describe('<object> Environment', () => {
  let fakeGet;
  beforeEach(() => {
    fakeGet = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('creates and checks value of Environment object.', () => {
    const env = new Environment({
      id_environment: 3,
      icon: 'ereteret',
      label: 'ReactJS',
      interfaces: [
        new Interface({
          id_interface: 1,
          label: 'interface',
          default_label: 'default',
          registry_link: 'registry.io/test:yo',
          exec_command: '/bin/bash',
          service_command: '-c /var/launch.sh',
          privileged: false,
          readiness_probe_initial_delay: 6,
          liveness_probe_initial_delay: 100,
          readiness_period_probe: 6,
          liveness_period_probe: 100,
          id_type: 3,
          label_type_image: 'osx',
          need_compute_gpu: false,
          need_graphical_rendering_gpu: false,
          ram_request: '300Mi',
          ram_limit: '400Mi',
          cpu_request: '2',
          cpu_limit: '4',
          args: [],
          node_selectors: [],
          ports: [],
          envs: [],
        }),
      ],
    });
    chai.expect(env.interfaces).to.deep.equal([
      new Interface({
        id_interface: 1,
        label: 'interface',
        default_label: 'default',
        registry_link: 'registry.io/test:yo',
        exec_command: '/bin/bash',
        service_command: '-c /var/launch.sh',
        privileged: false,
        readiness_probe_initial_delay: 6,
        liveness_probe_initial_delay: 100,
        readiness_period_probe: 6,
        liveness_period_probe: 100,
        id_type: 3,
        label_type_image: 'osx',
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        ram_request: '300Mi',
        ram_limit: '400Mi',
        cpu_request: '2',
        cpu_limit: '4',
        args: [],
        node_selectors: [],
        ports: [],
        envs: [],
      }),
    ]);
    chai.expect(env.id_environment).to.equal(3);
    chai.expect(env.label).to.be.equal('ReactJS');
  });
  it('creates, updates and checks value of Environment object.', () => {
    const env = new Environment({
      id_environment: 3,
      icon: 'ereteret',
      label: 'ReactJS',
      interfaces: [
        new Interface({
          id_interface: 1,
          label: 'interface',
          default_label: 'default',
          registry_link: 'registry.io/test:yo',
          exec_command: '/bin/bash',
          service_command: '-c /var/launch.sh',
          privileged: false,
          readiness_probe_initial_delay: 6,
          liveness_probe_initial_delay: 100,
          readiness_period_probe: 6,
          liveness_period_probe: 100,
          id_type: 3,
          label_type_image: 'osx',
          need_compute_gpu: false,
          need_graphical_rendering_gpu: false,
          ram_request: '300Mi',
          ram_limit: '400Mi',
          cpu_request: '2',
          cpu_limit: '4',
          args: [],
          node_selectors: [],
          ports: [],
          envs: [],
        }),
      ],
    });
    chai.expect(env.interfaces).to.deep.equal([
      new Interface({
        id_interface: 1,
        label: 'interface',
        default_label: 'default',
        registry_link: 'registry.io/test:yo',
        exec_command: '/bin/bash',
        service_command: '-c /var/launch.sh',
        privileged: false,
        readiness_probe_initial_delay: 6,
        liveness_probe_initial_delay: 100,
        readiness_period_probe: 6,
        liveness_period_probe: 100,
        id_type: 3,
        label_type_image: 'osx',
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        ram_request: '300Mi',
        ram_limit: '400Mi',
        cpu_request: '2',
        cpu_limit: '4',
        args: [],
        node_selectors: [],
        ports: [],
        envs: [],
      }),
    ]);
    chai.expect(env.id_environment).to.equal(3);
    chai.expect(env.label).to.be.equal('ReactJS');
    env.interfaces = [
      new Interface({
        id_interface: 3,
        label: 'interface',
        default_label: 'default',
        registry_link: 'registry.io/test:yo',
        exec_command: '/bin/bash',
        service_command: '-c /var/launch.sh',
        privileged: false,
        readiness_probe_initial_delay: 6,
        liveness_probe_initial_delay: 100,
        readiness_period_probe: 6,
        liveness_period_probe: 100,
        id_type: 3,
        label_type_image: 'osx',
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        ram_request: '300Mi',
        ram_limit: '400Mi',
        cpu_request: '2',
        cpu_limit: '4',
        args: [],
        node_selectors: [],
        ports: [],
        envs: [],
      }),
    ];
    chai.expect(env.interfaces).to.deep.equal([
      new Interface({
        id_interface: 3,
        label: 'interface',
        default_label: 'default',
        registry_link: 'registry.io/test:yo',
        exec_command: '/bin/bash',
        service_command: '-c /var/launch.sh',
        privileged: false,
        readiness_probe_initial_delay: 6,
        liveness_probe_initial_delay: 100,
        readiness_period_probe: 6,
        liveness_period_probe: 100,
        id_type: 3,
        label_type_image: 'osx',
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        ram_request: '300Mi',
        ram_limit: '400Mi',
        cpu_request: '2',
        cpu_limit: '4',
        args: [],
        node_selectors: [],
        ports: [],
        envs: [],
      }),
    ]);
    env.id_environment = 2;
    chai.expect(env.id_environment).to.equal(2);
    env.label = 'label';
    chai.expect(env.label).to.be.equal('label');
  });
  it('creates the Environment object and test fetchInterfaces.', async () => {
    fakeGet.resolves(
      Promise.resolve(
        new Environment({
          id_environment: 3,
          label: 'ReactJS',
          icon: 'ereteret',
          interfaces: [
            new Interface({
              id_interface: 1,
              label: 'interface',
              default_label: 'default',
              registry_link: 'registry.io/test:yo',
              exec_command: '/bin/bash',
              service_command: '-c /var/launch.sh',
              privileged: false,
              readiness_probe_initial_delay: 6,
              liveness_probe_initial_delay: 100,
              readiness_period_probe: 6,
              liveness_period_probe: 100,
              id_type: 3,
              label_type_image: 'osx',
              need_compute_gpu: false,
              need_graphical_rendering_gpu: false,
              ram_request: '300Mi',
              ram_limit: '400Mi',
              cpu_request: '2',
              cpu_limit: '4',
              args: [],
              node_selectors: [],
              ports: [],
              envs: [],
            }),
          ],
        })
      )
    );
    let env = new Environment({
      id_environment: 3,
      label: 'ReactJS',
      icon: 'ereteret',
      interfaces: [],
    });
    env = await Promise.resolve(
      env.fetchInterfaces({ environment_get: fakeGet })
    );
    chai.expect(env.interfaces).to.deep.equal([
      new Interface({
        id_interface: 1,
        label: 'interface',
        default_label: 'default',
        registry_link: 'registry.io/test:yo',
        exec_command: '/bin/bash',
        service_command: '-c /var/launch.sh',
        privileged: false,
        readiness_probe_initial_delay: 6,
        liveness_probe_initial_delay: 100,
        readiness_period_probe: 6,
        liveness_period_probe: 100,
        id_type: 3,
        label_type_image: 'osx',
        need_compute_gpu: false,
        need_graphical_rendering_gpu: false,
        ram_request: '300Mi',
        ram_limit: '400Mi',
        cpu_request: '2',
        cpu_limit: '4',
        args: [],
        node_selectors: [],
        ports: [],
        envs: [],
      }),
    ]);
  });
});
