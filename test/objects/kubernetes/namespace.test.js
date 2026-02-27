import * as chai from 'chai';
import * as sinon from 'sinon';
import * as namespace from '../../../src/objects/kubernetes/namespace.js';

describe('namespace.create()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('creates a namespace with n-prefixed name', async () => {
    const fetchResult = { ok: true };
    fetchStub.resolves(fetchResult);

    const result = await namespace.create({ hash: 'abcdef' }, fetchStub);

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(fetchStub.args[0][0]).to.deep.equal({
      url: '/api/v1/namespaces',
      method: 'POST',
      body: {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: 'nabcdef',
          labels: {
            'kubernetes.io/metadata.name': 'nabcdef',
            type: 'Namespace',
            hash: 'abcdef',
            name: 'user-app-namespace',
          },
        },
        status: {
          phase: 'Active',
        },
      },
    });
    chai.expect(result).to.deep.equal({
      result: fetchResult,
      type: 'Namespace',
      name: 'nabcdef',
    });
  });

  it('creates the odin namespace without the n-prefix', async () => {
    const fetchResult = { ok: true };
    fetchStub.resolves(fetchResult);

    const result = await namespace.create({ hash: 'odin' }, fetchStub);

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(fetchStub.args[0][0].body.metadata.name).to.equal('odin');
    chai.expect(result.name).to.equal('odin');
  });

  it('throws on invalid hash', async () => {
    try {
      await namespace.create({ hash: 'bad' }, fetchStub);
      chai.expect.fail('Expected create to throw for invalid hash');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('namespace.deletion()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('deletes the namespace by hash', async () => {
    const fetchResult = { ok: true };
    fetchStub.resolves(fetchResult);

    const result = await namespace.deletion({ hash: 'abcdef' }, fetchStub);

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(fetchStub.args[0][0]).to.deep.equal({
      url: '/api/v1/namespaces/nabcdef',
      method: 'DELETE',
    });
    chai.expect(result).to.deep.equal({
      result: fetchResult,
      type: 'Namespace',
      name: 'nabcdef',
    });
  });

  it('throws on invalid hash', async () => {
    try {
      await namespace.deletion({ hash: 'nope' }, fetchStub);
      chai.expect.fail('Expected deletion to throw for invalid hash');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
