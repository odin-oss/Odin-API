import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.service.js';
import CONFIG from '../../src/config/config.js';
import jwt from 'jsonwebtoken';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../src/utils/errors.service.js';
import { Application } from '../../src/objects/Application.js';
import moment from 'moment-timezone';
import { Environment } from '../../src/objects/Environment.js';
const { sign } = jwt;
chai.use(sinonChai);

describe('token_service.generateToken()', () => {
  let fakeSign, saveCONFIG;
  beforeEach(() => {
    fakeSign = sinon.stub();
    saveCONFIG = CONFIG;
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.duration_token = saveCONFIG.duration_token;
    CONFIG.jwt_token = saveCONFIG.jwt_token;
  });
  it('called with good argument and should return a token.', () => {
    CONFIG.jwt_token = 'JWTTOKEN';
    CONFIG.duration_token = '1d';
    const expected_token = sign(
      {
        id_user: 1,
      },
      'JWTTOKEN',
      {
        expiresIn: '1d',
      }
    );
    fakeSign.returns(expected_token);
    const token = token_service.generateToken(
      { id_user: 1 },
      { jwt_sign: fakeSign }
    );
    chai.expect(fakeSign).to.have.been.calledOnceWithExactly(
      {
        id_user: 1,
      },
      'JWTTOKEN',
      {
        expiresIn: '1d',
      }
    );
    chai.expect(token).to.be.equal(expected_token);
  });
  it('called with missing argument and should reject with MissingArgumentError.', () => {
    try {
      token_service.generateToken({}, { jwt_sign: fakeSign });
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeSign).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_user) are missing.');
    }
  });
  it('called with misformed argument and should reject with ParameterMisformed.', () => {
    try {
      token_service.generateToken(
        { id_user: 'misformed' },
        { jwt_sign: fakeSign }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeSign).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_user parameter is misformed.');
    }
  });
});
describe('token_service.decodeToken()', () => {
  let fakeDecode, saveCONFIG;
  beforeEach(() => {
    fakeDecode = sinon.stub();
    saveCONFIG = CONFIG;
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.duration_token = saveCONFIG.duration_token;
    CONFIG.jwt_token = saveCONFIG.jwt_token;
  });
  it('called with good argument and should return a JSON object with id_user in it.', () => {
    CONFIG.jwt_token = 'JWTTOKEN';
    CONFIG.duration_token = '1d';
    const token = sign(
      {
        id_user: 1,
      },
      'JWTTOKEN',
      {
        expiresIn: '1d',
      }
    );
    fakeDecode.returns({ id_user: 1 });
    const token_content = token_service.decodeToken(
      { token: 'Bearer ' + token },
      { jwt_decode: fakeDecode }
    );
    chai.expect(fakeDecode).to.have.been.calledOnceWithExactly(token);
    chai.expect(token_content).to.deep.equal({ id_user: 1 });
  });
  it('called with missing argument and should reject with MissingArgumentError.', () => {
    try {
      token_service.decodeToken({}, { jwt_decode: fakeDecode });
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeDecode).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (token) are missing.');
    }
  });
  it('called with misformed argument and should reject with ParameterMisformed.', () => {
    try {
      token_service.decodeToken(
        { token: 'misformed' },
        { jwt_decode: fakeDecode }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeDecode).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.token parameter is misformed.');
    }
  });
});
describe('token_service.getUserId()', () => {
  let fakeDecode, saveCONFIG;
  beforeEach(() => {
    fakeDecode = sinon.stub();
    saveCONFIG = CONFIG;
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.duration_token = saveCONFIG.duration_token;
    CONFIG.jwt_token = saveCONFIG.jwt_token;
  });
  it('called with good argument and should return a JSON object with id_user in it.', () => {
    CONFIG.jwt_token = 'JWTTOKEN';
    CONFIG.duration_token = '1d';
    const token = sign(
      {
        id_user: 1,
      },
      'JWTTOKEN',
      {
        expiresIn: '1d',
      }
    );
    fakeDecode.returns({ id_user: 1 });
    const id_user = token_service.getUserId(
      { token: 'Bearer ' + token },
      { decode_token: fakeDecode }
    );
    chai
      .expect(fakeDecode)
      .to.have.been.calledOnceWithExactly({ token: 'Bearer ' + token });
    chai.expect(id_user).to.equal(1);
  });
  it('called with missing argument and should reject with MissingArgumentError.', () => {
    try {
      token_service.getUserId({}, { decode_token: fakeDecode });
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeDecode).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (token) are missing.');
    }
  });
  it('called with misformed argument and should reject with ParameterMisformed.', () => {
    try {
      token_service.getUserId(
        { token: 'misformed' },
        { decode_token: fakeDecode }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeDecode).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.token parameter is misformed.');
    }
  });
});
describe('token_service.isTokenValid()', () => {
  let fakeVerify, fakeGenerateToken, fakeReq, fakeRes, saveCONFIG, fakeNext;
  const token = token_service.generateToken({ id_user: 1 });

  beforeEach(() => {
    fakeVerify = sinon.stub();
    fakeGenerateToken = sinon.stub();
    fakeNext = sinon.stub();
    saveCONFIG = CONFIG;
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      method: 'GET',
      originalUrl: '/application/list',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      set: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.jwt_token = saveCONFIG.jwt_token;
  });
  it('called with good token and should call next().', async () => {
    fakeVerify.returns({
      id_user: 1,
    });
    fakeGenerateToken.returns(token_service.generateToken({ id_user: 1 }));
    await token_service.isTokenValid(fakeReq, fakeRes, fakeNext, {
      jwt_verify: fakeVerify,
      generate_token: fakeGenerateToken,
    });
    chai
      .expect(fakeVerify)
      .to.have.been.calledOnceWithExactly(token, CONFIG.jwt_token);
    chai.expect(fakeGenerateToken).to.have.been.calledOnceWithExactly({
      id_user: 1,
    });
    chai.expect(fakeNext).to.have.been.calledOnce;
    chai.expect(fakeRes.json).to.not.have.been.calledOnce;
    chai.expect(fakeRes.status).to.not.have.been.calledOnce;
  });
  it('called without token and should returns with MissingArgumentError.', async () => {
    fakeReq = {
      headers: {},
      method: 'GET',
      originalUrl: '/application/list',
    };
    await token_service.isTokenValid(fakeReq, fakeRes, fakeNext, {
      jwt_verify: fakeVerify,
      generate_token: fakeGenerateToken,
    });
    chai.expect(fakeVerify).to.not.have.been.called;
    chai.expect(fakeGenerateToken).to.not.have.been.called;
    chai.expect(fakeNext).to.not.have.been.calledOnce;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(401);
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'MissingArgumentError',
        message: 'The token is missing.',
      },
    });
    chai.expect(fakeRes.set).to.not.have.been.calledOnce;
  });
  it('called with misformed token and should returns with ParameterMisformed.', async () => {
    fakeReq = {
      headers: {
        authorization: 'Misformed',
      },
      method: 'GET',
      originalUrl: '/application/list',
    };
    await token_service.isTokenValid(fakeReq, fakeRes, fakeNext, {
      jwt_verify: fakeVerify,
      generate_token: fakeGenerateToken,
    });
    chai.expect(fakeVerify).to.not.have.been.called;
    chai.expect(fakeGenerateToken).to.not.have.been.called;
    chai.expect(fakeNext).to.not.have.been.calledOnce;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(401);
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'ParameterMisformed',
        message: 'The props.token parameter is misformed.',
      },
    });
    chai.expect(fakeRes.set).to.not.have.been.calledOnce;
  });
  it('called with wrong content token and should returns with BadContentTokenError.', async () => {
    fakeVerify.returns({
      name: 'ulfi',
    });
    fakeGenerateToken.returns(token_service.generateToken({ id_user: 1 }));
    await token_service.isTokenValid(fakeReq, fakeRes, fakeNext, {
      jwt_verify: fakeVerify,
      generate_token: fakeGenerateToken,
    });
    chai
      .expect(fakeVerify)
      .to.have.been.calledOnceWithExactly(token, CONFIG.jwt_token);
    chai.expect(fakeGenerateToken).to.not.have.been.called;
    chai.expect(fakeNext).to.not.have.been.calledOnce;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(401);
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'BadContentTokenError',
        message: 'The token does not have proper attribute.',
      },
    });
    chai.expect(fakeRes.set).to.not.have.been.calledOnce;
  });
});
describe('token_service.app_access_granted()', () => {
  let fakeVerify,
    fakeReq,
    fakeRes,
    saveCONFIG,
    fakeGet,
    fakeGetRole,
    fakeCreateHistory;
  const token = token_service.generateToken({ id_user: 1 });
  beforeEach(() => {
    fakeVerify = sinon.stub();
    fakeGet = sinon.stub();
    saveCONFIG = CONFIG;
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        token: token,
      },
      params: {
        hash: 'hash12',
      },
      method: 'GET',
      originalUrl: '/application/apps-ingress-encrypted',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    fakeGetRole = sinon.stub();
    fakeCreateHistory = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.jwt_token = saveCONFIG.jwt_token;
  });
  it('called with good token and should return with true.', async () => {
    fakeVerify.returns({
      id_user: 1,
    });
    fakeGet.resolves(
      Promise.resolve(
        new Application({
          id_application: 9,
          custom_label: 'Application de travail',
          generated_label: 'shrek-donkey-fiona',
          creation_date: moment.tz(CONFIG.APP_TZ),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: 1,
          id_environment: 3,
          state_application: 'Ready',
          state_changed_date: moment.tz(CONFIG.APP_TZ),
          programming_shutdown_date: null,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [],
          }),
        })
      )
    );
    await token_service.app_access_granted(fakeReq, fakeRes, {
      jwt_verify: fakeVerify,
      application_get: fakeGet,
      auth_role: fakeGetRole,
      history_create: fakeCreateHistory,
    });
    chai
      .expect(fakeVerify)
      .to.have.been.calledOnceWithExactly(token, CONFIG.jwt_token);
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: true,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
  it('called with not good token and should reject with BadContentTokenError.', async () => {
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
        odintoken: token,
      },
      query: {
        token: token,
      },
      params: {
        hash: 'hash12',
      },
      method: 'GET',
      originalUrl: '/application/apps-ingress-encrypted',
    };
    fakeVerify.returns({ id_password: 1 });
    await token_service.app_access_granted(fakeReq, fakeRes, {
      jwt_verify: fakeVerify,
      application_get: fakeGet,
      auth_role: fakeGetRole,
      history_create: fakeCreateHistory,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: false,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(403);
    chai
      .expect(fakeVerify)
      .to.have.been.calledOnceWithExactly(token, CONFIG.jwt_token);
  });
  it('called without token and should return with MissingArgumentEroor.', async () => {
    fakeReq = {
      headers: {},
      method: 'GET',
      originalUrl: '/application/apps-ingress-encrypted',
    };
    await token_service.app_access_granted(fakeReq, fakeRes, {
      jwt_verify: fakeVerify,
      auth_role: fakeGetRole,
      history_create: fakeCreateHistory,
    });
    chai.expect(fakeVerify).to.not.have.been.called;
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: false,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
  });
  it('called without token and should return with BadContentTokenError.', async () => {
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      method: 'GET',
      originalUrl: '/application/apps-ingress-encrypted',
    };
    fakeVerify.returns({
      name: 'ulfi',
    });
    await token_service.app_access_granted(fakeReq, fakeRes, {
      jwt_verify: fakeVerify,
      auth_role: fakeGetRole,
      history_create: fakeCreateHistory,
    });
    chai
      .expect(fakeVerify)
      .to.have.been.calledOnceWithExactly(token, CONFIG.jwt_token);
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: false,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(403);
  });
  it('called and should return false cause an error is identified.', async () => {
    fakeVerify.returns({
      id_user: 1,
    });
    fakeGet.resolves(Promise.resolve({ id_user: 3 }));
    await token_service.app_access_granted(fakeReq, fakeRes, {
      application_get: fakeGet,
      jwt_verify: fakeVerify,
      auth_role: fakeGetRole,
      history_create: fakeCreateHistory,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: false,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(403);
  });
});
describe('token_service.isAdmin()', () => {
  let fakeGetUserId, fakeGetRole, fakeReq, fakeRes, fakeNext;
  const token = token_service.generateToken({ id_user: 1 });
  beforeEach(() => {
    fakeGetUserId = sinon.stub();
    fakeGetRole = sinon.stub();
    fakeNext = sinon.stub();
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      method: 'GET',
      originalUrl: '/application/apps-ingress-encrypted',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good token and should execute next().', async () => {
    fakeGetUserId.returns(1);
    fakeGetRole.resolves(Promise.resolve('ADMINISTRATEUR'));
    await token_service.isAdmin(fakeReq, fakeRes, fakeNext, {
      getUserId: fakeGetUserId,
      getRole: fakeGetRole,
    });
    chai
      .expect(fakeGetUserId)
      .to.have.been.calledOnceWithExactly({ token: 'Bearer ' + token });
    chai.expect(fakeGetRole).to.have.been.calledOnceWithExactly({ id_user: 1 });
    chai.expect(fakeRes.json).to.not.have.been.called;
    chai.expect(fakeRes.status).to.not.have.been.called;
    chai.expect(fakeNext).to.have.been.called;
  });
  it('called with good token and should execute next().', async () => {
    fakeGetUserId.returns(1);
    fakeGetRole.resolves(Promise.resolve('PROFESSEUR'));
    await token_service.isAdmin(fakeReq, fakeRes, fakeNext, {
      getUserId: fakeGetUserId,
      getRole: fakeGetRole,
    });
    chai
      .expect(fakeGetUserId)
      .to.have.been.calledOnceWithExactly({ token: 'Bearer ' + token });
    chai.expect(fakeGetRole).to.have.been.calledOnceWithExactly({ id_user: 1 });
    chai.expect(fakeRes.json).to.have.been.called.calledOnceWithExactly({
      result: {
        error: 'UserIsNotAdmin',
        message: 'The user is not admin.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(403);
    chai.expect(fakeNext).to.not.have.been.called;
  });
});
describe('token_service.isProf()', () => {
  let fakeGetUserId, fakeGetRole, fakeReq, fakeRes, fakeNext;
  const token = token_service.generateToken({ id_user: 1 });
  beforeEach(() => {
    fakeGetUserId = sinon.stub();
    fakeGetRole = sinon.stub();
    fakeNext = sinon.stub();
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      method: 'GET',
      originalUrl: '/application/apps-ingress-encrypted',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good token and should execute next().', async () => {
    fakeGetUserId.returns(1);
    fakeGetRole.resolves(Promise.resolve('PROFESSEUR'));
    await token_service.isProf(fakeReq, fakeRes, fakeNext, {
      getUserId: fakeGetUserId,
      getRole: fakeGetRole,
    });
    chai
      .expect(fakeGetUserId)
      .to.have.been.calledOnceWithExactly({ token: 'Bearer ' + token });
    chai.expect(fakeGetRole).to.have.been.calledOnceWithExactly({ id_user: 1 });
    chai.expect(fakeRes.json).to.not.have.been.called;
    chai.expect(fakeRes.status).to.not.have.been.called;
    chai.expect(fakeNext).to.have.been.called;
  });
  it('called with good token and should execute next().', async () => {
    fakeGetUserId.returns(1);
    fakeGetRole.resolves(Promise.resolve('ETUDIANT'));
    await token_service.isProf(fakeReq, fakeRes, fakeNext, {
      getUserId: fakeGetUserId,
      getRole: fakeGetRole,
    });
    chai
      .expect(fakeGetUserId)
      .to.have.been.calledOnceWithExactly({ token: 'Bearer ' + token });
    chai.expect(fakeGetRole).to.have.been.calledOnceWithExactly({ id_user: 1 });
    chai.expect(fakeRes.json).to.have.been.called.calledOnceWithExactly({
      result: {
        error: 'UserIsNotProfessor',
        message: 'The user is not professor.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(403);
    chai.expect(fakeNext).to.not.have.been.called;
  });
});
describe('token_service.isOwner()', () => {
  let fakeGetUserId, fakeIsOwner, fakeReq, fakeRes, fakeNext, fakeGetRole;
  const token = token_service.generateToken({ id_user: 1 });
  beforeEach(() => {
    fakeGetUserId = sinon.stub();
    fakeIsOwner = sinon.stub();
    fakeGetRole = sinon.stub();
    fakeNext = sinon.stub();
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_application: 8,
      },
      method: 'GET',
      originalUrl: '/application/apps-ingress-encrypted',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with key and should execute next().', async () => {
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        key: 'daphne-louis-peheux',
      },
      method: 'GET',
      originalUrl: '/application/apps-ingress-encrypted',
    };
    fakeGetUserId.returns(1);
    fakeIsOwner.resolves(Promise.resolve(true));
    await token_service.isOwner(fakeReq, fakeRes, fakeNext, {
      getUserId: fakeGetUserId,
      isOwner: fakeIsOwner,
      getRole: fakeGetRole,
    });
    chai
      .expect(fakeGetUserId)
      .to.have.been.calledOnceWithExactly({ token: 'Bearer ' + token });
    chai.expect(fakeIsOwner).to.have.been.calledOnceWithExactly({
      id_user: 1,
      key: 'daphne-louis-peheux',
    });
    chai.expect(fakeRes.json).to.not.have.been.called;
    chai.expect(fakeRes.status).to.not.have.been.called;
    chai.expect(fakeNext).to.have.been.called;
  });
  it('called with id_application and should execute next().', async () => {
    fakeGetUserId.returns(1);
    fakeIsOwner.resolves(Promise.resolve(true));
    await token_service.isOwner(fakeReq, fakeRes, fakeNext, {
      getUserId: fakeGetUserId,
      isOwner: fakeIsOwner,
      getRole: fakeGetRole,
    });
    chai
      .expect(fakeGetUserId)
      .to.have.been.calledOnceWithExactly({ token: 'Bearer ' + token });
    chai.expect(fakeIsOwner).to.have.been.calledOnceWithExactly({
      id_user: 1,
      id_application: 8,
    });
    chai.expect(fakeRes.json).to.not.have.been.called;
    chai.expect(fakeRes.status).to.not.have.been.called;
    chai.expect(fakeNext).to.have.been.called;
  });
  it('called without arguments and should return MissingArgumentError.', async () => {
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {},
      method: 'GET',
      originalUrl: '/application/apps-ingress-encrypted',
    };
    await token_service.isOwner(fakeReq, fakeRes, fakeNext, {
      getUserId: fakeGetUserId,
      isOwner: fakeIsOwner,
      getRole: fakeGetRole,
    });
    chai.expect(fakeGetUserId).to.not.have.been.called;
    chai.expect(fakeIsOwner).to.not.have.been.called;
    chai.expect(fakeRes.json).to.have.been.called.calledOnceWithExactly({
      result: {
        error: 'MissingArgumentError',
        message: 'One or more arguments (key,id_application) are missing.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    chai.expect(fakeNext).to.not.have.been.called;
  });
  it('called without arguments and should return UserIsNotOwner.', async () => {
    fakeGetUserId.returns(1);
    fakeIsOwner.resolves(Promise.resolve(false));
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {
        id_application: 8,
      },
      method: 'GET',
      originalUrl: '/application/apps-ingress-encrypted',
    };
    await token_service.isOwner(fakeReq, fakeRes, fakeNext, {
      getUserId: fakeGetUserId,
      isOwner: fakeIsOwner,
      getRole: fakeGetRole,
    });
    chai.expect(fakeGetUserId).to.have.been.calledOnceWithExactly({
      token: 'Bearer ' + token,
    });
    chai.expect(fakeIsOwner).to.have.been.calledOnceWithExactly({
      id_user: 1,
      id_application: 8,
    });
    chai.expect(fakeRes.json).to.have.been.called.calledOnceWithExactly({
      result: {
        error: 'UserIsNotOwner',
        message: 'The user is not the owner of this application.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(403);
    chai.expect(fakeNext).to.not.have.been.called;
  });
});
describe('token_service.isProfOrAdmin()', () => {
  let fakeGetUserId, fakeGetRole, fakeReq, fakeRes, fakeNext;
  const token = token_service.generateToken({ id_user: 1 });
  beforeEach(() => {
    fakeGetUserId = sinon.stub();
    fakeGetRole = sinon.stub();
    fakeNext = sinon.stub();
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      method: 'GET',
      originalUrl: '/session/list',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good token and should execute next().', async () => {
    fakeGetUserId.returns(1);
    fakeGetRole.resolves(Promise.resolve('PROFESSEUR'));
    await token_service.isProfOrAdmin(fakeReq, fakeRes, fakeNext, {
      getUserId: fakeGetUserId,
      getRole: fakeGetRole,
    });
    chai
      .expect(fakeGetUserId)
      .to.have.been.calledOnceWithExactly({ token: 'Bearer ' + token });
    chai.expect(fakeGetRole).to.have.been.calledOnceWithExactly({ id_user: 1 });
    chai.expect(fakeRes.json).to.not.have.been.called;
    chai.expect(fakeRes.status).to.not.have.been.called;
    chai.expect(fakeNext).to.have.been.called;
  });
  it('called with ETUDIANT role and should reject with UserIsNeitherProfOrAdmin.', async () => {
    fakeGetUserId.returns(1);
    fakeGetRole.resolves(Promise.resolve('ETUDIANT'));
    await token_service.isProfOrAdmin(fakeReq, fakeRes, fakeNext, {
      getUserId: fakeGetUserId,
      getRole: fakeGetRole,
    });
    chai
      .expect(fakeGetUserId)
      .to.have.been.calledOnceWithExactly({ token: 'Bearer ' + token });
    chai.expect(fakeGetRole).to.have.been.calledOnceWithExactly({ id_user: 1 });
    chai.expect(fakeRes.json).to.have.been.called.calledOnceWithExactly({
      result: {
        error: 'UserIsNeitherProfOrAdmin',
        message: 'The user is neither PROFESSEUR or ADMINISTRATEUR.',
      },
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(403);
    chai.expect(fakeNext).to.not.have.been.called;
  });
});
