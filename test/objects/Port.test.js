import * as chai from 'chai';
import Port from '../../src/objects/Port.js';
import PortType from '../../src/objects/Port_type.js';

describe('Port object', () => {
	it('creates with valid properties', () => {
		const portType = new PortType({ id_port_type: 1, label: 'http' });
		const port = new Port({
			id_port_type: 1,
			port: 8080,
			label: 'HTTP',
			display_name: 'Web',
			icon: 'icon',
			port_type: portType,
		});

		chai.expect(port.id_port_type).to.equal(1);
		chai.expect(port.port).to.equal(8080);
		chai.expect(port.label).to.equal('HTTP');
		chai.expect(port.port_type).to.equal(portType);
	});

	it('throws on invalid port', () => {
		chai.expect(() => {
			new Port({ port: -1 });
		}).to.throw();
	});

	it('serializes to JSON', () => {
		const portType = new PortType({ id_port_type: 2, label: 'ssh' });
		const port = new Port({
			id_port_type: 2,
			port: 22,
			label: 'SSH',
			port_type: portType,
		});

		chai.expect(port.toJSON()).to.deep.equal({
			id_port_type: 2,
			port: 22,
			label: 'SSH',
			port_type: portType,
			icon: undefined,
			display_name: undefined,
		});
	});
});
