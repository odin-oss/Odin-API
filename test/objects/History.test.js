import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { Environment } from '../../src/objects/Environment.js';
import { History, Record } from '../../src/objects/History.js';
import moment from 'moment';
chai.use(sinonChai);

describe('<object> History', () => {
  it('creates and checks value of empty History object.', () => {
    const history = new History();
    chai.expect(history.records).to.be.deep.equal([]);
  });
  it('creates, updates and checks value of History object.', () => {
    const history = new History({
      records: [
        new Record({
          id_application: 1,
          id_user: 2,
          id_history: 3,
          datetime: moment('2025-09-26 13:19:30').tz('Europe/Paris'),
        }),
      ],
    });
    chai.expect(history.records).to.be.deep.equal([
      new Record({
        id_application: 1,
        id_user: 2,
        id_history: 3,
        datetime: moment('2025-09-26 13:19:30').tz('Europe/Paris'),
      }),
    ]);
    history.records = [];
    chai.expect(history.records).to.be.deep.equal([]);
  });
  it('creates and checks value of toJSON and public_format object.', () => {
    const history = new History({
      records: [
        new Record({
          id_application: 1,
          id_user: 2,
          id_history: 3,
          datetime: moment('2025-09-26 13:19:30').tz('Europe/Paris'),
        }),
      ],
    });
    chai.expect(history.toJSON()).to.deep.equal({
      records: [
        {
          id_application: 1,
          id_user: 2,
          id_history: 3,
          datetime: moment('2025-09-26 13:19:30').tz('Europe/Paris'),
        },
      ],
    });
    chai.expect(history.public_format()).to.deep.equal({
      records: [
        {
          id_application: 1,
          id_user: 2,
          id_history: 3,
          datetime: moment('2025-09-26 13:19:30').tz('Europe/Paris'),
        },
      ],
    });
  });
});
describe('<object> Record', () => {
  it('creates and checks value of empty Record object.', () => {
    const record = new Record();
    chai.expect(record.datetime).to.be.equal(undefined);
    chai.expect(record.id_user).to.be.equal(undefined);
    chai.expect(record.id_application).to.be.equal(undefined);
    chai.expect(record.id_history).to.be.equal(undefined);
  });
  it('creates, updates and checks value of Record object.', () => {
    const record = new Record({
      id_application: 1,
      id_user: 2,
      id_history: 3,
      datetime: moment('2025-09-26 13:19:30').tz('Europe/Paris'),
    });
    chai.expect(record.toJSON()).to.be.deep.equal({
      id_application: 1,
      id_user: 2,
      id_history: 3,
      datetime: moment('2025-09-26 13:19:30').tz('Europe/Paris'),
    });
    record.id_application = 2;
    record.id_user = 3;
    record.id_history = 4;
    record.datetime = moment('2025-09-27 13:19:30').tz('Europe/Paris');

    chai.expect(record.toJSON()).to.be.deep.equal({
      id_application: 2,
      id_user: 3,
      id_history: 4,
      datetime: moment('2025-09-27 13:19:30').tz('Europe/Paris'),
    });
  });
  it('creates and checks value of toJSON and public_format object.', () => {
    const record = new Record({
      id_application: 1,
      id_user: 2,
      id_history: 3,
      datetime: moment('2025-09-26 13:19:30').tz('Europe/Paris'),
    });
    chai.expect(record.toJSON()).to.be.deep.equal({
      id_application: 1,
      id_user: 2,
      id_history: 3,
      datetime: moment('2025-09-26 13:19:30').tz('Europe/Paris'),
    });
    chai.expect(record.public_format()).to.be.deep.equal({
      id_application: 1,
      id_user: 2,
      id_history: 3,
      datetime: moment('2025-09-26 13:19:30').tz('Europe/Paris'),
    });
  });
});
