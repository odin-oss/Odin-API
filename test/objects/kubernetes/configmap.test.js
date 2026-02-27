import * as chai from 'chai';
import * as sinon from 'sinon';
import * as configmap from '../../../src/objects/kubernetes/configmap.js';

describe('configmap.create()', () => {
  let fetchStub;
  let readFileStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
    readFileStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('creates a configmap with file contents', async () => {
    const fetchResult = { ok: true };
    fetchStub.resolves(fetchResult);
    readFileStub.resolves('file-content');

    const result = await configmap.create(
      {
        hash: 'abcdef',
        path: '/tmp/file.txt',
        namespace: 'nabcdef',
        name: 'cm-name',
        filename: 'file.txt',
        shutable: false,
      },
      { fetch: fetchStub, readFile: readFileStub }
    );

    chai.expect(readFileStub.calledOnceWith('/tmp/file.txt', 'utf8')).to.be
      .true;
    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(fetchStub.args[0][0]).to.deep.equal({
      url: '/api/v1/namespaces/nabcdef/configmaps',
      method: 'POST',
      body: {
        apiVersion: 'v1',
        data: {
          'file.txt': 'file-content',
        },
        metadata: {
          name: 'cm-name',
          namespace: 'nabcdef',
          labels: {
            type: 'ConfigMap',
            hash: 'abcdef',
            shutable: 'false',
          },
        },
      },
    });
    chai.expect(result).to.deep.equal({
      result: fetchResult,
      type: 'ConfigMap',
      name: 'cm-name',
    });
  });

  it('throws on missing required props', async () => {
    try {
      await configmap.create({ hash: 'abcdef' }, { fetch: fetchStub });
      chai.expect.fail('Expected create to throw for missing props');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('configmap.update()', () => {
  let fetchStub;
  let readFileStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
    readFileStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('updates a configmap with file contents', async () => {
    const fetchResult = { ok: true };
    fetchStub.resolves(fetchResult);
    readFileStub.resolves('file-content');

    const result = await configmap.update(
      {
        path: '/tmp/file.txt',
        namespace: 'nabcdef',
        name: 'cm-name',
        filename: 'file.txt',
        shutable: true,
      },
      { fetch: fetchStub, readFile: readFileStub }
    );

    chai.expect(readFileStub.calledOnceWith('/tmp/file.txt', 'utf8')).to.be
      .true;
    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(fetchStub.args[0][0]).to.deep.equal({
      url: '/api/v1/namespaces/nabcdef/configmaps/cm-name',
      method: 'PUT',
      body: {
        data: {
          'file.txt': 'file-content',
        },
        metadata: {
          name: 'cm-name',
          namespace: 'nabcdef',
          labels: {
            type: 'ConfigMap',
            shutable: 'true',
          },
        },
      },
    });
    chai.expect(result).to.equal(fetchResult);
  });

  it('throws on missing required props', async () => {
    try {
      await configmap.update({ name: 'cm-name' }, { fetch: fetchStub });
      chai.expect.fail('Expected update to throw for missing props');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
