import * as datacenter_service from '../../src/services/datacenter.service.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Datacenter } from '../../src/objects/Datacenter.js';
chai.use(sinonChai);

describe('datacenter.service.list()', () => {
  let fakeList;
  beforeEach(() => {
    fakeList = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should return a list of datacenters.', async () => {
    fakeList.resolves(
      Promise.resolve([
        new Datacenter({
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        }),
        new Datacenter({
          id_datacenter: 2,
          label: 'testte',
          provider: 'prove',
          city: 'hell',
        }),
      ])
    );
    const dcs = await Promise.resolve(
      datacenter_service.list({
        datacenter_list: fakeList,
      })
    );
    chai.expect(dcs).to.deep.equal([
      new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      }),
      new Datacenter({
        id_datacenter: 2,
        label: 'testte',
        provider: 'prove',
        city: 'hell',
      }),
    ]);
  });
});
