import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Guard from '../../src/utils/guard.util.js';
import {
  BadTypeArgumentError,
  MissingArgumentError,
  ParameterMisformed,
} from '../../src/utils/errors.util.js';
import z from 'zod';

chai.use(sinonChai);

describe('Guard.validateProps()', () => {
  it('should return validated data when props match schema', () => {
    const schema = z.object({
      id_user: z.number().positive(),
      mail: z.string().email(),
    });

    const props = {
      id_user: 1,
      mail: 'test@example.com',
    };

    const result = Guard.validateProps(schema, props);

    chai.expect(result).to.deep.equal({
      id_user: 1,
      mail: 'test@example.com',
    });
  });

  it('should throw MissingArgumentError when required prop is missing', () => {
    const schema = z.object({
      id_user: z.number().positive(),
      mail: z.string().email(),
    });

    const props = {
      id_user: 1,
    };

    try {
      Guard.validateProps(schema, props);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.code).to.equal(400);
      chai.expect(err.message).to.include('Missing arguments');
    }
  });

  it('should throw MissingArgumentError when multiple props are missing', () => {
    const schema = z.object({
      id_user: z.number().positive(),
      mail: z.string().email(),
      firstname: z.string(),
    });

    const props = {};

    try {
      Guard.validateProps(schema, props);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.message).to.include('Missing arguments');
    }
  });

  it('should throw ParameterMisformed when prop does not match schema validation rules', () => {
    const schema = z.object({
      id_user: z.number().positive(),
    });

    const props = {
      id_user: 0,
    };

    try {
      Guard.validateProps(schema, props);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw ParameterMisformed when email format is invalid', () => {
    const schema = z.object({
      mail: z.string().email(),
    });

    const props = {
      mail: 'invalid-email',
    };

    try {
      Guard.validateProps(schema, props);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw ParameterMisformed when string validation fails', () => {
    const schema = z.object({
      token: z
        .string()
        .startsWith('Bearer ', { message: 'Token must start with Bearer' }),
    });

    const props = {
      token: 'InvalidToken',
    };

    try {
      Guard.validateProps(schema, props);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw MissingArgumentError when array is expected but string provided', () => {
    const schema = z.object({
      ids: z.array(z.number()),
    });

    const props = {
      ids: '123',
    };

    try {
      Guard.validateProps(schema, props);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should validate optional properties correctly', () => {
    const schema = z.object({
      id_user: z.number().positive(),
      email: z.string().email().optional(),
    });

    const props = {
      id_user: 1,
    };

    const result = Guard.validateProps(schema, props);
    chai.expect(result).to.deep.equal({ id_user: 1 });
  });

  it('should apply transformations defined in schema', () => {
    const schema = z.object({
      token: z
        .string()
        .startsWith('Bearer ', { message: 'Token must start with Bearer' })
        .transform((val) => val.slice(7)),
    });

    const props = {
      token: 'Bearer test_token_123',
    };

    const result = Guard.validateProps(schema, props);
    chai.expect(result.token).to.equal('test_token_123');
  });
});

describe('Guard.check_query()', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      query: {},
      method: 'GET',
      originalUrl: '/test',
    };
  });

  it('should return true when all expected keys are present in query', () => {
    mockReq.query = {
      id_user: '1',
      action: 'delete',
    };

    const result = Guard.check_query(mockReq, ['id_user', 'action']);

    chai.expect(result).to.be.true;
  });

  it('should throw MissingArgumentError when a required query key is missing', () => {
    mockReq.query = {
      id_user: '1',
    };

    try {
      Guard.check_query(mockReq, ['id_user', 'action']);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.code).to.equal(400);
      chai.expect(err.message).to.include('action');
    }
  });

  it('should throw MissingArgumentError when multiple query keys are missing', () => {
    mockReq.query = {};

    try {
      Guard.check_query(mockReq, ['id_user', 'action', 'filter']);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.message).to.include('id_user');
      chai.expect(err.message).to.include('action');
      chai.expect(err.message).to.include('filter');
    }
  });

  it('should throw BadTypeArgumentError when expectedKeys is not an array', () => {
    try {
      Guard.check_query(mockReq, 'id_user');
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadTypeArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw BadTypeArgumentError when expectedKeys contains non-string elements', () => {
    try {
      Guard.check_query(mockReq, ['id_user', 123, 'action']);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadTypeArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw BadTypeArgumentError when req is not a valid request object', () => {
    try {
      Guard.check_query({ invalid: 'req' }, ['id_user']);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadTypeArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should return true when query has extra keys beyond expected ones', () => {
    mockReq.query = {
      id_user: '1',
      action: 'delete',
      extra_key: 'value',
    };

    const result = Guard.check_query(mockReq, ['id_user', 'action']);

    chai.expect(result).to.be.true;
  });

  it('should work with empty expectedKeys array', () => {
    mockReq.query = {};

    const result = Guard.check_query(mockReq, []);

    chai.expect(result).to.be.true;
  });
});

describe('Guard.check_body()', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      body: {},
      method: 'POST',
      originalUrl: '/test',
    };
  });

  it('should return true when all expected keys are present in body', () => {
    mockReq.body = {
      firstname: 'John',
      lastname: 'Doe',
      mail: 'john@example.com',
    };

    const result = Guard.check_body(mockReq, [
      'firstname',
      'lastname',
      'mail',
    ]);

    chai.expect(result).to.be.true;
  });

  it('should throw MissingArgumentError when a required body key is missing', () => {
    mockReq.body = {
      firstname: 'John',
      lastname: 'Doe',
    };

    try {
      Guard.check_body(mockReq, ['firstname', 'lastname', 'mail']);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.code).to.equal(400);
      chai.expect(err.message).to.include('mail');
    }
  });

  it('should throw MissingArgumentError when multiple body keys are missing', () => {
    mockReq.body = {
      firstname: 'John',
    };

    try {
      Guard.check_body(mockReq, ['firstname', 'lastname', 'mail']);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.message).to.include('lastname');
      chai.expect(err.message).to.include('mail');
    }
  });

  it('should throw BadTypeArgumentError when expectedKeys is not an array', () => {
    try {
      Guard.check_body(mockReq, { firstname: true });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadTypeArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw BadTypeArgumentError when expectedKeys contains non-string elements', () => {
    try {
      Guard.check_body(mockReq, ['firstname', null, 'mail']);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadTypeArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw BadTypeArgumentError when req is not a valid request object', () => {
    try {
      Guard.check_body(null, ['firstname']);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadTypeArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should return true when body has extra keys beyond expected ones', () => {
    mockReq.body = {
      firstname: 'John',
      lastname: 'Doe',
      mail: 'john@example.com',
      extra_field: 'ignored',
    };

    const result = Guard.check_body(mockReq, [
      'firstname',
      'lastname',
      'mail',
    ]);

    chai.expect(result).to.be.true;
  });

  it('should work with empty expectedKeys array', () => {
    mockReq.body = {};

    const result = Guard.check_body(mockReq, []);

    chai.expect(result).to.be.true;
  });
});

describe('Guard.check_params()', () => {
  let mockReq;

  beforeEach(() => {
    mockReq = {
      params: {},
      method: 'GET',
      originalUrl: '/test/:id',
    };
  });

  it('should return true when all expected keys are present in params', () => {
    mockReq.params = {
      id: '1',
      hash: 'abc123',
    };

    const result = Guard.check_params(mockReq, ['id', 'hash']);

    chai.expect(result).to.be.true;
  });

  it('should throw MissingArgumentError when a required params key is missing', () => {
    mockReq.params = {
      id: '1',
    };

    try {
      Guard.check_params(mockReq, ['id', 'hash']);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.code).to.equal(400);
      chai.expect(err.message).to.include('hash');
    }
  });

  it('should throw MissingArgumentError when multiple params keys are missing', () => {
    mockReq.params = {};

    try {
      Guard.check_params(mockReq, ['id', 'hash', 'action']);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.message).to.include('id');
      chai.expect(err.message).to.include('hash');
      chai.expect(err.message).to.include('action');
    }
  });

  it('should throw BadTypeArgumentError when expectedKeys is not an array', () => {
    try {
      Guard.check_params(mockReq, 'id');
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadTypeArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw BadTypeArgumentError when expectedKeys contains non-string elements', () => {
    try {
      Guard.check_params(mockReq, ['id', {}, 'hash']);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadTypeArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw BadTypeArgumentError when req is not a valid request object', () => {
    try {
      Guard.check_params('invalid', ['id']);
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(BadTypeArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should return true when params has extra keys beyond expected ones', () => {
    mockReq.params = {
      id: '1',
      hash: 'abc123',
      extra_param: 'value',
    };

    const result = Guard.check_params(mockReq, ['id', 'hash']);

    chai.expect(result).to.be.true;
  });

  it('should work with empty expectedKeys array', () => {
    mockReq.params = {};

    const result = Guard.check_params(mockReq, []);

    chai.expect(result).to.be.true;
  });

  it('should handle numeric param values', () => {
    mockReq.params = {
      id: '123',
      version: '1',
    };

    const result = Guard.check_params(mockReq, ['id', 'version']);

    chai.expect(result).to.be.true;
  });
});
