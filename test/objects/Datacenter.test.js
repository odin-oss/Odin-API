import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { Datacenter } from '../../src/objects/Datacenter.js';
chai.use(sinonChai);

describe('<object> Datacenter', () => {
  it('creates and checks value of Datacenter object.', () => {
    const dc = new Datacenter({
      id_datacenter: 3,
      label: 'testdc',
      city: 'paradise',
      provider: 'prov',
    });
    chai.expect(dc.id_datacenter).to.be.equal(3);
    chai.expect(dc.label).to.be.equal('testdc');
    chai.expect(dc.city).to.be.equal('paradise');
    chai.expect(dc.provider).to.be.equal('prov');
  });
  it('creates, updates and checks value of Category object.', () => {
    const dc = new Datacenter({
      id_datacenter: 3,
      label: 'testdc',
      city: 'paradise',
      provider: 'prov',
    });
    dc.id_datacenter = 2;
    dc.label = 'testte';
    dc.city = 'hell';
    dc.provider = 'dc';

    chai.expect(dc.id_datacenter).to.be.equal(2);
    chai.expect(dc.label).to.be.equal('testte');
    chai.expect(dc.provider).to.be.equal('dc');
    chai.expect(dc.city).to.be.equal('hell');
  });
  it('creates and checks value of toJSON and public_format object.', () => {
    const dc = new Datacenter({
      id_datacenter: 3,
      label: 'testdc',
      city: 'paradise',
      provider: 'prov',
    });
    chai.expect(dc.id_datacenter).to.be.equal(3);
    chai.expect(dc.label).to.be.equal('testdc');
    chai.expect(dc.city).to.be.equal('paradise');
    chai.expect(dc.provider).to.be.equal('prov');
    chai.expect(dc.toJSON()).to.deep.equal({
      id_datacenter: 3,
      label: 'testdc',
      city: 'paradise',
      provider: 'prov',
    });
    chai.expect(dc.public_format()).to.deep.equal({
      id_datacenter: 3,
      label: 'testdc',
      city: 'paradise',
      provider: 'prov',
    });
  });
});
