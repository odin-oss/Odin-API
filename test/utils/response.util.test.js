import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiResponse } from '../../src/utils/response.util.js';
import { MissingArgumentError } from '../../src/utils/errors.util.js';
import logs from '../../src/middlewares/winston.js';

chai.use(sinonChai);

describe('ApiResponse Constructor', () => {
  it('should create a response with all required properties', () => {
    const response = new ApiResponse(true, { id: 1 }, null, 'User found');

    chai.expect(response.success).to.be.true;
    chai.expect(response.data).to.deep.equal({ id: 1 });
    chai.expect(response.error).to.be.null;
    chai.expect(response.message).to.equal('User found');
    chai.expect(response).to.have.property('timestamp');
  });

  it('should create a success response with data', () => {
    const userData = { id_user: 1, mail: 'test@example.com' };
    const response = new ApiResponse(true, userData, null, 'Success');

    chai.expect(response.success).to.be.true;
    chai.expect(response.data).to.deep.equal(userData);
  });

  it('should create an error response with error details', () => {
    const errorBody = { type: 'BadCredentials', message: 'Invalid password' };
    const response = new ApiResponse(false, null, errorBody, 'Failed');

    chai.expect(response.success).to.be.false;
    chai.expect(response.error).to.deep.equal(errorBody);
    chai.expect(response.data).to.be.null;
  });

  it('should handle optional data parameter (default null)', () => {
    const response = new ApiResponse(true, null, null, 'Created');

    chai.expect(response.data).to.be.null;
    chai.expect(response.success).to.be.true;
  });

  it('should handle optional error parameter (default null)', () => {
    const response = new ApiResponse(true, {}, null, 'OK');

    chai.expect(response.error).to.be.null;
  });

  it('should generate timestamp for each response', () => {
    const response1 = new ApiResponse(true, null, null, 'Test');
    const response2 = new ApiResponse(true, null, null, 'Test');

    chai.expect(response1).to.have.property('timestamp');
    chai.expect(response2).to.have.property('timestamp');
    chai.expect(response1.timestamp).to.be.a('string');
    chai.expect(response2.timestamp).to.be.a('string');
  });

  it('should validate required properties with schema', () => {
    try {
      new ApiResponse(true, {}, null, null);
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });

  it('should validate success is boolean', () => {
    try {
      new ApiResponse('true', {}, null, 'message');
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });

  it('should validate message is string', () => {
    try {
      new ApiResponse(true, {}, null, 123);
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });

  it('should accept complex data objects', () => {
    const complexData = {
      user: { id: 1, name: 'John' },
      permissions: ['read', 'write'],
      metadata: { created: '2026-02-27' },
    };
    const response = new ApiResponse(true, complexData, null, 'Complex data');

    chai.expect(response.data).to.deep.equal(complexData);
  });

  it('should accept array as data', () => {
    const arrayData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];
    const response = new ApiResponse(true, arrayData, null, 'Array data');

    chai.expect(response.data).to.deep.include({ id: 1, name: 'Item 1' });
  });
});

describe('ApiResponse.schema', () => {
  it('should have correct schema definition', () => {
    chai.expect(ApiResponse.schema).to.exist;
    chai.expect(ApiResponse.schema).to.be.an('object');
  });

  it('should validate schema with valid object', () => {
    const validData = {
      success: true,
      message: 'Test message',
      data: { id: 1 },
      error: null,
    };

    const result = ApiResponse.schema.safeParse(validData);
    chai.expect(result.success).to.be.true;
  });

  it('should reject schema with invalid data types', () => {
    const invalidData = {
      success: 'true',
      message: 'Test message',
    };

    const result = ApiResponse.schema.safeParse(invalidData);
    chai.expect(result.success).to.be.false;
  });
});

describe('ApiResponse.success()', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/api/users/1',
    };
    mockRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    sinon.stub(logs, 'info');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call res.status with 200 by default', () => {
    const data = { id: 1, name: 'John' };

    ApiResponse.success(mockReq, mockRes, data);

    chai.expect(mockRes.status.calledWith(200)).to.be.true;
  });

  it('should call res.json with ApiResponse instance', () => {
    const data = { id: 1 };

    ApiResponse.success(mockReq, mockRes, data);

    const jsonArg = mockRes.json.firstCall.args[0];
    chai.expect(jsonArg).to.be.instanceOf(ApiResponse);
    chai.expect(jsonArg.success).to.be.true;
    chai.expect(jsonArg.data).to.deep.equal(data);
  });

  it('should use default success message', () => {
    ApiResponse.success(mockReq, mockRes, {});

    const jsonArg = mockRes.json.firstCall.args[0];
    chai.expect(jsonArg.message).to.equal('Request successful');
  });

  it('should use custom success message', () => {
    const customMessage = 'User created successfully';

    ApiResponse.success(mockReq, mockRes, {}, 200, customMessage);

    const jsonArg = mockRes.json.firstCall.args[0];
    chai.expect(jsonArg.message).to.equal(customMessage);
  });

  it('should use custom status code', () => {
    ApiResponse.success(mockReq, mockRes, {}, 201, 'Created');

    chai.expect(mockRes.status.calledWith(201)).to.be.true;
  });

  it('should log info message with request method and status', () => {
    ApiResponse.success(mockReq, mockRes, {}, 201, 'Created');

    chai.expect(logs.info.called).to.be.true;
    const logMessage = logs.info.firstCall.args[0];
    chai.expect(logMessage).to.include('[GET]');
    chai.expect(logMessage).to.include('[201]');
    chai.expect(logMessage).to.include('Created');
  });

  it('should include originalUrl in log message', () => {
    ApiResponse.success(mockReq, mockRes, {}, 200, 'Success');

    const logMessage = logs.info.firstCall.args[0];
    chai.expect(logMessage).to.include('/api/users/1');
  });

  it('should set success flag to true', () => {
    ApiResponse.success(mockReq, mockRes, {});

    const jsonArg = mockRes.json.firstCall.args[0];
    chai.expect(jsonArg.success).to.be.true;
  });

  it('should set data property correctly', () => {
    const data = { id: 1, name: 'Test' };

    ApiResponse.success(mockReq, mockRes, data);

    const jsonArg = mockRes.json.firstCall.args[0];
    chai.expect(jsonArg.data).to.deep.equal(data);
  });

  it('should set error to null for success responses', () => {
    ApiResponse.success(mockReq, mockRes, {});

    const jsonArg = mockRes.json.firstCall.args[0];
    chai.expect(jsonArg.error).to.be.null;
  });

  it('should support various HTTP status codes', () => {
    const statusCodes = [200, 201, 202, 204];

    statusCodes.forEach((statusCode) => {
      mockRes.status.resetHistory();
      ApiResponse.success(mockReq, mockRes, {}, statusCode);
      chai.expect(mockRes.status.calledWith(statusCode)).to.be.true;
    });
  });
});

