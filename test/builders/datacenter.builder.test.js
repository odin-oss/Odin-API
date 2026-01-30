import * as datacenter_builder from '../../src/builders/datacenter.builder.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Datacenter } from '../../src/objects/Datacenter.js';
import {
  DBConnexionRefused,
  DBObjectNotFound,
  MissingArgumentError,
  ParameterMisformed,
} from '../../src/utils/errors.service.js';
import db from '../../src/config/db.config.js';
import { Sequelize } from 'sequelize';
chai.use(sinonChai);

describe('datacenter.builder.list()', () => {
  let fakeDatacenterFindAll;
  beforeEach(() => {
    fakeDatacenterFindAll = sinon.stub(db.cirrus.DATACENTER, 'findAll');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should fetch the whole list of datacenters.', async () => {
    fakeDatacenterFindAll.resolves(
      Promise.resolve([
        {
          id_datacenter: 1,
          label: 'testdc',
          provider: 'prov',
          city: 'paradise',
        },
        {
          id_datacenter: 2,
          label: 'testdctwo',
          provider: 'prove',
          city: 'hell',
        },
      ])
    );
    const dcs = await datacenter_builder.list();
    chai.expect(dcs).to.be.deep.eql([
      new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      }),
      new Datacenter({
        id_datacenter: 2,
        label: 'testdctwo',
        provider: 'prove',
        city: 'hell',
      }),
    ]);
  });
  it('should get ConnectionRefusedError', async () => {
    try {
      fakeDatacenterFindAll.resolves(
        Promise.reject(new Sequelize.ConnectionRefusedError())
      );
      await datacenter_builder.list();
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
      chai.expect(err.message).to.be.eql('Connexion to the database refused.');
    }
  });
});
describe('datacenter.builder.get()', () => {
  let fakeDatacenterFindOne;
  beforeEach(() => {
    fakeDatacenterFindOne = sinon.stub(db.cirrus.DATACENTER, 'findOne');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should fetch the correct datacenter.', async () => {
    fakeDatacenterFindOne.resolves(
      Promise.resolve({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      })
    );
    const dc = await datacenter_builder.get({
      id_datacenter: 1,
    });
    chai.expect(dc).to.be.deep.eql(
      new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      })
    );
  });
  it('should reject an MissingArgumentError', async () => {
    try {
      await datacenter_builder.get({});

      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeDatacenterFindOne).to.have.not.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_datacenter) are missing.');
    }
  });
  it('should reject an ParameterMisformed error', async () => {
    try {
      await datacenter_builder.get({ id_datacenter: 'test' });

      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeDatacenterFindOne).to.have.not.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_datacenter parameter is misformed.');
    }
  });
  it('should reject an DBObjectNotFound error', async () => {
    try {
      fakeDatacenterFindOne.resolves(Promise.resolve(null));
      await datacenter_builder.get({ id_datacenter: 1 });

      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The datacenter could not be found.');
    }
  });
});
