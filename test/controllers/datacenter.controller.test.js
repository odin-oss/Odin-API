import * as datacenter_controller from '../../src/controllers/datacenter.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  BadCredentials,
  DBConnexionRefused,
} from '../../src/utils/errors.service.js';
import CONFIG from '../../src/config/config.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
chai.use(sinonChai);

describe('datacenter.controller.list()', () => {
  let fakeList, fakeRes, fakeReq;
  beforeEach(() => {
    fakeList = sinon.stub();
    fakeReq = {
      method: 'GET',
      originalUrl: '/datacenter/list',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should send the list of datacenters.', async () => {
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
          label: 'teste',
          provider: 'prove',
          city: 'hell',
        }),
      ])
    );
    await datacenter_controller.list(fakeReq, fakeRes, {
      datacenter_list: fakeList,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: [
        {
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        },
        {
          id_datacenter: 2,
          label: 'teste',
          provider: 'prove',
          city: 'hell',
        },
      ],
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
  it('called and should reject with DBConnexionRefused.', async () => {
    try {
      fakeList.resolves(
        Promise.reject(
          new DBConnexionRefused('Connexion to the database refused.')
        )
      );
      await datacenter_controller.list(fakeReq, fakeRes, {
        datacenter_list: fakeList,
      });
    } catch (err) {
      chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
        result: {
          error: 'DBConnexionRefused',
          message: 'Connexion to the database refused.',
        },
      });
      chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    }
  });
});
