import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import dbManager from '../../src/config/db.config.js';
import * as history_builder from '../../src/builders/history.builder.js';
import { History, Record } from '../../src/objects/History.js';
import moment from 'moment-timezone';
import CONFIG from '../../src/config/config.js';

chai.use(sinonChai);

describe('history.builder.create()', () => {
  let createStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    createStub = sinon.stub(dbManager.models.HISTORY, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create a history record with valid id_user and id_application', async () => {
    const mockDateTime = moment.tz(CONFIG.APP_TZ).utc().format();
    createStub.resolves({
      id_history: 1,
      id_user: 1,
      id_application: 1,
      datetime: mockDateTime,
    });

    const result = await history_builder.create({
      id_user: 1,
      id_application: 1,
    });

    chai.expect(createStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(History);
    chai.expect(result.records).to.have.lengthOf(1);
    chai.expect(result.records[0]).to.be.instanceOf(Record);
    chai.expect(result.records[0].id_user).to.equal(1);
    chai.expect(result.records[0].id_application).to.equal(1);
  });

  it('should create a history record with multiple calls', async () => {
    const mockDateTime = moment.tz(CONFIG.APP_TZ).utc().format();
    createStub.resolves({
      id_history: 2,
      id_user: 2,
      id_application: 3,
      datetime: mockDateTime,
    });

    const result = await history_builder.create({
      id_user: 2,
      id_application: 3,
    });

    chai.expect(createStub.calledOnce).to.be.true;
    chai.expect(result.records[0].id_user).to.equal(2);
    chai.expect(result.records[0].id_application).to.equal(3);
  });

  it('should include datetime in UTC format when creating history', async () => {
    const mockDateTime = moment.tz(CONFIG.APP_TZ).utc().format();
    createStub.resolves({
      id_history: 1,
      id_user: 1,
      id_application: 1,
      datetime: mockDateTime,
    });

    const result = await history_builder.create({
      id_user: 1,
      id_application: 1,
    });

    chai.expect(result.records[0].datetime).to.exist;
    chai.expect(moment.isMoment(result.records[0].datetime)).to.be.true;
  });

  it('should reject invalid id_user (non-positive)', async () => {
    try {
      await history_builder.create({
        id_user: 0,
        id_application: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid id_application (non-positive)', async () => {
    try {
      await history_builder.create({
        id_user: 1,
        id_application: 0,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject negative id_user', async () => {
    try {
      await history_builder.create({
        id_user: -1,
        id_application: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject negative id_application', async () => {
    try {
      await history_builder.create({
        id_user: 1,
        id_application: -5,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject missing id_user parameter', async () => {
    try {
      await history_builder.create({
        id_application: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject missing id_application parameter', async () => {
    try {
      await history_builder.create({
        id_user: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject non-numeric id_user', async () => {
    try {
      await history_builder.create({
        id_user: 'invalid',
        id_application: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject non-numeric id_application', async () => {
    try {
      await history_builder.create({
        id_user: 1,
        id_application: 'invalid',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors during creation', async () => {
    createStub.rejects(new Error('Database connection failed'));

    try {
      await history_builder.create({
        id_user: 1,
        id_application: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle null response from database', async () => {
    createStub.resolves(null);

    try {
      await history_builder.create({
        id_user: 1,
        id_application: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('history.builder.get_last_record()', () => {
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.HISTORY, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve the last history record for a user and application', async () => {
    const mockDateTime = moment.tz(CONFIG.APP_TZ);
    findOneStub.resolves({
      id_history: 1,
      id_user: 1,
      id_application: 1,
      datetime: mockDateTime,
    });

    const result = await history_builder.get_last_record({
      id_user: 1,
      id_application: 1,
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(History);
    chai.expect(result.records).to.have.lengthOf(1);
    chai.expect(result.records[0]).to.be.instanceOf(Record);
    chai.expect(result.records[0].id_user).to.equal(1);
    chai.expect(result.records[0].id_application).to.equal(1);
  });

  it('should check that findOne is called with correct limit and order', async () => {
    findOneStub.resolves({
      id_history: 5,
      id_user: 2,
      id_application: 3,
      datetime: moment.tz(CONFIG.APP_TZ),
    });

    await history_builder.get_last_record({
      id_user: 2,
      id_application: 3,
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    const callArgs = findOneStub.getCall(0).args[0];
    chai.expect(callArgs.limit).to.equal(1);
    chai.expect(callArgs.order[0][0]).to.equal('datetime');
    chai.expect(callArgs.order[0][1]).to.equal('DESC');
  });

  it('should return empty History when no record found', async () => {
    findOneStub.resolves(null);

    const result = await history_builder.get_last_record({
      id_user: 1,
      id_application: 1,
    });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(History);
    chai.expect(result.records).to.have.lengthOf(0);
  });

  it('should retrieve the last record from multiple records', async () => {
    const mockDateTime = moment.tz(CONFIG.APP_TZ);
    findOneStub.resolves({
      id_history: 10,
      id_user: 1,
      id_application: 1,
      datetime: mockDateTime,
    });

    const result = await history_builder.get_last_record({
      id_user: 1,
      id_application: 1,
    });

    chai.expect(result.records[0].id_history).to.equal(10);
  });

  it('should reject invalid id_user (non-positive)', async () => {
    try {
      await history_builder.get_last_record({
        id_user: 0,
        id_application: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject invalid id_application (non-positive)', async () => {
    try {
      await history_builder.get_last_record({
        id_user: 1,
        id_application: 0,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject negative id_user', async () => {
    try {
      await history_builder.get_last_record({
        id_user: -1,
        id_application: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject negative id_application', async () => {
    try {
      await history_builder.get_last_record({
        id_user: 1,
        id_application: -5,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject missing id_user parameter', async () => {
    try {
      await history_builder.get_last_record({
        id_application: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject missing id_application parameter', async () => {
    try {
      await history_builder.get_last_record({
        id_user: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject non-numeric id_user', async () => {
    try {
      await history_builder.get_last_record({
        id_user: 'invalid',
        id_application: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should reject non-numeric id_application', async () => {
    try {
      await history_builder.get_last_record({
        id_user: 1,
        id_application: 'invalid',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors during retrieval', async () => {
    findOneStub.rejects(new Error('Database connection failed'));

    try {
      await history_builder.get_last_record({
        id_user: 1,
        id_application: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should convert datetime to correct timezone', async () => {
    const testDate = '2026-02-26T10:00:00Z';
    findOneStub.resolves({
      id_history: 1,
      id_user: 1,
      id_application: 1,
      datetime: testDate,
    });

    const result = await history_builder.get_last_record({
      id_user: 1,
      id_application: 1,
    });

    chai.expect(moment.isMoment(result.records[0].datetime)).to.be.true;
    chai.expect(result.records[0].datetime.tz()).to.equal(CONFIG.APP_TZ);
  });

  it('should verify where clause contains correct user and application ids', async () => {
    findOneStub.resolves({
      id_history: 1,
      id_user: 42,
      id_application: 99,
      datetime: moment.tz(CONFIG.APP_TZ),
    });

    await history_builder.get_last_record({
      id_user: 42,
      id_application: 99,
    });

    const callArgs = findOneStub.getCall(0).args[0];
    chai.expect(callArgs.where.id_user).to.equal(42);
    chai.expect(callArgs.where.id_application).to.equal(99);
  });
});
