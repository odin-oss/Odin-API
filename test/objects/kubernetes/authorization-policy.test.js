import * as chai from 'chai';
import * as sinon from 'sinon';
import * as authorizationPolicy from '../../../src/objects/kubernetes/authorization-policy.js';

describe('authorization-policy.create()', () => {
	let fetchStub;

	beforeEach(() => {
		fetchStub = sinon.stub();
	});

	afterEach(() => {
		sinon.restore();
	});

	it('creates an authorization policy with the expected payload', async () => {
		const fetchResult = { ok: true };
		fetchStub.resolves(fetchResult);

		const result = await authorizationPolicy.create(
			{ hash: 'abcdef' },
			{ fetch: fetchStub }
		);

		chai.expect(fetchStub.calledOnce).to.be.true;
		chai.expect(fetchStub.args[0][0]).to.deep.equal({
			url: '/apis/security.istio.io/v1/namespaces/odin/authorizationpolicies',
			method: 'POST',
			body: {
				kind: 'AuthorizationPolicy',
				apiVersion: 'security.istio.io/v1',
				metadata: {
					name: 'istio-ap-odin-kafka-nabcdef',
					namespace: 'odin',
				},
				spec: {
					action: 'ALLOW',
					selector: {
						matchLabels: {
							app: 'odin-kafka',
						},
					},
					rules: [
						{
							from: [
								{
									source: {
										namespaces: ['nabcdef'],
									},
								},
							],
							to: [
								{
									operation: {
										ports: ['9092'],
									},
								},
							],
						},
					],
				},
			},
		});
		chai.expect(result).to.deep.equal({
			result: fetchResult,
			type: 'AuthorizationPolicy',
			name: 'authorization-policy-abcdef',
		});
	});

	it('throws when hash is not 6 characters', async () => {
		try {
			await authorizationPolicy.create(
				{ hash: 'short' },
				{ fetch: fetchStub }
			);
			chai.expect.fail('Expected create to throw for invalid hash length');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});
});

describe('authorization-policy.deletion()', () => {
	let fetchStub;

	beforeEach(() => {
		fetchStub = sinon.stub();
	});

	afterEach(() => {
		sinon.restore();
	});

	it('deletes the authorization policy with the expected request', async () => {
		const fetchResult = { ok: true };
		fetchStub.resolves(fetchResult);

		const result = await authorizationPolicy.deletion(
			{ hash: 'abcdef' },
			{ fetch: fetchStub }
		);

		chai.expect(fetchStub.calledOnce).to.be.true;
		chai.expect(fetchStub.args[0][0]).to.deep.equal({
			url: '/apis/security.istio.io/v1/namespaces/odin/authorizationpolicies/istio-ap-odin-kafka-nabcdef',
			method: 'DELETE',
		});
		chai.expect(result).to.deep.equal({
			result: fetchResult,
			type: 'AuthorizationPolicy',
			name: 'authorization-policy-abcdef',
		});
	});

	it('throws when hash is not 6 characters', async () => {
		try {
			await authorizationPolicy.deletion(
				{ hash: 'nope' },
				{ fetch: fetchStub }
			);
			chai.expect.fail('Expected deletion to throw for invalid hash length');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});
});
