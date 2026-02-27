import * as chai from 'chai';
import * as sinon from 'sinon';
import * as deployment from '../../../src/objects/kubernetes/deployment.js';

describe('deployment.deletion()', () => {
  let getStub;
  let deleteStub;

  beforeEach(() => {
    getStub = sinon.stub();
    deleteStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('returns empty list when no deployments exist', async () => {
    getStub.resolves({ result: [] });

    const result = await deployment.deletion(
      { hash: 'abcdef' },
      { get_deployment: getStub, delete_deployment: deleteStub }
    );

    chai.expect(result).to.deep.equal([]);
    chai.expect(deleteStub.notCalled).to.be.true;
  });

  it('deletes each deployment returned by get', async () => {
    getStub.resolves({ result: ['deploy-a', 'deploy-b'] });
    deleteStub.resolves({ ok: true });

    await deployment.deletion(
      { hash: 'abcdef' },
      { get_deployment: getStub, delete_deployment: deleteStub }
    );

    chai.expect(deleteStub.callCount).to.equal(2);
    chai.expect(deleteStub.args[0][0]).to.deep.equal({
      hash: 'abcdef',
      name: 'deploy-a',
    });
  });
});

describe('deployment.scale()', () => {
  let getStub;
  let putStub;

  beforeEach(() => {
    getStub = sinon.stub();
    putStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('returns early when Kubernetes is not activated', async () => {
    getStub.resolves({ result: 'Kubernetes is not activated.' });

    const result = await deployment.scale(
      { hash: 'abcdef', replicas: 2 },
      { get_deployment: getStub, put_deployment: putStub }
    );

    chai.expect(result).to.equal(undefined);
    chai.expect(putStub.notCalled).to.be.true;
  });

  it('scales each deployment to the requested replicas', async () => {
    getStub.resolves({ result: ['deploy-a', 'deploy-b'] });
    putStub.resolves({ ok: true });

    await deployment.scale(
      { hash: 'abcdef', replicas: 3 },
      { get_deployment: getStub, put_deployment: putStub }
    );

    chai.expect(putStub.callCount).to.equal(2);
    chai.expect(putStub.args[0][0]).to.deep.equal({
      name: 'deploy-a',
      hash: 'abcdef',
      replicas: 3,
    });
  });
});

describe('deployment.create()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('creates a deployment with required defaults', async () => {
    const fetchResult = { ok: true };
    fetchStub.resolves(fetchResult);

    const props = {
      hash: 'abcdef',
      registry_link: 'registry/app:1.0.0',
      username: 'user',
      password: 'pass',
      service_command: '',
      label: 'app',
      generated_label: 'app-abcdef',
      has_storage: false,
      ram_limit: '1Gi',
      ram_request: '512Mi',
      cpu_request: '250m',
      cpu_limit: '500m',
    };

    const result = await deployment.create(props, fetchStub);

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(fetchStub.args[0][0]).to.include({
      url: '/apis/apps/v1/namespaces/nabcdef/deployments',
      method: 'POST',
    });
    chai.expect(fetchStub.args[0][0].body.metadata).to.include({
      name: 'appabcdef',
      namespace: 'nabcdef',
    });
    chai
      .expect(fetchStub.args[0][0].body.spec.template.spec.containers[0].image)
      .to.equal('registry/app:1.0.0');
    chai.expect(result).to.deep.equal({
      result: fetchResult,
      type: 'Deployment',
      name: 'appabcdef',
    });
  });

  it('throws on invalid registry_link format', async () => {
    try {
      await deployment.create(
        {
          hash: 'abcdef',
          registry_link: 'badformat',
          username: 'user',
          password: 'pass',
          service_command: '',
          label: 'app',
          generated_label: 'app-abcdef',
          has_storage: false,
          ram_limit: '1Gi',
          ram_request: '512Mi',
          cpu_request: '250m',
          cpu_limit: '500m',
        },
        fetchStub
      );
      chai.expect.fail('Expected create to throw for invalid registry_link');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('deployment.get_pods()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('adds kind to each pod item', async () => {
    fetchStub.resolves({ items: [{ metadata: {} }, { metadata: {} }] });

    const result = await deployment.get_pods(
      { hash: 'abcdef' },
      { fetch: fetchStub }
    );

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(result.items[0].kind).to.equal('Pod');
    chai.expect(result.items[1].kind).to.equal('Pod');
  });
});

describe('deployment.get_deployments()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('adds kind to each deployment item', async () => {
    fetchStub.resolves({ items: [{ metadata: {} }, { metadata: {} }] });

    const result = await deployment.get_deployments(
      { hash: 'abcdef' },
      { fetch: fetchStub }
    );

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(result.items[0].kind).to.equal('Deployment');
    chai.expect(result.items[1].kind).to.equal('Deployment');
  });
});

describe('deployment.get_replicasets()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('adds kind to each replicaset item', async () => {
    fetchStub.resolves({ items: [{ metadata: {} }, { metadata: {} }] });

    const result = await deployment.get_replicasets(
      { hash: 'abcdef' },
      { fetch: fetchStub }
    );

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(result.items[0].kind).to.equal('ReplicaSet');
    chai.expect(result.items[1].kind).to.equal('ReplicaSet');
  });
});

describe('deployment.test_exports', () => {
  const { get, del, put } = deployment.test_exports;

  it('lists deployments via get()', async function () {
    if (!get) this.skip();
    const fetchStub = sinon.stub().resolves({
      items: [{ metadata: { name: 'deploy-a' } }],
    });

    const result = await get({ hash: 'abcdef' }, fetchStub);

    chai.expect(fetchStub.args[0][0]).to.deep.equal({
      url: '/apis/apps/v1/namespaces/nabcdef/deployments?labelSelector=type=Deployment,hash=abcdef',
      method: 'GET',
    });
    chai.expect(result).to.deep.equal({
      result: ['deploy-a'],
      type: 'Deployments',
    });
  });

  it('deletes a deployment via del()', async function () {
    if (!del) this.skip();
    const fetchResult = { ok: true };
    const fetchStub = sinon.stub().resolves(fetchResult);

    const result = await del({ hash: 'abcdef', name: 'deploy-a' }, fetchStub);

    chai.expect(fetchStub.args[0][0]).to.deep.equal({
      url: '/apis/apps/v1/namespaces/nabcdef/deployments/deploy-a',
      method: 'DELETE',
    });
    chai.expect(result).to.deep.equal({
      result: fetchResult,
      type: 'Deployment',
      name: 'deploy-a',
    });
  });

  it('updates scale via put()', async function () {
    if (!put) this.skip();
    const fetchResult = { ok: true };
    const fetchStub = sinon.stub().resolves(fetchResult);

    const result = await put(
      { hash: 'abcdef', name: 'deploy-a', replicas: 2 },
      fetchStub
    );

    chai.expect(fetchStub.args[0][0]).to.deep.equal({
      url: '/apis/apps/v1/namespaces/nabcdef/deployments/deploy-a/scale',
      method: 'PUT',
      body: {
        kind: 'Scale',
        apiVersion: 'autoscaling/v1',
        metadata: {
          name: 'deploy-a',
          namespace: 'nabcdef',
        },
        spec: {
          replicas: 2,
        },
      },
    });
    chai.expect(result).to.deep.equal({
      result: fetchResult,
      type: 'Deployment',
      name: 'deploy-a',
    });
  });
});
