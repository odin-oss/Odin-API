import * as chai from 'chai';
import { Record, History } from '../../src/objects/History.js';

describe('Record object', () => {
  it('creates with valid properties', () => {
    const record = new Record({
      id_user: 1,
      id_application: 5,
      id_history: 10,
      datetime: '2026-02-27T10:00:00Z',
    });

    chai.expect(record.id_user).to.equal(1);
    chai.expect(record.id_application).to.equal(5);
    chai.expect(record.id_history).to.equal(10);
    chai.expect(record.datetime).to.exist;
  });

  it('throws on invalid datetime', () => {
    chai
      .expect(() => {
        new Record({ datetime: 'not-a-date' });
      })
      .to.throw();
  });

  it('serializes with toJSON', () => {
    const record = new Record({
      id_user: 2,
      id_application: 3,
      datetime: '2026-02-27T10:00:00Z',
    });

    const json = record.toJSON();
    chai.expect(json.id_user).to.equal(2);
    chai.expect(json.id_application).to.equal(3);
    chai.expect(json.datetime).to.exist;
  });
});

describe('History object', () => {
  it('creates with records array', () => {
    const record1 = new Record({
      id_user: 1,
      datetime: '2026-02-27T10:00:00Z',
    });
    const record2 = new Record({
      id_user: 2,
      datetime: '2026-02-27T11:00:00Z',
    });

    const history = new History({ records: [record1, record2] });

    chai.expect(history.records).to.have.lengthOf(2);
    chai.expect(history.records[0]).to.equal(record1);
    chai.expect(history.records[1]).to.equal(record2);
  });

  it('creates with empty records by default', () => {
    const history = new History();

    chai.expect(history.records).to.be.an('array');
    chai.expect(history.records).to.have.lengthOf(0);
  });

  it('serializes with toJSON', () => {
    const record = new Record({
      id_user: 1,
      datetime: '2026-02-27T10:00:00Z',
    });
    const history = new History({ records: [record] });

    const json = history.toJSON();
    chai.expect(json.records).to.be.an('array');
    chai.expect(json.records).to.have.lengthOf(1);
  });
});
