import * as chai from 'chai';
import * as sinon from 'sinon';
import * as pvc from '../../../src/objects/kubernetes/pvc.js';
import CONFIG from '../../../src/config/config.js';

describe('pvc.create()', () => {
  let executeStub;

  beforeEach(() => {
    executeStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('delegates to execute_creation and formats result', async () => {
    executeStub.resolves({ ok: true });

    const result = await pvc.create(
      { hash: 'abcdef', label: 'app' },
      { execute_creation: executeStub }
    );

    chai.expect(executeStub.calledOnce).to.be.true;
    chai.expect(executeStub.args[0][0]).to.deep.equal({
      hash: 'abcdef',
      label: 'app',
    });
    chai.expect(result).to.deep.equal({
      result: { ok: true },
      type: 'PVC',
      name: 'appabcdef-pvc',
    });
  });

  it('throws on invalid hash', async () => {
    try {
      await pvc.create(
        { hash: 'bad', label: 'app' },
        { execute_creation: executeStub }
      );
      chai.expect.fail('Expected create to throw for invalid hash');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('pvc.get_pvc()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('adds kind to each pvc item', async () => {
    fetchStub.resolves({ items: [{ metadata: {} }, { metadata: {} }] });

    const result = await pvc.get_pvc({ hash: 'abcdef' }, { fetch: fetchStub });

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(result.items[0].kind).to.equal('PersistentVolumeClaim');
    chai.expect(result.items[1].kind).to.equal('PersistentVolumeClaim');
  });
});

describe('pvc.test_exports', () => {
  const { execute_creation } = pvc.test_exports;

  it('creates a pvc via execute_creation()', async function () {
    if (!execute_creation) this.skip();
    const fetchResult = { ok: true };
    const fetchStub = sinon.stub().resolves(fetchResult);

    const result = await execute_creation(
      { hash: 'abcdef', label: 'app' },
      fetchStub
    );

    const expectedBody = {
      metadata: {
        name: 'appabcdef-pvc',
        namespace: 'nabcdef',
        labels: {
          type: 'PVC',
          hash: 'abcdef',
          shutable: 'false',
        },
      },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: {
          requests: {
            storage: '1Gi',
          },
        },
        storageClassName: CONFIG.KUBERNETES_STORAGE_CLASSNAME,
      },
    };
    if (CONFIG.KUBERNETES_VOLUME_TYPE === 'Block') {
      expectedBody.spec.volumeMode = 'Block';
    }

    chai.expect(fetchStub.args[0][0]).to.deep.equal({
      url: '/api/v1/namespaces/nabcdef/persistentvolumeclaims',
      method: 'POST',
      body: expectedBody,
    });
    chai.expect(result).to.deep.equal({
      type: 'PersistentVolumeClaim',
      name: 'appabcdef-pvc',
      result: fetchResult,
    });
  });
});
