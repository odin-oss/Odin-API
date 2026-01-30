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
import * as parametres from '../../src/utils/parametres.service.js';
import moment from 'moment-timezone';
chai.use(sinonChai);

describe('parametres.service.check_query()', () => {
  it('called with nothing and should return true.', () => {
    const req = { query: {} };
    const result = parametres.check_query(req, []);
    chai.expect(result).to.be.true;
  });

  it('called with multiple keys and should return true.', () => {
    const req = { query: { hash: true, port: 3000 } };
    const result = parametres.check_query(req, ['hash', 'port']);
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
      parametres.check_query(req, ['one', 'two', 'three']);
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
      parametres.check_query(req, 'wrong');
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
      parametres.check_query('wrong', ['one']);
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
describe('parametres.service.check_body()', () => {
  it('called with nothing and should return null object.', () => {
    const req = { body: {} };
    const result = parametres.check_body(req, []);
    chai.expect(result).to.be.true; // Chai's way to check for null values
  });

  it('called with multiple keys and should return true.', () => {
    const req = { body: { hash: true, port: 3000 } };
    const result = parametres.check_body(req, ['hash', 'port']);
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
      parametres.check_body(req, ['one', 'two', 'three']);
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
      parametres.check_body(req, 'wrong');
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
      parametres.check_body('wrong', ['one']);
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
describe('parametres.service.check_props()', () => {
  it('called with nothing and should return empty array of string.', () => {
    const actual = { hash: 'test', libelle: 'test' };
    const expected = { hash: undefined, libelle: undefined };
    const result = parametres.check_props(expected, actual);
    chai.expect(result).to.deep.equal([]); // Chai assertion for array equality
  });

  it('called with multiples with one missing and should return one-length array of string.', () => {
    const actual = { hash: 'test' };
    const expected = { hash: undefined, libelle: undefined };
    const result = parametres.check_props(expected, actual);
    chai.expect(result).to.deep.equal(['libelle']);
  });

  it('called with multiples with multiple missing and should return two-length array of string.', () => {
    const actual = { libelle: 'test' };
    const expected = { hash: undefined, libelle: undefined, port: undefined };
    const result = parametres.check_props(expected, actual);
    chai.expect(result).to.deep.equal(['hash', 'port']);
  });
});
describe('parametres.service.check_id()', () => {
  it('called with an integer and should return true.', async () => {
    chai.expect(parametres.check_id(1)).to.be.true;
  });

  it('called with an integer in a string and should return true.', async () => {
    chai.expect(parametres.check_id('1000')).to.be.true;
  });

  it('called with a string and should return false.', async () => {
    chai.expect(parametres.check_id('boooh')).to.be.false;
  });
  it('called with a string and should return false.', async () => {
    chai.expect(parametres.check_id('boooh')).to.be.false;
  });
});
describe('parametres.service.check_hash()', () => {
  it('called with a good hash and should return true.', () => {
    const result = parametres.check_hash('hash12');
    chai.expect(result).to.be.true; // Chai boolean assertion
  });

  it('called with a bad hash (too short) and should return false.', () => {
    const result = parametres.check_hash('hash2');
    chai.expect(result).to.be.false;
  });

  it('called with a bad hash (too long) and should return false.', () => {
    const result = parametres.check_hash('hash112');
    chai.expect(result).to.be.false;
  });

  it('called with a bad hash (wrong char) and should return false.', () => {
    const result = parametres.check_hash('hash1_2');
    chai.expect(result).to.be.false;
  });

  it('called with a bad parameter type and should return false.', () => {
    const result = parametres.check_hash({ test: 'test' });
    chai.expect(result).to.be.false;
  });

  it('called with a null hash and should return false.', () => {
    const result = parametres.check_hash(null);
    chai.expect(result).to.be.false;
  });

  it('called with an undefined hash and should return false.', () => {
    const result = parametres.check_hash(undefined);
    chai.expect(result).to.be.false;
  });
});
describe('parametres.service.check_user_role()', () => {
  it('called with ETUDIANT and should return true.', () => {
    chai.expect(parametres.check_user_role('ETUDIANT')).to.be.true;
  });
  it('called with PROFESSEUR and should return true.', () => {
    chai.expect(parametres.check_user_role('PROFESSEUR')).to.be.true;
  });
  it('called with ADMINISTRATEUR and should return true.', () => {
    chai.expect(parametres.check_user_role('ADMINISTRATEUR')).to.be.true;
  });
  it('called with ULFI and should return false.', () => {
    chai.expect(parametres.check_user_role('ULFI')).to.be.false;
  });
});
describe('parametres.service.check_key()', () => {
  it('called with correct key format and should return true.', () => {
    chai.expect(parametres.check_key('ulfi-blacky-test')).to.be.true;
  });
  it('called with not correct key format and should return false.', () => {
    chai.expect(parametres.check_key('ulfi-blacky!test')).to.be.false;
  });
});
describe('parametres.service.check_email()', () => {
  it('called with correct mail format and should return true.', () => {
    chai.expect(parametres.check_email('benoit.lefebvre@getcaelus.cloud')).to.be
      .true;
  });
  it('called with not correct mail format and should return false.', () => {
    chai.expect(parametres.check_email('benoit.lefebvre@getcaelus')).to.be
      .false;
  });
});
describe('parametres.service.state_changed_date()', () => {
  it('called with a correct moment date and should return true.', () => {
    chai.expect(parametres.state_changed_date(moment.tz(CONFIG.timezone))).to.be
      .true;
  });
  it('called with a future moment date and should return false.', () => {
    chai.expect(
      parametres.state_changed_date(moment.tz(CONFIG.timezone).add(2, 'days'))
    ).to.be.false;
  });
  it('called with a not moment date and should return false.', () => {
    chai.expect(
      parametres.state_changed_date("moment.tz(CONFIG.timezone).add(2, 'days')")
    ).to.be.false;
  });
});
describe('parametres.service.check_password()', () => {
  it('called with convenient argument and should return true.', () => {
    chai.expect(parametres.check_password('TestMDP1.')).to.be.true;
  });
  it('called with too short password and should reject with PasswordIsTooShort.', () => {
    try {
      parametres.check_password('sd.');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(PasswordIsTooShort);
      chai
        .expect(err.message)
        .to.be.equal('The password must contains at least 8 characters.');
    }
  });
  it('called with numberless password and should reject with PasswordMissingNumber.', () => {
    try {
      parametres.check_password('TestkkjMDP.');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(PasswordMissingNumber);
      chai
        .expect(err.message)
        .to.be.equal('The password must contains at least 1 number.');
    }
  });
  it('called with password without special char and should reject with PasswordMissingSpecialChars.', () => {
    try {
      parametres.check_password('TestMDP1az');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(PasswordMissingSpecialChars);
      chai
        .expect(err.message)
        .to.be.equal('The password must contains at least 1 special char.');
    }
  });
});
describe('parametres.service.check_ids()', () => {
  it('called with an array of integers and should return true.', () => {
    chai.expect(parametres.check_ids([1, 2, 3])).to.be.true;
  });

  it('called with an array of stringified integers and should return true.', () => {
    chai.expect(parametres.check_ids(['10', '20', '30'])).to.be.true;
  });

  it('called with a mixed array of numbers and strings and should return true.', () => {
    chai.expect(parametres.check_ids([1, '2', 3])).to.be.true;
  });

  it('called with an empty array and should return true.', () => {
    chai.expect(parametres.check_ids([])).to.be.true;
  });

  it('called with an array containing zero and should return false.', () => {
    chai.expect(parametres.check_ids([1, 0, 3])).to.be.false;
  });

  it('called with an array containing a negative number and should return false.', () => {
    chai.expect(parametres.check_ids([1, -5, 2])).to.be.false;
  });

  it('called with an array containing a non-numeric string and should return false.', () => {
    chai.expect(parametres.check_ids([1, 'hello', 2])).to.be.false;
  });

  it('called with a non-array value and should return false.', () => {
    chai.expect(parametres.check_ids('not-an-array')).to.be.false;
  });

  it('called with null and should return false.', () => {
    chai.expect(parametres.check_ids(null)).to.be.false;
  });

  it('called with undefined and should return true (defaults to empty array).', () => {
    chai.expect(parametres.check_ids(undefined)).to.be.true;
  });
});
describe('parametres.service.check_date()', () => {
  it('called with a valid Date object should return true.', () => {
    chai.expect(parametres.check_date(new Date())).to.be.true;
  });

  it('called with a valid date string should return true.', () => {
    chai.expect(parametres.check_date('2025-09-11')).to.be.true;
  });

  it('called with an invalid date string should return false.', () => {
    chai.expect(parametres.check_date('not-a-date')).to.be.false;
  });

  it('called with an empty string should return false.', () => {
    chai.expect(parametres.check_date('')).to.be.false;
  });

  it('called with null should return false.', () => {
    chai.expect(parametres.check_date(null)).to.be.false;
  });

  it('called with undefined should return false.', () => {
    chai.expect(parametres.check_date(undefined)).to.be.false;
  });

  it('called with a number timestamp should return true.', () => {
    chai.expect(parametres.check_date(Date.now())).to.be.true;
  });

  it('called with an invalid number should return false.', () => {
    chai.expect(parametres.check_date(NaN)).to.be.false;
  });
});
