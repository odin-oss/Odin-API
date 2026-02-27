import * as chai from 'chai';
import PortType from '../../src/objects/Port_type.js';

describe('PortType object', () => {
  it('creates with valid properties', () => {
    const type = new PortType({ id_port_type: '3', label: 'http' });

    chai.expect(type.id_port_type).to.equal(3);
    chai.expect(type.label).to.equal('http');
  });

  it('throws on invalid id_port_type', () => {
    chai
      .expect(() => {
        new PortType({ id_port_type: -2 });
      })
      .to.throw();
  });

  it('serializes to JSON', () => {
    const type = new PortType({ id_port_type: 1, label: 'ssh' });

    chai.expect(type.toJSON()).to.deep.equal({
      id_port_type: 1,
      label: 'ssh',
    });
  });
});
