import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as history_builder from '../../src/builders/history.builder.js';
import {
  DBConnexionRefused,
  MissingArgumentError,
  ParameterMisformed,
} from '../../src/utils/errors.service.js';
import db from '../../src/config/db.config.js';
import { History, Record } from '../../src/objects/History.js';
import moment from 'moment-timezone';
import Sequelize from 'sequelize';
chai.use(sinonChai);

describe('history.builder.create()', () => {
  let fakeCreate;
  beforeEach(() => {
    fakeCreate = sinon.stub(db.cirrus.HISTORY, 'create');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good args and should create History entry.', async () => {
    fakeCreate.resolves(
      Promise.resolve({
        id_user: 1,
        id_application: 1,
        id_history: 2,
        datetime: '2025-09-26 11:11:11',
      })
    );
    const result = await Promise.resolve(
      history_builder.create({
        id_user: 1,
        id_application: 1,
      })
    );
    chai.expect(result).to.be.deep.equal(
      new History({
        records: [
          new Record({
            id_user: 1,
            id_application: 1,
            id_history: 2,
            datetime: moment('2025-09-26 11:11:11').tz('Europe/Paris'),
          }),
        ],
      })
    );
  });
  it('called with missing argument and should get MissingArgumentError.', async () => {
    try {
      await history_builder.create({ id_user: 1 });
      throw new Error('should have get MissingArgumentError but did not.');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.be.equal('One or multiple arguments (id_application) are missing.');
    }
  });
  it('called with misformed id_application argument and should get ParameterMisformed.', async () => {
    try {
      await history_builder.create({ id_user: 1, id_application: 'misformed' });
      throw new Error('should have get ParameterMisformed but did not.');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.be.equal('The props.id_application parameter is misformed.');
    }
  });
});
describe('history.builder.get_last_record()', () => {
  let fakeGetLastRecord;
  beforeEach(() => {
    fakeGetLastRecord = sinon.stub(db.cirrus.HISTORY, 'findOne');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good args and should get last History Entry.', async () => {
    fakeGetLastRecord.resolves(
      Promise.resolve({
        id_user: 1,
        id_application: 1,
        id_history: 2,
        datetime: '2025-09-26 11:11:11',
      })
    );
    const result = await Promise.resolve(
      history_builder.get_last_record({
        id_user: 1,
        id_application: 1,
      })
    );
    chai.expect(result).to.be.deep.equal(
      new History({
        records: [
          new Record({
            id_user: 1,
            id_application: 1,
            id_history: 2,
            datetime: moment('2025-09-26 11:11:11').tz('Europe/Paris'),
          }),
        ],
      })
    );
    chai.expect(fakeGetLastRecord).to.have.been.calledOnceWithExactly({
      limit: 1,
      where: {
        id_user: 1,
        id_application: 1,
      },
      order: [['datetime', 'DESC']],
    });
  });
  it('called with missing argument and should get MissingArgumentError.', async () => {
    try {
      await history_builder.get_last_record({ id_user: 1 });
      throw new Error('should have get MissingArgumentError but did not.');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.be.equal('One or multiple arguments (id_application) are missing.');
    }
  });
  it('called and should get DBConnexionRefused.', async () => {
    try {
      fakeGetLastRecord.resolves(
        Promise.reject(new Sequelize.ConnectionRefusedError())
      );
      await history_builder.get_last_record({ id_user: 1, id_application: 1 });
      throw new Error('should have get DBConnexionRefused but did not.');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
      chai
        .expect(err.message)
        .to.be.equal('Connexion to the database refused.');
    }
  });
  it('called with misformed id_application and should get ParameterMisformed.', async () => {
    try {
      await history_builder.get_last_record({
        id_user: 1,
        id_application: 'misformed',
      });
      throw new Error('should have get ParameterMisformed but did not.');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.be.equal('The props.id_application parameter is misformed.');
    }
  });
});
