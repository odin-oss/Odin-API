import * as chai from 'chai';
import * as sinon from 'sinon';
import * as service from '../../../src/objects/kubernetes/service.js';

describe('service.create()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('creates a ClusterIP service by default', async () => {
    const fetchResult = { ok: true };
    fetchStub.resolves(fetchResult);

    const result = await service.create(
      {
        hash: 'abcdef',
        label: 'app',
        port_externe: 8080,
        port_interne: 80,
      },
      fetchStub
    );

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai
      .expect(fetchStub.args[0][0].body.metadata.name)
      .to.equal('ciappabcdef8080');
    chai.expect(fetchStub.args[0][0].body.spec.type).to.equal('ClusterIP');
    chai.expect(result).to.deep.equal({
      result: fetchResult,
      type: 'Service',
      name: 'ciappabcdef8080',
    });
  });

  it('creates a LoadBalancer service when requested', async () => {
    const fetchResult = { ok: true };
    fetchStub.resolves(fetchResult);

    const result = await service.create(
      {
        hash: 'abcdef',
        label: 'app',
        port_externe: 8080,
        port_interne: 80,
        type: service.SVC_TYPE.LOADBALANCER,
      },
      fetchStub
    );

    chai
      .expect(fetchStub.args[0][0].body.metadata.name)
      .to.equal('lbappabcdef8080');
    chai.expect(fetchStub.args[0][0].body.spec.type).to.equal('LoadBalancer');
    chai.expect(result.name).to.equal('lbappabcdef8080');
  });

  it('throws on invalid hash', async () => {
    try {
      await service.create(
        { hash: 'bad', label: 'app', port_externe: 1, port_interne: 1 },
        fetchStub
      );
      chai.expect.fail('Expected create to throw for invalid hash');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('service.deletion()', () => {
  let getStub;
  let deleteStub;

  beforeEach(() => {
    getStub = sinon.stub();
    deleteStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('deletes each service returned by get()', async () => {
    getStub.resolves({ result: ['svc-a', 'svc-b'] });
    deleteStub.resolves({ ok: true });

    await service.deletion(
      { hash: 'abcdef' },
      { get_service: getStub, delete_service: deleteStub }
    );

    chai.expect(deleteStub.callCount).to.equal(2);
    chai.expect(deleteStub.args[0][0]).to.deep.equal({
      hash: 'abcdef',
      name: 'svc-a',
    });
  });
});

describe('service.get_services()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('adds kind to each service item', async () => {
    fetchStub.resolves({ items: [{ metadata: {} }, { metadata: {} }] });

    const result = await service.get_services(
      { hash: 'abcdef' },
      { fetch: fetchStub }
    );

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(result.items[0].kind).to.equal('Service');
    chai.expect(result.items[1].kind).to.equal('Service');
  });
});

describe('service.test_exports', () => {
  const { get, del } = service.test_exports;

  it('lists services via get()', async function () {
    if (!get) this.skip();
    const fetchStub = sinon.stub().resolves({
      items: [{ metadata: { name: 'svc-a' } }],
    });

    const result = await get({ hash: 'abcdef' }, fetchStub);

    chai.expect(fetchStub.args[0][0]).to.deep.equal({
      url: '/api/v1/namespaces/nabcdef/services?labelSelector=hash=abcdef',
      method: 'GET',
    });
    chai.expect(result).to.deep.equal({
      result: ['svc-a'],
      type: 'Services',
    });
  });

  it('deletes a service via del()', async function () {
    if (!del) this.skip();
    const fetchResult = { ok: true };
    const fetchStub = sinon.stub().resolves(fetchResult);

    const result = await del({ hash: 'abcdef', name: 'svc-a' }, fetchStub);

    chai.expect(fetchStub.args[0][0]).to.deep.equal({
      url: '/api/v1/namespaces/nabcdef/services/svc-a',
      method: 'DELETE',
    });
    chai.expect(result).to.deep.equal({
      result: fetchResult,
      type: 'Service',
      name: 'svc-a',
    });
  });
});
