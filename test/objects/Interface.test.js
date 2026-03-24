import * as chai from 'chai';
import { Interface } from '../../src/objects/Interface.js';
import Argument from '../../src/objects/Argument.js';
import NodeSelector from '../../src/objects/NodeSelector.js';
import Port from '../../src/objects/Port.js';
import PortType from '../../src/objects/Port_type.js';
import VariableEnvironment from '../../src/objects/Variable_environment.js';
import { ImageType } from '../../src/objects/Image_type.js';

describe('Interface object', () => {
  it('creates with valid properties and sanitizes label', () => {
    const portType = new PortType({ id_port_type: 1, label: 'http' });
    const iface = new Interface({
      id_interface: 1,
      label: 'My_Label!!',
      default_label: 'Default',
      registry_link: 'registry/app:1.0.0',
      exec_command: 'bash',
      service_command: 'run',
      privileged: 'TRUE',
      readiness_probe_initial_delay: 5,
      liveness_probe_initial_delay: 5,
      readiness_probe_period: 10,
      liveness_probe_period: 10,
      type: new ImageType({
        id_type: 2,
        label: 'docker',
      }),
      need_compute_gpu: 'false',
      need_graphical_rendering_gpu: 'true',
      ram_request: '512Mi',
      ram_limit: '1Gi',
      cpu_request: '250m',
      cpu_limit: 1,
      egress_bandwidth: '10M',
      ingress_bandwidth: '10M',
      args: [new Argument({ value: '--help' })],
      node_selectors: [new NodeSelector({ key: 'key', value: 'value' })],
      ports: [new Port({ port: 8080, label: 'HTTP', port_type: portType })],
      envs: [new VariableEnvironment({ key: 'ENV', value: 'VALUE' })],
    });

    chai.expect(iface.label).to.equal('mylabel');
    chai.expect(iface.privileged).to.equal(true);
    chai.expect(iface.need_graphical_rendering_gpu).to.equal(true);
    chai.expect(iface.args).to.have.lengthOf(1);
    chai.expect(iface.ports).to.have.lengthOf(1);
    chai.expect(iface.envs).to.have.lengthOf(1);
  });

  it('throws on invalid ram_request', () => {
    chai
      .expect(() => {
        new Interface({ label: 'ok', ram_request: '10GB' });
      })
      .to.throw();
  });

  it('serializes to JSON', () => {
    const iface = new Interface({ label: 'ValidLabel' });

    const json = iface.toJSON();
    chai.expect(json.label).to.equal('validlabel');
    chai.expect(json.ports).to.deep.equal([]);
  });

  it('serializes with public_format', () => {
    const iface = new Interface({
      id_interface: 2,
      label: 'PublicInterface',
      type: new ImageType({
        id_type: 1,
        label: 'docker',
      }),
    });

    const format = iface.public_format();
    chai.expect(format.id_interface).to.equal(2);
    chai.expect(format.label).to.equal('publicinterface');
    chai.expect(format.type.label).to.equal('docker');
  });
});
