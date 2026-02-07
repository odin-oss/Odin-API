import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { upload } from '../../src/controllers/images.controller.js';
chai.use(sinonChai);

describe('images_controller.upload()', () => {
  let fakeReq, fakeRes;
  beforeEach(() => {
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called and should respond with good informations of the file.', () => {
    fakeReq = {
      file: {
        filename: 'img-awillywo.png',
      },
    };
    upload(fakeReq, fakeRes);
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        filename: 'img-awillywo.png',
        hash: 'awillywo',
      },
    });
  });
  it('called and should respond with NoImageReceived.', () => {
    fakeReq = {};
    upload(fakeReq, fakeRes);
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'NoImageReceived',
        message: 'No image received by the controller.',
      },
    });
  });
});
