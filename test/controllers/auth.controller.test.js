import * as auth_controller from '../../src/controllers/auth.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  BadCredentials,
  DBConnexionRefused,
} from '../../src/utils/errors.service.js';
import CONFIG from '../../src/config/config.js';
chai.use(sinonChai);

describe('auth_controller.login_options', () => {
  let saveCONFIG, fakeRes, fakeReq;
  beforeEach(() => {
    saveCONFIG = CONFIG;
    fakeReq = {
      method: 'GET',
      originalUrl: '/auth/options',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    CONFIG.oidc_enabled = saveCONFIG.oidc_enabled;
    CONFIG.credentials_enabled = saveCONFIG.credentials_enabled;
  });
  it('called without any CONFIG activated and should get the empty list of options.', async () => {
    CONFIG.oidc_enabled = false;
    CONFIG.credentials_enabled = false;
    await auth_controller.login_options(fakeReq, fakeRes);
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: [],
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
  it('called with all CONFIG activated and should get the list of options.', async () => {
    CONFIG.oidc_enabled = true;
    CONFIG.credentials_enabled = true;
    await auth_controller.login_options(fakeReq, fakeRes);
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: ['credentials', 'OIDC'],
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });
});
describe('auth_controller.connect()', () => {
  let fakeConnect, fakeRes, fakeReq;
  beforeEach(() => {
    fakeConnect = sinon.stub();
    fakeReq = {
      body: {
        mail: 'benoit.lefebvre@getcaelus.cloud',
        password: 'thisIsMDP',
      },
      method: 'GET',
      originalUrl: '/auth/connect_by_credentials',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good arguments and should return a token.', async () => {
    fakeConnect.resolves(Promise.resolve('thisistoken'));
    await auth_controller.connect(fakeReq, fakeRes, {
      auth_connect: fakeConnect,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: 'thisistoken',
    });
  });
  it('called with good arguments and should return a token.', async () => {
    fakeConnect.resolves(
      Promise.reject(
        new BadCredentials('The credentials you entered are wrong.')
      )
    );
    await auth_controller.connect(fakeReq, fakeRes, {
      auth_connect: fakeConnect,
    });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(403);
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'BadCredentials',
        message: 'The credentials you entered are wrong.',
      },
    });
  });
});