describe('ApiResponse.error()', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      originalUrl: '/api/users',
    };
    mockRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    sinon.stub(logs, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should use error code from error object', () => {
    const error = new Error('Database error');
    error.code = 500;
    error.name = 'DBError';

    ApiResponse.error(mockReq, mockRes, error);

    chai.expect(mockRes.status.calledWith(500)).to.be.true;
  });

  it('should default to 500 when error has no code', () => {
    const error = new Error('Unknown error');

    ApiResponse.error(mockReq, mockRes, error);

    chai.expect(mockRes.status.calledWith(500)).to.be.true;
  });

  it('should set success flag to false', () => {
    const error = new Error('Test error');
    error.code = 400;
    error.name = 'TestError';

    ApiResponse.error(mockReq, mockRes, error);

    const jsonArg = mockRes.json.firstCall.args[0];
    chai.expect(jsonArg.success).to.be.false;
  });

  it('should include error type and message in response', () => {
    const error = new Error('Invalid input');
    error.code = 400;
    error.name = 'ValidationError';

    ApiResponse.error(mockReq, mockRes, error);

    const jsonArg = mockRes.json.firstCall.args[0];
    chai.expect(jsonArg.error).to.have.property('type', 'ValidationError');
    chai.expect(jsonArg.error).to.have.property('message', 'Invalid input');
  });

  it('should set data to null for error responses', () => {
    const error = new Error('Not found');
    error.code = 404;
    error.name = 'NotFoundError';

    ApiResponse.error(mockReq, mockRes, error);

    const jsonArg = mockRes.json.firstCall.args[0];
    chai.expect(jsonArg.data).to.be.null;
  });

  it('should log error with request method, status, error name, and message', () => {
    const error = new Error('Database connection failed');
    error.code = 500;
    error.name = 'DBConnectionError';

    ApiResponse.error(mockReq, mockRes, error);

    chai.expect(logs.error.called).to.be.true;
    const logMessage = logs.error.firstCall.args[0];
    chai.expect(logMessage).to.include('[POST]');
    chai.expect(logMessage).to.include('[500]');
    chai.expect(logMessage).to.include('DBConnectionError');
    chai.expect(logMessage).to.include('Database connection failed');
  });

  it('should include originalUrl in error log', () => {
    const error = new Error('Test error');
    error.code = 400;
    error.name = 'TestError';

    ApiResponse.error(mockReq, mockRes, error);

    const logMessage = logs.error.firstCall.args[0];
    chai.expect(logMessage).to.include('/api/users');
  });

  it('should use error name in error body', () => {
    const error = new Error('Unauthorized');
    error.code = 401;
    error.name = 'UnauthorizedError';

    ApiResponse.error(mockReq, mockRes, error);

    const jsonArg = mockRes.json.firstCall.args[0];
    chai.expect(jsonArg.error.type).to.equal('UnauthorizedError');
  });

  it('should handle error without name property', () => {
    const error = { message: 'Generic error', code: 500 };

    ApiResponse.error(mockReq, mockRes, error);

    const jsonArg = mockRes.json.firstCall.args[0];
    chai.expect(jsonArg.error.type).to.equal('InternalError');
  });

  it('should handle error without message property', () => {
    const error = { code: 500, name: 'TestError', message: undefined };

    ApiResponse.error(mockReq, mockRes, error);

    const jsonArg = mockRes.json.firstCall.args[0];
    chai.expect(jsonArg.error.message).to.equal('An unexpected error occurred');
  });

  it('should use error message in response message field', () => {
    const error = new Error('Specific error message');
    error.code = 400;
    error.name = 'SpecificError';

    ApiResponse.error(mockReq, mockRes, error);

    const jsonArg = mockRes.json.firstCall.args[0];
    chai.expect(jsonArg.message).to.equal('Specific error message');
  });

  it('should support custom HTTP error codes', () => {
    const errorCodes = [400, 401, 403, 404, 500, 502, 503];

    errorCodes.forEach((code) => {
      mockRes.status.resetHistory();
      const error = new Error('Error');
      error.code = code;
      error.name = 'CustomError';

      ApiResponse.error(mockReq, mockRes, error);

      chai.expect(mockRes.status.calledWith(code)).to.be.true;
    });
  });

  it('should handle non-integer error codes by defaulting to 500', () => {
    const error = new Error('Test error');
    error.code = 'invalid';
    error.name = 'TestError';

    ApiResponse.error(mockReq, mockRes, error);

    chai.expect(mockRes.status.calledWith(500)).to.be.true;
  });
});

