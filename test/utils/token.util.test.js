import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_util from '../../src/utils/token.util.js';
import {
  BadContentTokenError,
  MissingArgumentError,
  ParameterMisformed,
  UserIsNotAdmin,
  UserIsNotProfessor,
  UserIsNeitherProfOrAdmin,
  UserIsNotOwner,
} from '../../src/utils/errors.util.js';
import { ApiResponse } from '../../src/utils/response.util.js';
import CONFIG from '../../src/config/config.js';

chai.use(sinonChai);

describe('token.util.generateToken()', () => {
  it('should generate a token with valid id_user', () => {
    const mockSign = sinon.stub().returns('test_token');
    const result = token_util.generateToken(
      { id_user: 1 },
      { jwt_sign: mockSign }
    );

    chai.expect(result).to.equal('test_token');
    chai.expect(mockSign.calledOnce).to.be.true;
    chai
      .expect(mockSign.firstCall.args[0])
      .to.deep.include({ id_user: 1 });
  });

  it('should throw MissingArgumentError when id_user is missing', () => {
    try {
      token_util.generateToken({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw ParameterMisformed when id_user is zero', () => {
    try {
      token_util.generateToken({ id_user: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw ParameterMisformed when id_user is negative', () => {
    try {
      token_util.generateToken({ id_user: -1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw MissingArgumentError when id_user is not a number', () => {
    try {
      token_util.generateToken({ id_user: 'abc' });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });
});

describe('token.util.decodeToken()', () => {
  it('should decode a valid token with Bearer prefix', () => {
    const mockDecode = sinon
      .stub()
      .returns({ id_user: 1, iat: 123456 });
    const result = token_util.decodeToken(
      { token: 'Bearer test_token' },
      { jwt_decode: mockDecode }
    );

    chai.expect(result).to.deep.equal({ id_user: 1, iat: 123456 });
    chai.expect(mockDecode.calledOnce).to.be.true;
    chai.expect(mockDecode.firstCall.args[0]).to.equal('test_token');
  });

  it('should throw ParameterMisformed when token does not start with Bearer', () => {
    try {
      token_util.decodeToken({ token: 'InvalidToken' });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw MissingArgumentError when token is missing', () => {
    try {
      token_util.decodeToken({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai.expect(err.code).to.equal(400);
    }
  });

  it('should throw ParameterMisformed when token is empty string', () => {
    try {
      token_util.decodeToken({ token: '' });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai.expect(err.code).to.equal(400);
    }
  });
});

describe('token.util.getUserId()', () => {
  it('should extract id_user from valid token', () => {
    const mockDecodeToken = sinon
      .stub()
      .returns({ id_user: 42, iat: 123456 });
    const result = token_util.getUserId(
      { token: 'Bearer valid_token' },
      { decode_token: mockDecodeToken }
    );

    chai.expect(result).to.equal(42);
    chai.expect(mockDecodeToken.calledOnce).to.be.true;
  });

  it('should throw ParameterMisformed when token does not start with Bearer', () => {
    try {
      token_util.getUserId({ token: 'InvalidToken' });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
    }
  });

  it('should throw MissingArgumentError when token is missing', () => {
    try {
      token_util.getUserId({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });
});

describe('token.util.isTokenValid()', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      originalUrl: '/test',
      method: 'GET',
    };
    mockRes = {
      set: sinon.stub().returns(undefined),
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    mockNext = sinon.stub();
  });

  it('should call next() when token is valid', async () => {
    mockReq.headers['authorization'] = 'Bearer valid_token';
    const mockVerify = sinon.stub().returns({ id_user: 1 });
    const mockGenerateToken = sinon.stub().returns('new_token');

    await token_util.isTokenValid(mockReq, mockRes, mockNext, {
      jwt_verify: mockVerify,
      generate_token: mockGenerateToken,
    });

    chai.expect(mockNext.calledOnce).to.be.true;
    chai.expect(mockRes.set.called).to.be.true;
  });

  it('should throw BadContentTokenError when authorization header is missing', async () => {
    const mockVerify = sinon.stub();
    const mockGenerateToken = sinon.stub();

    await token_util.isTokenValid(mockReq, mockRes, mockNext, {
      jwt_verify: mockVerify,
      generate_token: mockGenerateToken,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(403);
  });

  it('should throw BadContentTokenError when token does not start with Bearer', async () => {
    mockReq.headers['authorization'] = 'InvalidToken';
    const mockVerify = sinon.stub();
    const mockGenerateToken = sinon.stub();

    await token_util.isTokenValid(mockReq, mockRes, mockNext, {
      jwt_verify: mockVerify,
      generate_token: mockGenerateToken,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(403);
  });

  it('should throw BadContentTokenError when verified token has no id_user', async () => {
    mockReq.headers['authorization'] = 'Bearer valid_token';
    const mockVerify = sinon.stub().returns({});
    const mockGenerateToken = sinon.stub();

    await token_util.isTokenValid(mockReq, mockRes, mockNext, {
      jwt_verify: mockVerify,
      generate_token: mockGenerateToken,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(403);
  });

  it('should regenerate token on successful verification', async () => {
    mockReq.headers['authorization'] = 'Bearer valid_token';
    const mockVerify = sinon.stub().returns({ id_user: 5 });
    const mockGenerateToken = sinon.stub().returns('new_token_123');

    await token_util.isTokenValid(mockReq, mockRes, mockNext, {
      jwt_verify: mockVerify,
      generate_token: mockGenerateToken,
    });

    chai
      .expect(mockGenerateToken.calledWith({ id_user: 5 }))
      .to.be.true;
    chai
      .expect(mockRes.set.calledWith('authorization', 'Bearer new_token_123'))
      .to.be.true;
  });
});

describe('token.util.isProfOrAdmin()', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: { authorization: 'Bearer valid_token' },
      originalUrl: '/test',
      method: 'GET',
    };
    mockRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    mockNext = sinon.stub();
  });

  it('should call next() when user is ADMINISTRATEUR', async () => {
    const mockGetUserId = sinon.stub().returns(1);
    const mockGetRole = sinon.stub().resolves('ADMINISTRATEUR');

    await token_util.isProfOrAdmin(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      getRole: mockGetRole,
    });

    chai.expect(mockNext.calledOnce).to.be.true;
  });

  it('should call next() when user is PROFESSEUR', async () => {
    const mockGetUserId = sinon.stub().returns(2);
    const mockGetRole = sinon.stub().resolves('PROFESSEUR');

    await token_util.isProfOrAdmin(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      getRole: mockGetRole,
    });

    chai.expect(mockNext.calledOnce).to.be.true;
  });

  it('should throw UserIsNeitherProfOrAdmin when user is ETUDIANT', async () => {
    const mockGetUserId = sinon.stub().returns(3);
    const mockGetRole = sinon.stub().resolves('ETUDIANT');

    await token_util.isProfOrAdmin(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      getRole: mockGetRole,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(403);
  });

  it('should handle errors when getUserId throws', async () => {
    const mockGetUserId = sinon
      .stub()
      .throws(new MissingArgumentError('Token missing'));
    const mockGetRole = sinon.stub();

    await token_util.isProfOrAdmin(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      getRole: mockGetRole,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(400);
  });
});

describe('token.util.isAdmin()', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: { authorization: 'Bearer valid_token' },
      originalUrl: '/test',
      method: 'GET',
    };
    mockRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    mockNext = sinon.stub();
  });

  it('should call next() when user is ADMINISTRATEUR', async () => {
    const mockGetUserId = sinon.stub().returns(1);
    const mockGetRole = sinon.stub().resolves('ADMINISTRATEUR');

    await token_util.isAdmin(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      getRole: mockGetRole,
    });

    chai.expect(mockNext.calledOnce).to.be.true;
  });

  it('should throw UserIsNotAdmin when user is PROFESSEUR', async () => {
    const mockGetUserId = sinon.stub().returns(2);
    const mockGetRole = sinon.stub().resolves('PROFESSEUR');

    await token_util.isAdmin(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      getRole: mockGetRole,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(403);
  });

  it('should throw UserIsNotAdmin when user is ETUDIANT', async () => {
    const mockGetUserId = sinon.stub().returns(3);
    const mockGetRole = sinon.stub().resolves('ETUDIANT');

    await token_util.isAdmin(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      getRole: mockGetRole,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(403);
  });

  it('should handle errors when getRole throws', async () => {
    const mockGetUserId = sinon.stub().returns(1);
    const mockGetRole = sinon
      .stub()
      .rejects(new Error('Database error'));

    await token_util.isAdmin(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      getRole: mockGetRole,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(500);
  });
});

describe('token.util.isProf()', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: { authorization: 'Bearer valid_token' },
      originalUrl: '/test',
      method: 'GET',
    };
    mockRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    mockNext = sinon.stub();
  });

  it('should call next() when user is PROFESSEUR', async () => {
    const mockGetUserId = sinon.stub().returns(2);
    const mockGetRole = sinon.stub().resolves('PROFESSEUR');

    await token_util.isProf(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      getRole: mockGetRole,
    });

    chai.expect(mockNext.calledOnce).to.be.true;
  });

  it('should throw UserIsNotProfessor when user is ADMINISTRATEUR', async () => {
    const mockGetUserId = sinon.stub().returns(1);
    const mockGetRole = sinon.stub().resolves('ADMINISTRATEUR');

    await token_util.isProf(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      getRole: mockGetRole,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(403);
  });

  it('should throw UserIsNotProfessor when user is ETUDIANT', async () => {
    const mockGetUserId = sinon.stub().returns(3);
    const mockGetRole = sinon.stub().resolves('ETUDIANT');

    await token_util.isProf(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      getRole: mockGetRole,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(403);
  });

  it('should handle errors when getUserId throws', async () => {
    const mockGetUserId = sinon
      .stub()
      .throws(new ParameterMisformed('Invalid token'));
    const mockGetRole = sinon.stub();

    await token_util.isProf(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      getRole: mockGetRole,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(400);
  });
});

describe('token.util.isOwner()', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: { authorization: 'Bearer valid_token' },
      query: { key: 'app_key_123' },
      originalUrl: '/test',
      method: 'GET',
    };
    mockRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    mockNext = sinon.stub();
  });

  it('should call next() when user is owner of application', async () => {
    const mockGetUserId = sinon.stub().returns(1);
    const mockIsOwner = sinon.stub().resolves(true);
    const mockGetRole = sinon.stub().resolves('ETUDIANT');

    await token_util.isOwner(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      isOwner: mockIsOwner,
      getRole: mockGetRole,
    });

    chai.expect(mockNext.calledOnce).to.be.true;
  });

  it('should call next() when user is ADMINISTRATEUR', async () => {
    const mockGetUserId = sinon.stub().returns(2);
    const mockIsOwner = sinon.stub().resolves(false);
    const mockGetRole = sinon.stub().resolves('ADMINISTRATEUR');

    await token_util.isOwner(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      isOwner: mockIsOwner,
      getRole: mockGetRole,
    });

    chai.expect(mockNext.calledOnce).to.be.true;
  });

  it('should throw UserIsNotOwner when user is neither owner nor admin', async () => {
    const mockGetUserId = sinon.stub().returns(3);
    const mockIsOwner = sinon.stub().resolves(false);
    const mockGetRole = sinon.stub().resolves('ETUDIANT');

    await token_util.isOwner(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      isOwner: mockIsOwner,
      getRole: mockGetRole,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(403);
  });

  it('should throw MissingArgumentError when neither key nor id_application provided', async () => {
    mockReq.query = {};
    const mockGetUserId = sinon.stub();
    const mockIsOwner = sinon.stub();
    const mockGetRole = sinon.stub();

    await token_util.isOwner(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      isOwner: mockIsOwner,
      getRole: mockGetRole,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(400);
  });

  it('should handle errors when getRole throws', async () => {
    const mockGetUserId = sinon.stub().returns(1);
    const mockIsOwner = sinon.stub().resolves(true);
    const mockGetRole = sinon
      .stub()
      .rejects(new Error('Database error'));

    await token_util.isOwner(mockReq, mockRes, mockNext, {
      getUserId: mockGetUserId,
      isOwner: mockIsOwner,
      getRole: mockGetRole,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(500);
  });
});

describe('token.util.app_access_granted()', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      headers: { authorization: 'Bearer valid_token' },
      params: { hash: 'app_hash_123' },
      originalUrl: '/test-app-ingress/action',
      url: '/test-app-ingress/action',
      method: 'GET',
    };
    mockRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  it('should return result: true when user is admin', async () => {
    const mockVerify = sinon.stub().returns({ id_user: 1 });
    const mockAppGet = sinon.stub().resolves({ id_application: 1, id_user: 2 });
    const mockAuthRole = sinon.stub().resolves('ADMINISTRATEUR');
    const mockHistoryCreate = sinon.stub().resolves();

    await token_util.app_access_granted(mockReq, mockRes, {
      jwt_verify: mockVerify,
      application_get: mockAppGet,
      auth_role: mockAuthRole,
      history_create: mockHistoryCreate,
    });

    chai.expect(mockRes.status.calledWith(200)).to.be.true;
    const response = mockRes.json.firstCall.args[0];
    chai.expect(response.result).to.be.true;
  });

  it('should return result: true when user is application owner', async () => {
    const mockVerify = sinon.stub().returns({ id_user: 1 });
    const mockAppGet = sinon.stub().resolves({ id_application: 1, id_user: 1 });
    const mockAuthRole = sinon.stub().resolves('ETUDIANT');
    const mockHistoryCreate = sinon.stub().resolves();

    await token_util.app_access_granted(mockReq, mockRes, {
      jwt_verify: mockVerify,
      application_get: mockAppGet,
      auth_role: mockAuthRole,
      history_create: mockHistoryCreate,
    });

    chai.expect(mockRes.status.calledWith(200)).to.be.true;
    const response = mockRes.json.firstCall.args[0];
    chai.expect(response.result).to.be.true;
  });

  it('should return result: false when user is neither admin nor owner', async () => {
    const mockVerify = sinon.stub().returns({ id_user: 1 });
    const mockAppGet = sinon.stub().resolves({ id_application: 1, id_user: 2 });
    const mockAuthRole = sinon.stub().resolves('ETUDIANT');
    const mockHistoryCreate = sinon.stub().resolves();

    await token_util.app_access_granted(mockReq, mockRes, {
      jwt_verify: mockVerify,
      application_get: mockAppGet,
      auth_role: mockAuthRole,
      history_create: mockHistoryCreate,
    });

    chai.expect(mockRes.status.calledWith(403)).to.be.true;
    const response = mockRes.json.firstCall.args[0];
    chai.expect(response.result).to.be.false;
  });

  it('should throw MissingArgumentError when authorization header is missing', async () => {
    mockReq.headers = {};
    const mockVerify = sinon.stub();
    const mockAppGet = sinon.stub();
    const mockAuthRole = sinon.stub();
    const mockHistoryCreate = sinon.stub();

    await token_util.app_access_granted(mockReq, mockRes, {
      jwt_verify: mockVerify,
      application_get: mockAppGet,
      auth_role: mockAuthRole,
      history_create: mockHistoryCreate,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(400);
  });

  it('should throw BadContentTokenError when token is invalid', async () => {
    const mockVerify = sinon.stub().returns({});
    const mockAppGet = sinon.stub();
    const mockAuthRole = sinon.stub();
    const mockHistoryCreate = sinon.stub();

    await token_util.app_access_granted(mockReq, mockRes, {
      jwt_verify: mockVerify,
      application_get: mockAppGet,
      auth_role: mockAuthRole,
      history_create: mockHistoryCreate,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(403);
  });

  it('should throw ParameterMisformed when Bearer prefix is missing', async () => {
    mockReq.headers['authorization'] = 'InvalidToken';
    const mockVerify = sinon.stub();
    const mockAppGet = sinon.stub();
    const mockAuthRole = sinon.stub();
    const mockHistoryCreate = sinon.stub();

    await token_util.app_access_granted(mockReq, mockRes, {
      jwt_verify: mockVerify,
      application_get: mockAppGet,
      auth_role: mockAuthRole,
      history_create: mockHistoryCreate,
    });

    chai.expect(mockRes.status.calledOnce).to.be.true;
    chai
      .expect(mockRes.status.firstCall.args[0])
      .to.equal(400);
  });
});
