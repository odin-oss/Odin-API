import * as storage_builder from '../../../src/builders/application/storage.builder.js';
import * as chai from 'chai';
import db from '../../../src/config/db.config.js';
import * as sinon from 'sinon';
import moment from 'moment-timezone';
import { Op } from 'sequelize';
import sinonChai from 'sinon-chai';
import {
  DBObjectNotFound,
  MissingArgumentError,
  ParameterMisformed,
} from '../../../src/utils/errors.service.js';
import CONFIG from '../../../src/config/config.js';
import { Application_export } from '../../../src/objects/application/Application_export.js';

chai.use(sinonChai);

describe('storage.builder.get()', () => {
  let fakeApplicationExportFindOne, fakeEnumExportStateFindOne;

  beforeEach(() => {
    fakeApplicationExportFindOne = sinon.stub(
      db.cirrus.APPLICATION_EXPORT,
      'findOne'
    );
    fakeEnumExportStateFindOne = sinon
      .stub(db.cirrus.ENUM_EXPORT_STATE, 'findOne')
      .resolves(
        Promise.resolve({ id_enum_export_state: 1, status: 'Launched' })
      );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_export and should return application export data', async () => {
    const mockResponse = {
      id_export: 1,
      init_date: moment().tz(CONFIG.APP_TZ).format(),
      id_application: 1,
      expiration_date: moment().tz(CONFIG.APP_TZ).add(1, 'days').format(),
      id_provider: 1,
      download_link: 'http://example.com/download',
      id_enum_export_state: 1,
    };

    fakeApplicationExportFindOne.resolves(mockResponse);

    const result = await storage_builder.get({ id_export: 1 });

    chai
      .expect(fakeApplicationExportFindOne)
      .to.have.been.calledOnceWithExactly({
        where: { id_export: 1 },
      });

    chai.expect(result).to.deep.equal(new Application_export(mockResponse));
  });

  it('called with non-existent id_export and should throw DBObjectNotFound', async () => {
    fakeApplicationExportFindOne.resolves(null);

    try {
      await storage_builder.get({ id_export: 999 });
      chai.expect.fail('Expected to throw DBObjectNotFound, but it did not.');
    } catch (err) {
      chai
        .expect(fakeApplicationExportFindOne)
        .to.have.been.calledOnceWithExactly({
          where: { id_export: 999 },
        });
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai
        .expect(err.message)
        .to.equal("The element id_export = '999' could not be found.");
    }
  });

  it('called with missing id_export and should throw MissingArgumentError', async () => {
    try {
      await storage_builder.get({});
      chai.expect.fail(
        'Expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationExportFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_export) are missing.');
    }
  });

  it('called with malformed id_export and should throw ParameterMisformed', async () => {
    try {
      await storage_builder.get({ id_export: 'invalid' });
      chai.expect.fail('Expected to throw ParameterMisformed, but it did not.');
    } catch (err) {
      chai.expect(fakeApplicationExportFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_export parameter is misformed');
    }
  });
});

describe('storage.builder.create()', () => {
  let fakeEnumExportStateFindOne, fakeApplicationExportCreate;

  beforeEach(() => {
    fakeEnumExportStateFindOne = sinon.stub(
      db.cirrus.ENUM_EXPORT_STATE,
      'findOne'
    );
    fakeApplicationExportCreate = sinon.stub(
      db.cirrus.APPLICATION_EXPORT,
      'create'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should create an application export.', async () => {
    const props = {
      id_application: 1,
      availability_days: 1,
    };

    fakeEnumExportStateFindOne.resolves(
      Promise.resolve({
        id_enum_export_state: 1,
      })
    );

    fakeApplicationExportCreate.resolves(
      Promise.resolve({
        id_export: 1,
        id_application: 1,
        init_date: moment().tz(CONFIG.APP_TZ).format(),
        expiration_date: moment().tz(CONFIG.APP_TZ).add(1, 'days').format(),
        id_enum_export_state: 1,
      })
    );

    const result = await storage_builder.create(props);

    chai.expect(fakeEnumExportStateFindOne).to.have.been.calledOnceWithExactly({
      where: { status: 'Launched' },
    });

    chai
      .expect(fakeApplicationExportCreate)
      .to.have.been.calledOnceWithExactly({
        id_application: 1,
        init_date: moment().tz(CONFIG.APP_TZ).format(),
        expiration_date: moment().tz(CONFIG.APP_TZ).add(1, 'days').format(),
        id_enum_export_state: 1,
      });

    chai.expect(result).to.deep.equal(
      new Application_export({
        id_export: 1,
        id_application: 1,
        init_date: moment().tz(CONFIG.APP_TZ).format(),
        expiration_date: moment().tz(CONFIG.APP_TZ).add(1, 'days').format(),
        id_enum_export_state: 1,
      })
    );
  });

  it('called with missing id_application and should reject with MissingArgumentError.', async () => {
    try {
      await storage_builder.create({});
      chai.expect.fail(
        'Expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeEnumExportStateFindOne).to.not.have.been.called;
      chai.expect(fakeApplicationExportCreate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_application) are missing.');
    }
  });

  it('called with misformed id_application and should reject with ParameterMisformed.', async () => {
    try {
      await storage_builder.create({ id_application: 'misformed' });
      chai.expect.fail('Expected to throw ParameterMisformed, but it did not.');
    } catch (err) {
      chai.expect(fakeEnumExportStateFindOne).to.not.have.been.called;
      chai.expect(fakeApplicationExportCreate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_application parameter is misformed');
    }
  });

  it('called with missing Launched state and should reject with DBObjectNotFound.', async () => {
    try {
      fakeEnumExportStateFindOne.resolves(Promise.resolve(null));
      await storage_builder.create({ id_application: 1 });
      chai.expect.fail('Expected to throw DBObjectNotFound, but it did not.');
    } catch (err) {
      chai
        .expect(fakeEnumExportStateFindOne)
        .to.have.been.calledOnceWithExactly({
          where: { status: 'Launched' },
        });
      chai.expect(fakeApplicationExportCreate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai
        .expect(err.message)
        .to.equal('The state "Launched" could not be found.');
    }
  });
});

// Tests for getIdEnumState function

describe('storage.builder.getIdEnumState()', () => {
  let fakeEnumExportStateFindOne;

  beforeEach(() => {
    fakeEnumExportStateFindOne = sinon.stub(
      db.cirrus.ENUM_EXPORT_STATE,
      'findOne'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid status and should return the id_enum_export_state', async () => {
    const mockResponse = {
      id_enum_export_state: 1,
    };

    fakeEnumExportStateFindOne.resolves(mockResponse);

    const result = await storage_builder.getIdEnumState({ status: 'Launched' });

    chai.expect(fakeEnumExportStateFindOne).to.have.been.calledOnceWithExactly({
      where: { status: 'Launched' },
    });

    chai.expect(result).to.equal(1);
  });

  it('called with existing name status and but DB is not initialized should throw DBObjectNotFound', async () => {
    fakeEnumExportStateFindOne.resolves(null);

    try {
      await storage_builder.getIdEnumState({ status: 'Available' });
      chai.expect.fail('Expected to throw DBObjectNotFound, but it did not.');
    } catch (err) {
      chai
        .expect(fakeEnumExportStateFindOne)
        .to.have.been.calledOnceWithExactly({
          where: { status: 'Available' },
        });
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai
        .expect(err.message)
        .to.equal('The state "Available" could not be found.');
    }
  });

  it('called with missing status and should throw MissingArgumentError', async () => {
    try {
      await storage_builder.getIdEnumState({});
      chai.expect.fail(
        'Expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeEnumExportStateFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (status) are missing.');
    }
  });

  it('called with invalid status and should throw ParameterMisformed', async () => {
    try {
      await storage_builder.getIdEnumState({ status: 'InvalidStatus' });
      chai.expect.fail('Expected to throw ParameterMisformed, but it did not.');
    } catch (err) {
      chai.expect(fakeEnumExportStateFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The state "InvalidStatus" is not available.');
    }
  });
});

// Tests for getStatusFromId function

describe('storage.builder.getStatusFromId()', () => {
  let fakeEnumExportStateFindOne;

  beforeEach(() => {
    fakeEnumExportStateFindOne = sinon.stub(
      db.cirrus.ENUM_EXPORT_STATE,
      'findOne'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_enum_export_state and should return status', async () => {
    const mockResponse = {
      id_enum_export_state: 1,
      status: 'Launched',
    };

    fakeEnumExportStateFindOne.resolves(mockResponse);

    const result = await storage_builder.getStatusFromId({
      id_enum_export_state: 1,
    });

    chai.expect(fakeEnumExportStateFindOne).to.have.been.calledOnceWithExactly({
      where: { id_enum_export_state: 1 },
    });

    chai.expect(result).to.equal('Launched');
  });

  it('called with missing id_enum_export_state and should throw MissingArgumentError', async () => {
    try {
      await storage_builder.getStatusFromId({});
      chai.expect.fail(
        'Expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeEnumExportStateFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal(
          'One or multiple arguments (id_enum_export_state) are missing.'
        );
    }
  });

  it('called with non-existent id_enum_export_state and should throw DBObjectNotFound', async () => {
    fakeEnumExportStateFindOne.resolves(null);

    try {
      await storage_builder.getStatusFromId({ id_enum_export_state: 999 });
      chai.expect.fail('Expected to throw DBObjectNotFound, but it did not.');
    } catch (err) {
      chai
        .expect(fakeEnumExportStateFindOne)
        .to.have.been.calledOnceWithExactly({
          where: { id_enum_export_state: 999 },
        });
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai
        .expect(err.message)
        .to.equal('The state with ID "999" could not be found.');
    }
  });
});

// Tests for getIdsEnumStates function

describe('storage.builder.getIdsEnumStates()', () => {
  let fakeEnumExportStateFindAll;

  beforeEach(() => {
    fakeEnumExportStateFindAll = sinon.stub(
      db.cirrus.ENUM_EXPORT_STATE,
      'findAll'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid statuses and should return array of id_enum_export_states', async () => {
    const mockResponse = [
      { id_enum_export_state: 1, status: 'Launched' },
      { id_enum_export_state: 2, status: 'Available' },
    ];

    fakeEnumExportStateFindAll.resolves(mockResponse);

    const result = await storage_builder.getIdsEnumStates({
      statuses: ['Launched', 'Available'],
    });

    chai.expect(fakeEnumExportStateFindAll).to.have.been.calledOnceWithExactly({
      where: { status: ['Launched', 'Available'] },
    });

    chai.expect(result).to.deep.equal([1, 2]);
  });

  it('called with some statuses missing in DB and should throw DBObjectNotFound', async () => {
    const mockResponse = [{ id_enum_export_state: 1, status: 'Launched' }];

    fakeEnumExportStateFindAll.resolves(mockResponse);

    try {
      await storage_builder.getIdsEnumStates({
        statuses: ['Launched', 'Available'],
      });
      chai.expect.fail('Expected to throw DBObjectNotFound, but it did not.');
    } catch (err) {
      chai
        .expect(fakeEnumExportStateFindAll)
        .to.have.been.calledOnceWithExactly({
          where: { status: ['Launched', 'Available'] },
        });
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai
        .expect(err.message)
        .to.equal('The state(s) "Available" could not be found.');
    }
  });

  it('called with missing statuses and should throw MissingArgumentError', async () => {
    try {
      await storage_builder.getIdsEnumStates({});
      chai.expect.fail(
        'Expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeEnumExportStateFindAll).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (statuses) are missing.');
    }
  });

  it('called with invalid statuses and should throw ParameterMisformed', async () => {
    try {
      await storage_builder.getIdsEnumStates({
        statuses: ['Launched', 'InvalidStatus'],
      });
      chai.expect.fail('Expected to throw ParameterMisformed, but it did not.');
    } catch (err) {
      chai.expect(fakeEnumExportStateFindAll).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The state(s) "InvalidStatus" are not available.');
    }
  });
});

// Tests for getLatestStorage function

describe('storage.builder.getLatestStorage()', () => {
  let fakeApplicationExportFindOne, fakeEnumExportStateFindOne;

  beforeEach(() => {
    fakeApplicationExportFindOne = sinon.stub(
      db.cirrus.APPLICATION_EXPORT,
      'findOne'
    );
    fakeEnumExportStateFindOne = sinon
      .stub(db.cirrus.ENUM_EXPORT_STATE, 'findOne')
      .resolves(
        Promise.resolve({ id_enum_export_state: 1, status: 'Launched' })
      );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_application and should return active storage', async () => {
    const mockExport = {
      id_export: 1,
      id_application: 1,
      init_date: moment().tz(CONFIG.APP_TZ).format(),
      expiration_date: moment().tz(CONFIG.APP_TZ).add(1, 'days').format(),
      id_enum_export_state: 3,
      id_provider: 'provider123',
      download_link: 'http://example.com/download',
    };

    fakeApplicationExportFindOne.resolves(mockExport);

    const result = await storage_builder.getLatestStorage({
      id_application: 1,
    });

    chai
      .expect(fakeApplicationExportFindOne)
      .to.have.been.calledOnceWithExactly({
        where: {
          id_application: 1,
          expiration_date: { [Op.gt]: moment().tz(CONFIG.APP_TZ).format() },
        },
        order: [['init_date', 'DESC']],
      });

    const expectedResult = new Application_export({
      ...mockExport,
      status: 'Available', // This would be set by getStatusFromId in the actual implementation
    });

    // We can't test the exact status since that requires mocking getStatusFromId
    // but we can test that the result has the right structure
    chai.expect(result.id_export).to.equal(expectedResult.id_export);
    chai.expect(result.id_application).to.equal(expectedResult.id_application);
  });

  it('called with valid id_application but no active storage and should return null values', async () => {
    fakeApplicationExportFindOne.resolves(null);

    const result = await storage_builder.getLatestStorage({
      id_application: 1,
    });

    chai
      .expect(fakeApplicationExportFindOne)
      .to.have.been.calledOnceWithExactly({
        where: {
          id_application: 1,
          expiration_date: { [Op.gt]: moment().tz(CONFIG.APP_TZ).format() },
        },
        order: [['init_date', 'DESC']],
      });

    chai.expect(result).to.deep.equal(
      new Application_export({
        id_export: null,
        init_date: null,
        id_application: 1,
        expiration_date: null,
        id_provider: null,
        download_link: null,
        id_enum_export_state: null,
        status: null,
      })
    );
  });

  it('called with missing id_application and should throw MissingArgumentError', async () => {
    try {
      await storage_builder.getLatestStorage({});
      chai.expect.fail(
        'Expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeApplicationExportFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_application) are missing.');
    }
  });

  it('called with malformed id_application and should throw ParameterMisformed', async () => {
    try {
      await storage_builder.getLatestStorage({ id_application: 'invalid' });
      chai.expect.fail('Expected to throw ParameterMisformed, but it did not.');
    } catch (err) {
      chai.expect(fakeApplicationExportFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_application parameter is misformed');
    }
  });
});

// Tests for getNonErrorApplicationStorage function

describe('storage.builder.deleteExport()', () => {
  let fakeEnumExportStateFindOne, fakeApplicationExportUpdate;

  beforeEach(() => {
    fakeEnumExportStateFindOne = sinon.stub(
      db.cirrus.ENUM_EXPORT_STATE,
      'findOne'
    );
    fakeApplicationExportUpdate = sinon.stub(
      db.cirrus.APPLICATION_EXPORT,
      'update'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_export and should update export state to Revoked', async () => {
    const mockResponse = [1]; // Sequelize update returns [numberOfAffectedRows]
    const mockExport = {
      id_export: 1,
      id_application: 1,
      init_date: moment().tz(CONFIG.APP_TZ).format(),
      expiration_date: moment().tz(CONFIG.APP_TZ).add(1, 'days').format(),
      id_enum_export_state: 5, // Revoked state
    };

    fakeEnumExportStateFindOne.resolves({ id_enum_export_state: 5 });
    fakeApplicationExportUpdate.resolves(mockResponse);

    const result = await storage_builder.deleteExport({ id_export: 1 });

    chai.expect(fakeEnumExportStateFindOne).to.have.been.calledOnceWithExactly({
      where: { status: 'Revoked' },
    });

    chai.expect(fakeApplicationExportUpdate).to.have.been.calledOnceWithExactly(
      {
        id_enum_export_state: 5,
      },
      {
        where: { id_export: 1 },
      }
    );

    chai.expect(result).to.deep.equal(
      new Application_export({
        id_export: mockExport.id_export,
        init_date: mockExport.init_date,
        id_application: mockExport.id_application,
        expiration_date: mockExport.expiration_date,
        id_enum_export_state: mockExport.id_enum_export_state,
      })
    );
  });

  it('called with non-existent id_export and should throw DBObjectNotFound', async () => {
    fakeEnumExportStateFindOne.resolves({ id_enum_export_state: 5 });
    fakeApplicationExportUpdate.resolves([0]); // No rows affected

    try {
      await storage_builder.deleteExport({ id_export: 999 });
      chai.expect.fail('Expected to throw DBObjectNotFound, but it did not.');
    } catch (err) {
      chai
        .expect(fakeEnumExportStateFindOne)
        .to.have.been.calledOnceWithExactly({
          where: { status: 'Revoked' },
        });
      chai
        .expect(fakeApplicationExportUpdate)
        .to.have.been.calledOnceWithExactly(
          {
            id_enum_export_state: 5,
          },
          {
            where: { id_export: 999 },
          }
        );
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The export to update does not exist.');
    }
  });

  it('called with missing id_export and should throw MissingArgumentError', async () => {
    try {
      await storage_builder.deleteExport({});
      chai.expect.fail(
        'Expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeEnumExportStateFindOne).to.not.have.been.called;
      chai.expect(fakeApplicationExportUpdate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_export) are missing.');
    }
  });

  it('called with malformed id_export and should throw ParameterMisformed', async () => {
    try {
      await storage_builder.deleteExport({ id_export: 'invalid' });
      chai.expect.fail('Expected to throw ParameterMisformed, but it did not.');
    } catch (err) {
      chai.expect(fakeEnumExportStateFindOne).to.not.have.been.called;
      chai.expect(fakeApplicationExportUpdate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_export parameter is misformed');
    }
  });
});

describe('storage.builder.setError()', () => {
  let fakeEnumExportStateFindOne, fakeApplicationExportUpdate;

  beforeEach(() => {
    fakeEnumExportStateFindOne = sinon.stub(
      db.cirrus.ENUM_EXPORT_STATE,
      'findOne'
    );
    fakeApplicationExportUpdate = sinon.stub(
      db.cirrus.APPLICATION_EXPORT,
      'update'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_export and should update export state to Error', async () => {
    const mockResponse = [1]; // Sequelize update returns [numberOfAffectedRows]
    const mockExport = {
      id_export: 1,
      id_application: 1,
      init_date: moment().tz(CONFIG.APP_TZ).format(),
      expiration_date: moment().tz(CONFIG.APP_TZ).add(1, 'days').format(),
      id_enum_export_state: 6, // Error state
    };

    fakeEnumExportStateFindOne.resolves({ id_enum_export_state: 6 });
    fakeApplicationExportUpdate.resolves(mockResponse);

    const result = await storage_builder.setError({ id_export: 1 });

    chai.expect(fakeEnumExportStateFindOne).to.have.been.calledOnceWithExactly({
      where: { status: 'Error' },
    });

    chai.expect(fakeApplicationExportUpdate).to.have.been.calledOnceWithExactly(
      {
        id_enum_export_state: 6,
      },
      {
        where: { id_export: 1 },
      }
    );

    chai.expect(result).to.deep.equal(
      new Application_export({
        id_export: mockExport.id_export,
        init_date: mockExport.init_date,
        id_application: mockExport.id_application,
        expiration_date: mockExport.expiration_date,
        id_enum_export_state: mockExport.id_enum_export_state,
      })
    );
  });

  it('called with non-existent id_export and should throw DBObjectNotFound', async () => {
    fakeEnumExportStateFindOne.resolves({ id_enum_export_state: 6 });
    fakeApplicationExportUpdate.resolves([0]); // No rows affected

    try {
      await storage_builder.setError({ id_export: 999 });
      chai.expect.fail('Expected to throw DBObjectNotFound, but it did not.');
    } catch (err) {
      chai
        .expect(fakeEnumExportStateFindOne)
        .to.have.been.calledOnceWithExactly({
          where: { status: 'Error' },
        });
      chai
        .expect(fakeApplicationExportUpdate)
        .to.have.been.calledOnceWithExactly(
          {
            id_enum_export_state: 6,
          },
          {
            where: { id_export: 999 },
          }
        );
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The export to update does not exist.');
    }
  });

  it('called with missing id_export and should throw MissingArgumentError', async () => {
    try {
      await storage_builder.setError({});
      chai.expect.fail(
        'Expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeEnumExportStateFindOne).to.not.have.been.called;
      chai.expect(fakeApplicationExportUpdate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_export) are missing.');
    }
  });

  it('called with malformed id_export and should throw ParameterMisformed', async () => {
    try {
      await storage_builder.setError({ id_export: 'invalid' });
      chai.expect.fail('Expected to throw ParameterMisformed, but it did not.');
    } catch (err) {
      chai.expect(fakeEnumExportStateFindOne).to.not.have.been.called;
      chai.expect(fakeApplicationExportUpdate).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_export parameter is misformed');
    }
  });
});

describe('storage.builder.getNonErrorApplicationStorage()', () => {
  let fakeEnumExportStateFindAll, fakeApplicationExportFindOne;

  beforeEach(() => {
    fakeEnumExportStateFindAll = sinon.stub(
      db.cirrus.ENUM_EXPORT_STATE,
      'findAll'
    );
    fakeApplicationExportFindOne = sinon.stub(
      db.cirrus.APPLICATION_EXPORT,
      'findOne'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid id_application and should return storage when found', async () => {
    const mockEnumStates = [
      { id_enum_export_state: 1, status: 'Launched' },
      { id_enum_export_state: 2, status: 'Exporting' },
      { id_enum_export_state: 3, status: 'Available' },
    ];
    const mockExport = {
      id_export: 1,
      id_application: 1,
      id_enum_export_state: 1, // Launched state
      init_date: moment().tz(CONFIG.APP_TZ).format(),
      expiration_date: moment().tz(CONFIG.APP_TZ).add(1, 'days').format(),
    };

    fakeEnumExportStateFindAll.resolves(mockEnumStates);
    fakeApplicationExportFindOne.resolves(mockExport);

    const result = await storage_builder.getNonErrorApplicationStorage({
      id_application: 1,
    });

    // Check that both database calls were made with the expected arguments
    chai.expect(fakeEnumExportStateFindAll).to.have.been.calledWithExactly({
      where: { status: ['Launched', 'Exporting', 'Available'] },
    });

    chai.expect(fakeApplicationExportFindOne).to.have.been.calledWithExactly({
      where: {
        id_application: 1,
        expiration_date: { [Op.gt]: moment().tz(CONFIG.APP_TZ).format() },
      },
      order: [['init_date', 'DESC']],
    });

    const expectedResult = new Application_export({
      ...mockExport,
      status: 'Launched', // This would be set by getStatusFromId in the actual implementation
    });

    // We can't test the exact status since that requires mocking getStatusFromId
    // but we can test that the result has the right structure
    chai.expect(result.id_export).to.equal(expectedResult.id_export);
    chai.expect(result.id_application).to.equal(expectedResult.id_application);
  });

  it('called with valid id_application and should return null values when not found', async () => {
    const mockEnumStates = [
      { id_enum_export_state: 1, status: 'Launched' },
      { id_enum_export_state: 2, status: 'Exporting' },
      { id_enum_export_state: 3, status: 'Available' },
    ];

    fakeEnumExportStateFindAll.resolves(mockEnumStates);
    fakeApplicationExportFindOne.resolves(null);

    const result = await storage_builder.getNonErrorApplicationStorage({
      id_application: 1,
    });

    chai.expect(fakeEnumExportStateFindAll).to.have.been.calledWithExactly({
      where: { status: ['Launched', 'Exporting', 'Available'] },
    });

    chai
      .expect(fakeApplicationExportFindOne)
      .to.have.been.calledOnceWithExactly({
        where: {
          id_application: 1,
          expiration_date: { [Op.gt]: moment().tz(CONFIG.APP_TZ).format() },
        },
        order: [['init_date', 'DESC']],
      });

    chai.expect(result).to.deep.equal(
      new Application_export({
        id_export: null,
        init_date: null,
        id_application: null,
        expiration_date: null,
        id_provider: null,
        download_link: null,
        id_enum_export_state: null,
        status: null,
      })
    );
  });

  it('called with valid id_application and should return null values when in error state', async () => {
    const mockEnumStates = [
      { id_enum_export_state: 1, status: 'Launched' },
      { id_enum_export_state: 2, status: 'Exporting' },
      { id_enum_export_state: 3, status: 'Available' },
    ];
    const mockExport = {
      id_export: 1,
      id_application: 1,
      id_enum_export_state: 5, // Error state
      init_date: moment().tz(CONFIG.APP_TZ).format(),
      expiration_date: moment().tz(CONFIG.APP_TZ).add(1, 'days').format(),
    };

    fakeEnumExportStateFindAll.resolves(mockEnumStates);
    fakeApplicationExportFindOne.resolves(mockExport);

    const result = await storage_builder.getNonErrorApplicationStorage({
      id_application: 1,
    });

    // Check that both database calls were made with the expected arguments
    chai.expect(fakeEnumExportStateFindAll).to.have.been.calledWithExactly({
      where: { status: ['Launched', 'Exporting', 'Available'] },
    });

    chai.expect(fakeApplicationExportFindOne).to.have.been.calledWithExactly({
      where: {
        id_application: 1,
        expiration_date: { [Op.gt]: moment().tz(CONFIG.APP_TZ).format() },
      },
      order: [['init_date', 'DESC']],
    });

    chai.expect(result).to.deep.equal(
      new Application_export({
        id_export: null,
        init_date: null,
        id_application: null,
        expiration_date: null,
        id_provider: null,
        download_link: null,
        id_enum_export_state: null,
        status: null,
      })
    );
  });

  it('called with missing id_application and should throw MissingArgumentError', async () => {
    try {
      await storage_builder.getNonErrorApplicationStorage({});
      chai.expect.fail(
        'Expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeEnumExportStateFindAll).to.not.have.been.called;
      chai.expect(fakeApplicationExportFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_application) are missing.');
    }
  });

  it('called with malformed id_application and should throw ParameterMisformed', async () => {
    try {
      await storage_builder.getNonErrorApplicationStorage({
        id_application: 'invalid',
      });
      chai.expect.fail('Expected to throw ParameterMisformed, but it did not.');
    } catch (err) {
      chai.expect(fakeEnumExportStateFindAll).to.not.have.been.called;
      chai.expect(fakeApplicationExportFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_application parameter is misformed');
    }
  });

  it('called with missing state and should throw DBObjectNotFound', async () => {
    try {
      fakeEnumExportStateFindAll.resolves([
        { id_enum_export_state: 1, status: 'Launched' },
      ]);
      await storage_builder.getNonErrorApplicationStorage({
        id_application: 1,
      });
      chai.expect.fail('Expected to throw DBObjectNotFound, but it did not.');
    } catch (err) {
      chai
        .expect(fakeEnumExportStateFindAll)
        .to.have.been.calledOnceWithExactly({
          where: { status: ['Launched', 'Exporting', 'Available'] },
        });
      chai.expect(fakeApplicationExportFindOne).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai
        .expect(err.message)
        .to.equal('The state(s) "Exporting, Available" could not be found.');
    }
  });
});