describe('ApiResponse Full Integration', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/api/test',
    };
    mockRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    sinon.stub(logs, 'info');
    sinon.stub(logs, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should handle success response flow', () => {
    const userData = { id: 1, name: 'John Doe' };

    ApiResponse.success(mockReq, mockRes, userData, 200, 'User retrieved');

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai.expect(mockRes.json.calledOnce).to.be.true;
    chai.expect(logs.info.calledOnce).to.be.true;

    const response = mockRes.json.firstCall.args[0];
    chai.expect(response.success).to.be.true;
    chai.expect(response.data).to.deep.equal(userData);
  });

  it('should handle error response flow', () => {
    const error = new Error('Not found');
    error.code = 404;
    error.name = 'NotFoundError';

    ApiResponse.error(mockReq, mockRes, error);

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai.expect(mockRes.json.calledOnce).to.be.true;
    chai.expect(logs.error.calledOnce).to.be.true;

    const response = mockRes.json.firstCall.args[0];
    chai.expect(response.success).to.be.false;
    chai.expect(response.error.type).to.equal('NotFoundError');
  });

  it('should return valid JSON structure for success', () => {
    const data = { test: 'value' };

    ApiResponse.success(mockReq, mockRes, data, 200, 'OK');

    const response = mockRes.json.firstCall.args[0];
    chai
      .expect(response)
      .to.have.all.keys('success', 'message', 'data', 'error', 'timestamp');
  });

  it('should return valid JSON structure for error', () => {
    const error = new Error('Error');
    error.code = 400;
    error.name = 'BadRequest';

    ApiResponse.error(mockReq, mockRes, error);

    const response = mockRes.json.firstCall.args[0];
    chai
      .expect(response)
      .to.have.all.keys('success', 'message', 'data', 'error', 'timestamp');
  });
});
