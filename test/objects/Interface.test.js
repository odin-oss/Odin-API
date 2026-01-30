import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Interface } from '../../src/objects/Interface.js';
chai.use(sinonChai);

describe('<object> Interface', () => {
  it('creates and checks value of Interface object.', () => {
    const int = new Interface({
      id_interface: 2,
      label: 'interface_label',
      default_label: 'default_label',
      registry_link: 'registry.io/image:res',
      exec_command: '/bin/bash',
      service_command: '-c sh /var/launch.sh',
      privileged: false,
      readiness_probe_initial_delay: 100,
      liveness_probe_initial_delay: 200,
      readiness_probe_period: 10,
      liveness_probe_period: 20,
      id_type: 4,
      label_type_image: 'osx',
      need_compute_gpu: false,
      need_graphical_rendering_gpu: false,
      ram_request: '400Mi',
      ram_limit: '1Gi',
      cpu_request: '2',
      cpu_limit: '4',
      args: [],
      node_selectors: [],
      ports: [],
      envs: [],
    });
    chai.expect(int.id_interface).to.be.equal(2);
    chai.expect(int.label).to.be.equal('interface_label');
    chai.expect(int.default_label).to.be.equal('default_label');
    chai.expect(int.registry_link).to.be.equal('registry.io/image:res');
    chai.expect(int.exec_command).to.be.equal('/bin/bash');
    chai.expect(int.service_command).to.be.equal('-c sh /var/launch.sh');
    chai.expect(int.privileged).to.be.equal(false);
    chai.expect(int.readiness_probe_initial_delay).to.be.equal(100);
    chai.expect(int.liveness_probe_initial_delay).to.be.equal(200);
    chai.expect(int.readiness_probe_period).to.be.equal(10);
    chai.expect(int.liveness_probe_period).to.be.equal(20);
    chai.expect(int.id_type).to.be.equal(4);
    chai.expect(int.label_type_image).to.be.equal('osx');
    chai.expect(int.need_compute_gpu).to.be.equal(false);
    chai.expect(int.need_graphical_rendering_gpu).to.be.equal(false);
    chai.expect(int.ram_request).to.be.equal('400Mi');
    chai.expect(int.ram_limit).to.be.equal('1Gi');
    chai.expect(int.cpu_request).to.be.equal('2');
    chai.expect(int.cpu_limit).to.be.equal('4');
    chai.expect(int.args).to.deep.equal([]);
    chai.expect(int.node_selectors).to.deep.equal([]);
    chai.expect(int.ports).to.deep.equal([]);
    chai.expect(int.envs).to.deep.equal([]);
    chai.expect(int.toJSON()).to.deep.equal({
      id_interface: 2,
      label: 'interface_label',
      default_label: 'default_label',
      registry_link: 'registry.io/image:res',
      exec_command: '/bin/bash',
      service_command: '-c sh /var/launch.sh',
      privileged: false,
      readiness_probe_initial_delay: 100,
      liveness_probe_initial_delay: 200,
      readiness_probe_period: 10,
      liveness_probe_period: 20,
      id_type: 4,
      label_type_image: 'osx',
      need_compute_gpu: false,
      need_graphical_rendering_gpu: false,
      ram_request: '400Mi',
      ram_limit: '1Gi',
      cpu_request: '2',
      cpu_limit: '4',
      args: [],
      envs: [],
      node_selectors: [],
      ports: [],
    });
  });
  it('creates, updates and checks value of Interface object.', () => {
    const int = new Interface({
      id_interface: 2,
      label: 'interface_label',
      default_label: 'default_label',
      registry_link: 'registry.io/image:res',
      exec_command: '/bin/bash',
      service_command: '-c sh /var/launch.sh',
      privileged: false,
      readiness_probe_initial_delay: 100,
      liveness_probe_initial_delay: 200,
      readiness_probe_period: 10,
      liveness_probe_period: 20,
      id_type: 4,
      label_type_image: 'osx',
      need_compute_gpu: false,
      need_graphical_rendering_gpu: false,
      ram_request: '400Mi',
      ram_limit: '1Gi',
      cpu_request: '2',
      cpu_limit: '4',
      args: [],
      node_selectors: [],
      ports: [],
      envs: [],
    });

    int.id_interface = 22;
    int.label = 'interface';
    int.default_label = 'default';
    int.registry_link = 'registry.io/image:test';
    int.exec_command = '/bin/sh';
    int.service_command = '-c sh /var/test.sh';
    int.privileged = true;
    int.readiness_probe_initial_delay = 200;
    int.liveness_probe_initial_delay = 400;
    int.readiness_probe_period = 20;
    int.liveness_probe_period = 40;
    int.id_type = 1;
    int.label_type_image = 'linux';
    int.need_compute_gpu = true;
    int.need_graphical_rendering_gpu = true;
    int.ram_request = '800Mi';
    int.ram_limit = '2Gi';
    int.cpu_request = '4';
    int.cpu_limit = '8';
    int.args = ['--arg1'];
    int.node_selectors = [{ key: 'crrs-gpu=', value: '' }];
    int.ports = [{ port: 3000, id_port: 1 }];
    int.envs = [
      {
        key: 'USERNAME',
        value: '<username>',
      },
    ];

    chai.expect(int.id_interface).to.be.equal(22);
    chai.expect(int.label).to.be.equal('interface');
    chai.expect(int.default_label).to.be.equal('default');
    chai.expect(int.registry_link).to.be.equal('registry.io/image:test');
    chai.expect(int.exec_command).to.be.equal('/bin/sh');
    chai.expect(int.service_command).to.be.equal('-c sh /var/test.sh');
    chai.expect(int.privileged).to.be.equal(true);
    chai.expect(int.readiness_probe_initial_delay).to.be.equal(200);
    chai.expect(int.liveness_probe_initial_delay).to.be.equal(400);
    chai.expect(int.readiness_probe_period).to.be.equal(20);
    chai.expect(int.liveness_probe_period).to.be.equal(40);
    chai.expect(int.id_type).to.be.equal(1);
    chai.expect(int.label_type_image).to.be.equal('linux');
    chai.expect(int.need_compute_gpu).to.be.equal(true);
    chai.expect(int.need_graphical_rendering_gpu).to.be.equal(true);
    chai.expect(int.ram_request).to.be.equal('800Mi');
    chai.expect(int.ram_limit).to.be.equal('2Gi');
    chai.expect(int.cpu_request).to.be.equal('4');
    chai.expect(int.cpu_limit).to.be.equal('8');
    chai.expect(int.args).to.deep.equal(['--arg1']);
    chai
      .expect(int.node_selectors)
      .to.deep.equal([{ key: 'crrs-gpu=', value: '' }]);
    chai.expect(int.ports).to.deep.equal([{ port: 3000, id_port: 1 }]);
    chai.expect(int.envs).to.deep.equal([
      {
        key: 'USERNAME',
        value: '<username>',
      },
    ]);
  });
});
