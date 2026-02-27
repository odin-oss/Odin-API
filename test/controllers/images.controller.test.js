import * as images_controller from '../../src/controllers/images.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.util.js';
import fs from 'fs/promises';

chai.use(sinonChai);

describe('images_controller.get()', () => {
  let fakeReq, fakeRes, fsAccessStub, fsSendFileStub;

  beforeEach(() => {
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      params: {
        key: 'test-image-123',
      },
      method: 'GET',
      originalUrl: '/images/test-image-123',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      sendFile: sinon.stub(),
    };
    fsAccessStub = sinon.stub(fs, 'access');
    fsSendFileStub = fakeRes.sendFile;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid key and should send the image file.', async () => {
    fsAccessStub.resolves();

    await images_controller.get(fakeReq, fakeRes);

    chai.expect(fsAccessStub).to.have.been.calledOnce;
    chai.expect(fsSendFileStub).to.have.been.calledOnce;
    const sendFileArg = fsSendFileStub.firstCall.args[0];
    chai.expect(sendFileArg).to.include('img-test-image-123.png');
  });

  it('called without key parameter and should reject with validation error.', async () => {
    fakeReq.params = {};

    await images_controller.get(fakeReq, fakeRes);

    chai.expect(fsAccessStub).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with non-existent image and should reject with ImageNotFound error.', async () => {
    const enoentError = new Error('ENOENT: no such file or directory');
    fsAccessStub.rejects(enoentError);

    await images_controller.get(fakeReq, fakeRes);

    chai.expect(fsAccessStub).to.have.been.calledOnce;
    chai.expect(fsSendFileStub).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(404);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('The image test-image-123.png does not exist.');
    chai.expect(jsonCall.error.type).to.equal('ImageNotFound');
  });

  it('called but file access fails with ReadingImageError.', async () => {
    const readError = new Error('Permission denied');
    fsAccessStub.rejects(readError);

    await images_controller.get(fakeReq, fakeRes);

    chai.expect(fsAccessStub).to.have.been.calledOnce;
    chai.expect(fsSendFileStub).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai.expect(jsonCall.message).to.equal('Permission denied');
    chai.expect(jsonCall.error.type).to.equal('ReadingImageError');
  });
});

describe('images_controller.list()', () => {
  let fakeReq, fakeRes, fsReaddirStub;

  beforeEach(() => {
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      method: 'GET',
      originalUrl: '/images',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    fsReaddirStub = sinon.stub(fs, 'readdir');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called and should return list of image keys.', async () => {
    const mockFiles = [
      'img-abc123.png',
      'img-def456.png',
      'img-ghi789.png',
      'other-file.txt',
      'img-incomplete',
    ];

    fsReaddirStub.resolves(mockFiles);

    await images_controller.list(fakeReq, fakeRes);

    chai.expect(fsReaddirStub).to.have.been.calledOnce;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('List of images transmitted.');
    chai.expect(jsonCall.data).to.deep.equal(['abc123', 'def456', 'ghi789']);
  });

  it('called with empty images directory and should return empty list.', async () => {
    fsReaddirStub.resolves([]);

    await images_controller.list(fakeReq, fakeRes);

    chai.expect(fsReaddirStub).to.have.been.calledOnce;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.data).to.deep.equal([]);
  });

  it('called but readdir fails and should reject with error.', async () => {
    const readError = new Error('Failed to read directory');
    fsReaddirStub.rejects(readError);

    await images_controller.list(fakeReq, fakeRes);

    chai.expect(fsReaddirStub).to.have.been.calledOnce;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });
});

describe('images_controller.upload()', () => {
  let fakeReq, fakeRes;

  beforeEach(() => {
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      file: {
        fieldname: 'image',
        originalname: 'test-image.png',
        encoding: '7bit',
        mimetype: 'image/png',
        destination: 'images/',
        filename: 'img-abc123.png',
        path: 'images/img-abc123.png',
        size: 12345,
      },
      method: 'POST',
      originalUrl: '/images/upload',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid file and should upload successfully.', () => {
    images_controller.upload(fakeReq, fakeRes);

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Image uploaded.');
    chai.expect(jsonCall.data.hash).to.equal('abc123');
    chai.expect(jsonCall.data.filename).to.equal('img-abc123.png');
  });

  it('called without file and should reject with NoImageReceived error.', () => {
    fakeReq.file = null;

    images_controller.upload(fakeReq, fakeRes);

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('No image received by the controller.');
    chai.expect(jsonCall.error.type).to.equal('NoImageReceived');
  });

  it('called with undefined file and should reject with NoImageReceived error.', () => {
    fakeReq.file = undefined;

    images_controller.upload(fakeReq, fakeRes);

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('No image received by the controller.');
    chai.expect(jsonCall.error.type).to.equal('NoImageReceived');
  });
});
