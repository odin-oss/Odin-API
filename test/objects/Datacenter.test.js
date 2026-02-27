import * as chai from 'chai';
import { Datacenter } from '../../src/objects/Datacenter.js';

describe('Datacenter object', () => {
  it('creates with valid properties', () => {
    const datacenter = new Datacenter({
      id_datacenter: 1,
      label: 'US-East',
      provider: 'AWS',
      city: 'Virginia',
    });

    chai.expect(datacenter.id_datacenter).to.equal(1);
    chai.expect(datacenter.label).to.equal('US-East');
    chai.expect(datacenter.provider).to.equal('AWS');
    chai.expect(datacenter.city).to.equal('Virginia');
  });

  it('throws on non-positive id_datacenter', () => {
    chai.expect(() => {
      new Datacenter({ id_datacenter: -1 });
    }).to.throw();
  });

  it('throws on empty label', () => {
    chai.expect(() => {
      new Datacenter({ id_datacenter: 1, label: '' });
    }).to.throw();
  });

  it('serializes with toJSON', () => {
    const datacenter = new Datacenter({
      id_datacenter: 2,
      label: 'EU-West',
      provider: 'Azure',
      city: 'Amsterdam',
    });

    const json = datacenter.toJSON();
    chai.expect(json.id_datacenter).to.equal(2);
    chai.expect(json.label).to.equal('EU-West');
    chai.expect(json.provider).to.equal('Azure');
    chai.expect(json.city).to.equal('Amsterdam');
  });

  it('serializes with public_format', () => {
    const datacenter = new Datacenter({
      id_datacenter: 3,
      label: 'Asia-Pacific',
      provider: 'GCP',
      city: 'Singapore',
    });

    const format = datacenter.public_format();
    chai.expect(format.id_datacenter).to.equal(3);
    chai.expect(format.label).to.equal('Asia-Pacific');
    chai.expect(format.provider).to.equal('GCP');
    chai.expect(format.city).to.equal('Singapore');
  });
});
