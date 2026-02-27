import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as datacenter_service from '../../src/services/datacenter.service.js';

chai.use(sinonChai);

describe('datacenter.service.list()', () => {
  it('should list all datacenters successfully', async () => {
    const mockDatacenters = [
      { id_datacenter: 1, label: 'DC1', city: 'Paris', provider: 'AWS' },
      { id_datacenter: 2, label: 'DC2', city: 'London', provider: 'Azure' },
    ];
    const mockDatacenterList = sinon.stub().resolves(mockDatacenters);

    const result = await datacenter_service.list({
      datacenter_list: mockDatacenterList,
    });

    chai.expect(result).to.deep.equal(mockDatacenters);
    chai.expect(mockDatacenterList.calledOnce).to.be.true;
  });

  it('should return empty array when no datacenters exist', async () => {
    const mockDatacenterList = sinon.stub().resolves([]);

    const result = await datacenter_service.list({
      datacenter_list: mockDatacenterList,
    });

    chai.expect(result).to.deep.equal([]);
    chai.expect(mockDatacenterList.calledOnce).to.be.true;
  });

  it('should propagate error when builder throws', async () => {
    const mockError = new Error('Database error');
    const mockDatacenterList = sinon.stub().rejects(mockError);

    try {
      await datacenter_service.list({
        datacenter_list: mockDatacenterList,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err.message).to.equal('Database error');
    }
  });
});

describe('datacenter.service.create()', () => {
  it('should create datacenter successfully', async () => {
    const mockNewDatacenter = {
      id_datacenter: 1,
      label: 'New DC',
      city: 'Berlin',
      provider: 'GCP',
    };
    const mockCreate = sinon.stub().resolves(mockNewDatacenter);

    const result = await datacenter_service.create(
      {
        label: 'New DC',
        city: 'Berlin',
        provider: 'GCP',
      },
      { dc_create: mockCreate }
    );

    chai.expect(result).to.deep.equal(mockNewDatacenter);
    chai.expect(mockCreate.calledOnce).to.be.true;
  });

  it('should throw error when label is less than 2 characters', async () => {
    try {
      await datacenter_service.create({
        label: 'a',
        city: 'Berlin',
        provider: 'GCP',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when city is less than 2 characters', async () => {
    try {
      await datacenter_service.create({
        label: 'New DC',
        city: 'B',
        provider: 'GCP',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when provider is less than 2 characters', async () => {
    try {
      await datacenter_service.create({
        label: 'New DC',
        city: 'Berlin',
        provider: 'G',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when required fields are missing', async () => {
    try {
      await datacenter_service.create({
        label: 'New DC',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('datacenter.service.update()', () => {
  it('should update datacenter successfully', async () => {
    const mockUpdatedDatacenter = {
      id_datacenter: 1,
      label: 'Updated DC',
      city: 'Amsterdam',
      provider: 'DigitalOcean',
    };
    const mockUpdate = sinon.stub().resolves(mockUpdatedDatacenter);

    const result = await datacenter_service.update(
      {
        id_datacenter: 1,
        label: 'Updated DC',
        city: 'Amsterdam',
        provider: 'DigitalOcean',
      },
      { dc_update: mockUpdate }
    );

    chai.expect(result).to.deep.equal(mockUpdatedDatacenter);
    chai.expect(mockUpdate.calledOnce).to.be.true;
  });

  it('should throw error when id_datacenter is not positive', async () => {
    try {
      await datacenter_service.update({
        id_datacenter: 0,
        label: 'Updated DC',
        city: 'Amsterdam',
        provider: 'DigitalOcean',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when label is less than 2 characters', async () => {
    try {
      await datacenter_service.update({
        id_datacenter: 1,
        label: 'a',
        city: 'Amsterdam',
        provider: 'DigitalOcean',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('datacenter.service.del()', () => {
  it('should delete datacenter successfully', async () => {
    const mockDeletedDatacenter = {
      id_datacenter: 1,
      label: 'Deleted DC',
    };
    const mockDelete = sinon.stub().resolves(mockDeletedDatacenter);

    const result = await datacenter_service.del(
      { id_datacenter: 1 },
      { del: mockDelete }
    );

    chai.expect(result).to.deep.equal(mockDeletedDatacenter);
    chai.expect(mockDelete.calledOnce).to.be.true;
  });

  it('should throw error when id_datacenter is not positive', async () => {
    try {
      await datacenter_service.del({ id_datacenter: -1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_datacenter is zero', async () => {
    try {
      await datacenter_service.del({ id_datacenter: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('datacenter.service.get()', () => {
  it('should get datacenter by id successfully', async () => {
    const mockDatacenter = {
      id_datacenter: 1,
      label: 'DC1',
      city: 'Paris',
      provider: 'AWS',
    };
    const mockGet = sinon.stub().resolves(mockDatacenter);

    const result = await datacenter_service.get(
      { id_datacenter: 1 },
      { dc_get: mockGet }
    );

    chai.expect(result).to.deep.equal(mockDatacenter);
    chai.expect(mockGet.calledOnce).to.be.true;
  });

  it('should throw error when id_datacenter is not positive', async () => {
    try {
      await datacenter_service.get({ id_datacenter: -1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_datacenter is zero', async () => {
    try {
      await datacenter_service.get({ id_datacenter: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_datacenter is missing', async () => {
    try {
      await datacenter_service.get({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
