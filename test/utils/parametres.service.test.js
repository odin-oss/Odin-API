import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONFIG from '../../src/config/config.js';
import {
  BadTypeArgumentError,
  MissingArgumentError,
  ParameterMisformed,
  PasswordIsTooShort,
  PasswordMissingNumber,
  PasswordMissingSpecialChars,
} from '../../src/utils/errors.service.js';
import * as parametres from '../../src/utils/Guard.ce.js';
import moment from 'moment-timezone';
chai.use(sinonChai);

describe('Guard.ce.check_query()', () => {
  it('called with nothing and should return true.', () => {
    const req = { query: {} };
    const result = Guard._query(req, []);
    chai.expect(result).to.be.true;
  });

  it('called with multiple keys and should return true.', () => {
    const req = { query: { hash: true, port: 3000 } };
    const result = Guard._query(req, ['hash', 'port']);
    chai.expect(result).to.be.true;
  });

  it('called with multiples with one missing and should return error.', () => {
    const req = {
      query: {
        one: 'one',
        three: 'three',
      },
    };
    try {
      Guard._query(req, ['one', 'two', 'three']);
      throw new Error(
        'Expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('The query parameter (two) is missing.');
    }
  });

  it('called with wrong type of parameter and should return error.', () => {
    const req = {
      query: {
        one: 'one',
        three: 'three',
      },
    };

    try {
      Guard._query(req, 'wrong');
      throw new Error(
        'Expected to throw BadTypeArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadTypeArgumentError);
      chai
        .expect(err.message)
        .to.equal('The argument expectedKeys must be an array of string.');
    }

    try {
      Guard._query('wrong', ['one']);
      throw new Error(
        'Expected to throw BadTypeArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadTypeArgumentError);
      chai
        .expect(err.message)
        .to.equal(
          'The argument req must be a conventional request from http of string.'
        );
    }
  });
});
describe('Guard.ce.check_body()', () => {
  it('called with nothing and should return null object.', () => {
    const req = { body: {} };
    const result = Guard._body(req, []);
    chai.expect(result).to.be.true; // Chai's way to check for null values
  });

  it('called with multiple keys and should return true.', () => {
    const req = { body: { hash: true, port: 3000 } };
    const result = Guard._body(req, ['hash', 'port']);
    chai.expect(result).to.be.true; // Chai's assertion for boolean
  });

  it('called with multiples with one missing and should return error.', () => {
    const req = {
      body: {
        one: 'one',
        three: 'three',
      },
    };

    // Testing if MissingArgumentError is thrown when a parameter is missing
    try {
      Guard._body(req, ['one', 'two', 'three']);
      throw new Error(
        'Expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.message).to.equal('The body parameter (two) is missing.');
    }
  });

  it('called with wrong type of parameter and should return error.', () => {
    const req = {
      body: {
        one: 'one',
        three: 'three',
      },
    };

    // Testing wrong argument type (expected array of strings)
    try {
      Guard._body(req, 'wrong');
      throw new Error(
        'Expected to throw BadTypeArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadTypeArgumentError);
      chai
        .expect(err.message)
        .to.equal('The argument expectedKeys must be an array of string.');
    }

    // Testing wrong request argument type (expected conventional request)
    try {
      Guard._body('wrong', ['one']);
      throw new Error(
        'Expected to throw BadTypeArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadTypeArgumentError);
      chai
        .expect(err.message)
        .to.equal(
          'The argument req must be a conventional request from http of string.'
        );
    }
  });
});
describe('Guard.ce.check_props()', () => {
  it('called with nothing and should return empty array of string.', () => {
    const actual = { hash: 'test', libelle: 'test' };
    const expected = { hash: undefined, libelle: undefined };
    const result = Guard._props(expected, actual);
    chai.expect(result).to.deep.equal([]); // Chai assertion for array equality
  });

  it('called with multiples with one missing and should return one-length array of string.', () => {
    const actual = { hash: 'test' };
    const expected = { hash: undefined, libelle: undefined };
    const result = Guard._props(expected, actual);
    chai.expect(result).to.deep.equal(['libelle']);
  });

  it('called with multiples with multiple missing and should return two-length array of string.', () => {
    const actual = { libelle: 'test' };
    const expected = { hash: undefined, libelle: undefined, port: undefined };
    const result = Guard._props(expected, actual);
    chai.expect(result).to.deep.equal(['hash', 'port']);
  });
});
describe('Guard.ce.check_id()', () => {
  it('called with an integer and should return true.', async () => {
    chai.expect(Guard._id(1)).to.be.true;
  });

  it('called with an integer in a string and should return true.', async () => {
    chai.expect(Guard._id('1000')).to.be.true;
  });

  it('called with a string and should return false.', async () => {
    chai.expect(Guard._id('boooh')).to.be.false;
  });
  it('called with a string and should return false.', async () => {
    chai.expect(Guard._id('boooh')).to.be.false;
  });
});
describe('Guard.ce.check_hash()', () => {
  it('called with a good hash and should return true.', () => {
    const result = Guard._hash('hash12');
    chai.expect(result).to.be.true; // Chai boolean assertion
  });

  it('called with a bad hash (too short) and should return false.', () => {
    const result = Guard._hash('hash2');
    chai.expect(result).to.be.false;
  });

  it('called with a bad hash (too long) and should return false.', () => {
    const result = Guard._hash('hash112');
    chai.expect(result).to.be.false;
  });

  it('called with a bad hash (wrong char) and should return false.', () => {
    const result = Guard._hash('hash1_2');
    chai.expect(result).to.be.false;
  });

  it('called with a bad parameter type and should return false.', () => {
    const result = Guard._hash({ test: 'test' });
    chai.expect(result).to.be.false;
  });

  it('called with a null hash and should return false.', () => {
    const result = Guard._hash(null);
    chai.expect(result).to.be.false;
  });

  it('called with an undefined hash and should return false.', () => {
    const result = Guard._hash(undefined);
    chai.expect(result).to.be.false;
  });
});
describe('Guard.ce.check_user_role()', () => {
  it('called with ETUDIANT and should return true.', () => {
    chai.expect(Guard._user_role('ETUDIANT')).to.be.true;
  });
  it('called with PROFESSEUR and should return true.', () => {
    chai.expect(Guard._user_role('PROFESSEUR')).to.be.true;
  });
  it('called with ADMINISTRATEUR and should return true.', () => {
    chai.expect(Guard._user_role('ADMINISTRATEUR')).to.be.true;
  });
  it('called with ULFI and should return false.', () => {
    chai.expect(Guard._user_role('ULFI')).to.be.false;
  });
});
describe('Guard.ce.check_key()', () => {
  it('called with correct key format and should return true.', () => {
    chai.expect(Guard._key('ulfi-blacky-test')).to.be.true;
  });
  it('called with not correct key format and should return false.', () => {
    chai.expect(Guard._key('ulfi-blacky!test')).to.be.false;
  });
});
describe('Guard.ce.check_email()', () => {
  it('called with correct mail format and should return true.', () => {
    chai.expect(Guard._email('benoit.lefebvre@getcaelus.cloud')).to.be
      .true;
  });
  it('called with not correct mail format and should return false.', () => {
    chai.expect(Guard._email('benoit.lefebvre@getcaelus')).to.be
      .false;
  });
});
describe('Guard.ce.state_changed_date()', () => {
  it('called with a correct moment date and should return true.', () => {
    chai.expect(Guard._changed_date(moment.tz(CONFIG.APP_TZ))).to.be
      .true;
  });
  it('called with a future moment date and should return false.', () => {
    chai.expect(
      Guard._changed_date(moment.tz(CONFIG.APP_TZ).add(2, 'days'))
    ).to.be.false;
  });
  it('called with a not moment date and should return false.', () => {
    chai.expect(
      Guard._changed_date("moment.tz(CONFIG.APP_TZ).add(2, 'days')")
    ).to.be.false;
  });
});
describe('Guard.ce.check_password()', () => {
  it('called with convenient argument and should return true.', () => {
    chai.expect(Guard._password('TestMDP1.')).to.be.true;
  });
  it('called with too short password and should reject with PasswordIsTooShort.', () => {
    try {
      Guard._password('sd.');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(PasswordIsTooShort);
      chai
        .expect(err.message)
        .to.be.equal('The password must contains at least 8 characters.');
    }
  });
  it('called with numberless password and should reject with PasswordMissingNumber.', () => {
    try {
      Guard._password('TestkkjMDP.');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(PasswordMissingNumber);
      chai
        .expect(err.message)
        .to.be.equal('The password must contains at least 1 number.');
    }
  });
  it('called with password without special char and should reject with PasswordMissingSpecialChars.', () => {
    try {
      Guard._password('TestMDP1az');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(PasswordMissingSpecialChars);
      chai
        .expect(err.message)
        .to.be.equal('The password must contains at least 1 special char.');
    }
  });
});
describe('Guard.ce.check_ids()', () => {
  it('called with an array of integers and should return true.', () => {
    chai.expect(Guard._ids([1, 2, 3])).to.be.true;
  });

  it('called with an array of stringified integers and should return true.', () => {
    chai.expect(Guard._ids(['10', '20', '30'])).to.be.true;
  });

  it('called with a mixed array of numbers and strings and should return true.', () => {
    chai.expect(Guard._ids([1, '2', 3])).to.be.true;
  });

  it('called with an empty array and should return true.', () => {
    chai.expect(Guard._ids([])).to.be.true;
  });

  it('called with an array containing zero and should return false.', () => {
    chai.expect(Guard._ids([1, 0, 3])).to.be.false;
  });

  it('called with an array containing a negative number and should return false.', () => {
    chai.expect(Guard._ids([1, -5, 2])).to.be.false;
  });

  it('called with an array containing a non-numeric string and should return false.', () => {
    chai.expect(Guard._ids([1, 'hello', 2])).to.be.false;
  });

  it('called with a non-array value and should return false.', () => {
    chai.expect(Guard._ids('not-an-array')).to.be.false;
  });

  it('called with null and should return false.', () => {
    chai.expect(Guard._ids(null)).to.be.false;
  });

  it('called with undefined and should return true (defaults to empty array).', () => {
    chai.expect(Guard._ids(undefined)).to.be.true;
  });
});
describe('Guard.ce.check_date()', () => {
  it('called with a valid Date object should return true.', () => {
    chai.expect(Guard._date(new Date())).to.be.true;
  });

  it('called with a valid date string should return true.', () => {
    chai.expect(Guard._date('2025-09-11')).to.be.true;
  });

  it('called with an invalid date string should return false.', () => {
    chai.expect(Guard._date('not-a-date')).to.be.false;
  });

  it('called with an empty string should return false.', () => {
    chai.expect(Guard._date('')).to.be.false;
  });

  it('called with null should return false.', () => {
    chai.expect(Guard._date(null)).to.be.false;
  });

  it('called with undefined should return false.', () => {
    chai.expect(Guard._date(undefined)).to.be.false;
  });

  it('called with a number timestamp should return true.', () => {
    chai.expect(Guard._date(Date.now())).to.be.true;
  });

  it('called with an invalid number should return false.', () => {
    chai.expect(Guard._date(NaN)).to.be.false;
  });
});
