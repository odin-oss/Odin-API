import * as chai from 'chai';
import * as sinon from 'sinon';
import * as externalName from '../../../src/objects/kubernetes/external_name.js';

describe('external_name.create()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('creates the external name service with expected payload', async () => {
    const fetchResult = { ok: true };
    fetchStub.resolves(fetchResult);

    const result = await externalName.create(
      { hash: 'abcdef', label: 'app', port_externe: 8080 },
      fetchStub
    );

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(fetchStub.args[0][0]).to.deep.equal({
      url: '/api/v1/namespaces/odin/services',
      method: 'POST',
      body: {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: 'ciappabcdef8080-proxy',
          namespace: 'odin',
          labels: {
            type: 'ExternalName',
            hash: 'abcdef',
            shutable: 'true',
          },
        },
        spec: {
          externalName: 'ciappabcdef8080.nabcdef.svc.cluster.local',
          ports: [
            {
              port: 8080,
              protocol: 'TCP',
            },
          ],
          type: 'ExternalName',
        },
      },
    });
    chai.expect(result).to.deep.equal({
      result: fetchResult,
      type: 'ExternalName',
      name: 'ciappabcdef8080-proxy',
    });
  });

  it('throws on invalid hash', async () => {
    try {
      await externalName.create(
        { hash: 'bad', label: 'app', port_externe: 8080 },
        fetchStub
      );
      chai.expect.fail('Expected create to throw for invalid hash');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('external_name.deletion()', () => {
	let getStub;
	let deleteStub;

	beforeEach(() => {
		getStub = sinon.stub();
		deleteStub = sinon.stub();
	});

	afterEach(() => {
		sinon.restore();
	});

	it('returns early when Kubernetes is not activated', async () => {
		getStub.resolves({ result: 'Kubernetes is not activated.' });

		const result = await externalName.deletion(
			{ hash: 'abcdef' },
			{ get: getStub, delete: deleteStub }
		);

		chai.expect(result).to.equal(undefined);
		chai.expect(deleteStub.notCalled).to.be.true;
	});

	it('deletes each external name service', async () => {
		getStub.resolves({ result: ['svc-a', 'svc-b'] });
		deleteStub.resolves({ ok: true });

		await externalName.deletion(
			{ hash: 'abcdef' },
			{ get: getStub, delete: deleteStub }
		);

		chai.expect(deleteStub.callCount).to.equal(2);
		chai.expect(deleteStub.args[0][0]).to.deep.equal({ name: 'svc-a' });
		chai.expect(deleteStub.args[1][0]).to.deep.equal({ name: 'svc-b' });
	});

	it('throws on invalid hash', async () => {
		try {
			await externalName.deletion(
				{ hash: 'nope' },
				{ get: getStub, delete: deleteStub }
			);
			chai.expect.fail('Expected deletion to throw for invalid hash');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});
});

describe('external_name.test_exports', () => {
	const { get, del } = externalName.test_exports;

	it('lists external names via get()', async function () {
		if (!get) this.skip();
		const fetchStub = sinon.stub().resolves({
			items: [{ metadata: { name: 'svc-a' } }, { metadata: { name: 'svc-b' } }],
		});

		const result = await get({ hash: 'abcdef' }, fetchStub);

		chai.expect(fetchStub.calledOnce).to.be.true;
		chai.expect(fetchStub.args[0][0]).to.deep.equal({
			url: '/api/v1/namespaces/odin/services?labelSelector=type=ExternalName,hash=abcdef',
			method: 'GET',
		});
		chai.expect(result).to.deep.equal({
			result: ['svc-a', 'svc-b'],
			type: 'ExternalName',
		});
	});

	it('returns activation message when Kubernetes is disabled', async function () {
		if (!get) this.skip();
		const fetchStub = sinon
			.stub()
			.resolves('Kubernetes is not activated.');

		const result = await get({ hash: 'abcdef' }, fetchStub);

		chai.expect(result).to.deep.equal({
			result: 'Kubernetes is not activated.',
		});
	});

	it('deletes an external name via del()', async function () {
		if (!del) this.skip();
		const fetchResult = { ok: true };
		const fetchStub = sinon.stub().resolves(fetchResult);

		const result = await del({ name: 'svc-a' }, fetchStub);

		chai.expect(fetchStub.calledOnce).to.be.true;
		chai.expect(fetchStub.args[0][0]).to.deep.equal({
			url: '/api/v1/namespaces/odin/services/svc-a',
			method: 'DELETE',
		});
		chai.expect(result).to.deep.equal({
			result: fetchResult,
			type: 'ExternalName',
			name: 'svc-a',
		});
	});
});
