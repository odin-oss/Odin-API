import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as auth_controller from '../../src/controllers/auth.controller.js';

import { BadCredentials } from '../../src/utils/errors.util.js';

chai.use(sinonChai);

describe('auth_controller.connect()', () => {
  let fakeConnect, fakeReq, fakeRes;

  beforeEach(() => {
    fakeConnect = sinon.stub();
    fakeReq = {
      body: {
        mail: 'user@example.com',
        password: 'password123',
      },
      method: 'POST',
      originalUrl: '/auth/connect',
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
    const mockToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjogMX0.test';

    fakeConnect.resolves(Promise.resolve(mockToken));

    await auth_controller.connect(fakeReq, fakeRes, {
      auth_connect: fakeConnect,
    });

    chai
      .expect(fakeConnect)
      .to.have.been.calledOnceWithExactly({
        mail: 'user@example.com',
        password: 'password123',
      });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Authentication successful');
    chai.expect(jsonCall.data.token).to.equal(mockToken);
  });

  it('called without mail parameter and should reject with MissingArgumentError.', async () => {
    delete fakeReq.body.mail;

    await auth_controller.connect(fakeReq, fakeRes, {
      auth_connect: fakeConnect,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai.expect(jsonCall.message).to.include('mail');
    chai.expect(jsonCall.error.type).to.equal('MissingArgumentError');
  });

  it('called without password parameter and should reject with MissingArgumentError.', async () => {
    delete fakeReq.body.password;

    await auth_controller.connect(fakeReq, fakeRes, {
      auth_connect: fakeConnect,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai.expect(jsonCall.message).to.include('password');
    chai.expect(jsonCall.error.type).to.equal('MissingArgumentError');
  });

  it('called without mail and password parameters and should reject with MissingArgumentError.', async () => {
    delete fakeReq.body.mail;
    delete fakeReq.body.password;

    await auth_controller.connect(fakeReq, fakeRes, {
      auth_connect: fakeConnect,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai.expect(jsonCall.error.type).to.equal('MissingArgumentError');
  });

  it('called but should reject with BadCredentials due to invalid credentials.', async () => {
    fakeConnect.rejects(
      new BadCredentials('Invalid mail or password.')
    );

    await auth_controller.connect(fakeReq, fakeRes, {
      auth_connect: fakeConnect,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(403);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai.expect(jsonCall.message).to.equal('Invalid mail or password.');
    chai.expect(jsonCall.error.type).to.equal('BadCredentials');
  });

  it('called but should reject with database error.', async () => {
    const dbError = new Error('Database connection failed');
    dbError.code = 500;
    dbError.name = 'DBConnexionRefused';

    fakeConnect.rejects(dbError);

    await auth_controller.connect(fakeReq, fakeRes, {
      auth_connect: fakeConnect,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai.expect(jsonCall.error.type).to.equal('DBConnexionRefused');
  });


});
