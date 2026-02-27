import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import dbManager from '../../src/config/db.config.js';
import * as datacenter_builder from '../../src/builders/datacenter.builder.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
import { DBObjectNotFound } from '../../src/utils/errors.util.js';

chai.use(sinonChai);

describe('datacenter.builder.list()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.DATACENTER, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return all datacenters from database', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_datacenter: 1,
          label: 'dc-us-east',
          provider: 'aws',
          city: 'New York',
        },
      },
      {
        dataValues: {
          id_datacenter: 2,
          label: 'dc-eu-west',
          provider: 'azure',
          city: 'Dublin',
        },
      },
    ]);

    const result = await datacenter_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(2);
    chai.expect(result[0]).to.be.instanceOf(Datacenter);
    chai.expect(result[1]).to.be.instanceOf(Datacenter);
  });

  it('should return empty array when no datacenters exist', async () => {
    findAllStub.resolves([]);

    const result = await datacenter_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });

  it('should transform database objects to Datacenter instances', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_datacenter: 1,
          label: 'dc-us-east',
          provider: 'aws',
          city: 'New York',
        },
      },
    ]);

    const result = await datacenter_builder.list();

    chai.expect(result[0]).to.be.instanceOf(Datacenter);
    chai.expect(result[0].id_datacenter).to.equal(1);
    chai.expect(result[0].label).to.equal('dc-us-east');
    chai.expect(result[0].provider).to.equal('aws');
    chai.expect(result[0].city).to.equal('New York');
  });

  it('should handle database errors', async () => {
    findAllStub.rejects(new Error('Database connection failed'));

    try {
      await datacenter_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle large dataset of datacenters', async () => {
    const largeDataset = Array.from({ length: 50 }, (_, i) => ({
      dataValues: {
        id_datacenter: i + 1,
        label: `dc-region-${i + 1}`,
        provider: 'aws',
        city: `City-${i + 1}`,
      },
    }));
    findAllStub.resolves(largeDataset);

    const result = await datacenter_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.have.lengthOf(50);
    chai.expect(result[0]).to.be.instanceOf(Datacenter);
    chai.expect(result[49]).to.be.instanceOf(Datacenter);
  });

  it('should call findAll once per invocation', async () => {
    findAllStub.resolves([]);

    await datacenter_builder.list();
    await datacenter_builder.list();

    chai.expect(findAllStub.callCount).to.equal(2);
  });
});

describe('datacenter.builder.get()', () => {
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.DATACENTER, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should get a datacenter by id', async () => {
    findOneStub.resolves({
      dataValues: {
        id_datacenter: 1,
        label: 'dc-us-east',
        provider: 'aws',
        city: 'New York',
      },
    });

    const result = await datacenter_builder.get({ id_datacenter: 1 });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Datacenter);
    chai.expect(result.id_datacenter).to.equal(1);
    chai.expect(result.label).to.equal('dc-us-east');
    chai.expect(result.provider).to.equal('aws');
    chai.expect(result.city).to.equal('New York');
  });

  it('should throw error when datacenter not found', async () => {
    findOneStub.resolves(null);

    try {
      await datacenter_builder.get({ id_datacenter: 999 });
      chai.expect.fail('Should have thrown DBObjectNotFound error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });

  it('should validate id_datacenter is positive integer', async () => {
    try {
      await datacenter_builder.get({ id_datacenter: -1 });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate id_datacenter is a number', async () => {
    try {
      await datacenter_builder.get({ id_datacenter: 'not-a-number' });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors', async () => {
    findOneStub.rejects(new Error('Database connection failed'));

    try {
      await datacenter_builder.get({ id_datacenter: 1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should require id_datacenter parameter', async () => {
    try {
      await datacenter_builder.get({});
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('datacenter.builder.create()', () => {
  let createStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    createStub = sinon.stub(dbManager.models.DATACENTER, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create a datacenter with valid data', async () => {
    createStub.resolves({
      dataValues: {
        id_datacenter: 1,
        label: 'dc-us-east',
        provider: 'aws',
        city: 'New York',
      },
    });

    const result = await datacenter_builder.create({
      label: 'DC-US-EAST',
      provider: 'AWS',
      city: 'New York',
    });

    chai.expect(createStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Datacenter);
    chai.expect(result.label).to.equal('dc-us-east');
    chai.expect(result.provider).to.equal('aws');
  });

  it('should preprocess label to lowercase and remove special chars', async () => {
    createStub.resolves({
      dataValues: {
        id_datacenter: 1,
        label: 'dc-us-east',
        provider: 'aws',
        city: 'New York',
      },
    });

    await datacenter_builder.create({
      label: 'DC@US#EAST!',
      provider: 'AWS',
      city: 'New York',
    });

    const callArgs = createStub.getCall(0).args[0];
    chai.expect(callArgs.label).to.equal('dcuseast');
  });

  it('should preprocess provider to lowercase and remove special chars', async () => {
    createStub.resolves({
      dataValues: {
        id_datacenter: 1,
        label: 'dc-us-east',
        provider: 'aws',
        city: 'New York',
      },
    });

    await datacenter_builder.create({
      label: 'DC-US-EAST',
      provider: 'AWS@123',
      city: 'New York',
    });

    const callArgs = createStub.getCall(0).args[0];
    chai.expect(callArgs.provider).to.equal('aws123');
  });

  it('should validate label is minimum 2 characters (after preprocessing)', async () => {
    try {
      await datacenter_builder.create({
        label: 'A',
        provider: 'AWS',
        city: 'New York',
      });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate city is minimum 2 characters', async () => {
    try {
      await datacenter_builder.create({
        label: 'DC-US-EAST',
        provider: 'AWS',
        city: 'A',
      });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate provider is minimum 2 characters (after preprocessing)', async () => {
    try {
      await datacenter_builder.create({
        label: 'DC-US-EAST',
        provider: 'A',
        city: 'New York',
      });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors', async () => {
    createStub.rejects(new Error('Database connection failed'));

    try {
      await datacenter_builder.create({
        label: 'DC-US-EAST',
        provider: 'AWS',
        city: 'New York',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should require all parameters', async () => {
    try {
      await datacenter_builder.create({
        label: 'DC-US-EAST',
        provider: 'AWS',
      });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('datacenter.builder.update()', () => {
  let updateStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    updateStub = sinon.stub(dbManager.models.DATACENTER, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update datacenter with valid data', async () => {
    updateStub.resolves([1]);

    const mockGetFn = sinon.stub().resolves(
      new Datacenter({
        id_datacenter: 1,
        label: 'dc-updated',
        provider: 'azure',
        city: 'Dublin',
      })
    );

    const result = await datacenter_builder.update(
      {
        id_datacenter: 1,
        label: 'DC-UPDATED',
        provider: 'AZURE',
        city: 'Dublin',
      },
      { get: mockGetFn }
    );

    chai.expect(updateStub.calledOnce).to.be.true;
    chai.expect(mockGetFn.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Datacenter);
  });

  it('should preprocess label and provider during update', async () => {
    updateStub.resolves([1]);

    const mockGetFn = sinon.stub().resolves(
      new Datacenter({
        id_datacenter: 1,
        label: 'dc-updated',
        provider: 'azure',
        city: 'Dublin',
      })
    );

    await datacenter_builder.update(
      {
        id_datacenter: 1,
        label: 'DC@UPDATED!',
        provider: 'AZURE#123',
        city: 'Dublin',
      },
      { get: mockGetFn }
    );

    const callArgs = updateStub.getCall(0).args[0];
    chai.expect(callArgs.label).to.equal('dcupdated');
    chai.expect(callArgs.provider).to.equal('azure123');
  });

  it('should validate id_datacenter is positive integer', async () => {
    try {
      await datacenter_builder.update(
        {
          id_datacenter: -1,
          label: 'DC-UPDATED',
          provider: 'AZURE',
          city: 'Dublin',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate label is minimum 2 characters (after preprocessing)', async () => {
    try {
      await datacenter_builder.update(
        {
          id_datacenter: 1,
          label: 'A',
          provider: 'AZURE',
          city: 'Dublin',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate city is minimum 2 characters', async () => {
    try {
      await datacenter_builder.update(
        {
          id_datacenter: 1,
          label: 'DC-UPDATED',
          provider: 'AZURE',
          city: 'A',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate provider is minimum 2 characters (after preprocessing)', async () => {
    try {
      await datacenter_builder.update(
        {
          id_datacenter: 1,
          label: 'DC-UPDATED',
          provider: 'A',
          city: 'Dublin',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors', async () => {
    updateStub.rejects(new Error('Database connection failed'));

    try {
      await datacenter_builder.update(
        {
          id_datacenter: 1,
          label: 'DC-UPDATED',
          provider: 'AZURE',
          city: 'Dublin',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should call get function with data params', async () => {
    updateStub.resolves([1]);

    const mockGetFn = sinon.stub().resolves(
      new Datacenter({
        id_datacenter: 1,
        label: 'dc-updated',
        provider: 'azure',
        city: 'Dublin',
      })
    );

    const props = {
      id_datacenter: 1,
      label: 'DC-UPDATED',
      provider: 'AZURE',
      city: 'Dublin',
    };

    await datacenter_builder.update(props, { get: mockGetFn });

    chai.expect(mockGetFn.calledOnce).to.be.true;
    const callArgs = mockGetFn.getCall(0).args[0];
    chai.expect(callArgs.id_datacenter).to.equal(1);
  });

  it('should require all parameters', async () => {
    try {
      await datacenter_builder.update(
        {
          id_datacenter: 1,
          label: 'DC-UPDATED',
          provider: 'AZURE',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('datacenter.builder.del()', () => {
  let findOneStub;
  let destroyStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.DATACENTER, 'findOne');
    destroyStub = sinon.stub(dbManager.models.DATACENTER, 'destroy');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should delete a datacenter', async () => {
    findOneStub.resolves({
      dataValues: {
        id_datacenter: 1,
        label: 'dc-us-east',
        provider: 'aws',
        city: 'New York',
      },
    });
    destroyStub.resolves(1);

    const result = await datacenter_builder.del({ id_datacenter: 1 });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(destroyStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Datacenter);
    chai.expect(result.id_datacenter).to.equal(1);
    chai.expect(result.label).to.equal('dc-us-east');
  });

  it('should throw error when datacenter not found', async () => {
    findOneStub.resolves(null);

    try {
      await datacenter_builder.del({ id_datacenter: 999 });
      chai.expect.fail('Should have thrown DBObjectNotFound error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });

  it('should validate id_datacenter is positive integer', async () => {
    try {
      await datacenter_builder.del({ id_datacenter: -1 });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate id_datacenter is a number', async () => {
    try {
      await datacenter_builder.del({ id_datacenter: 'not-a-number' });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors', async () => {
    findOneStub.rejects(new Error('Database connection failed'));

    try {
      await datacenter_builder.del({ id_datacenter: 1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle destroy database errors', async () => {
    findOneStub.resolves({
      dataValues: {
        id_datacenter: 1,
        label: 'dc-us-east',
        provider: 'aws',
        city: 'New York',
      },
    });
    destroyStub.rejects(new Error('Database connection failed'));

    try {
      await datacenter_builder.del({ id_datacenter: 1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should return the deleted datacenter object', async () => {
    findOneStub.resolves({
      dataValues: {
        id_datacenter: 2,
        label: 'dc-eu-west',
        provider: 'azure',
        city: 'Dublin',
      },
    });
    destroyStub.resolves(1);

    const result = await datacenter_builder.del({ id_datacenter: 2 });

    chai.expect(result.id_datacenter).to.equal(2);
    chai.expect(result.label).to.equal('dc-eu-west');
    chai.expect(result.provider).to.equal('azure');
    chai.expect(result.city).to.equal('Dublin');
  });
});
