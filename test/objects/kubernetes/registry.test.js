import * as chai from 'chai';
import * as sinon from 'sinon';
import * as registry from '../../../src/objects/kubernetes/registry.js';
import CONFIG from '../../../src/config/config.js';

describe('registry.create()', () => {
	let fetchStub;

	beforeEach(() => {
		fetchStub = sinon.stub();
	});

	afterEach(() => {
		sinon.restore();
	});

	it('creates the registry secret with docker config', async () => {
		const fetchResult = { ok: true };
		fetchStub.resolves(fetchResult);

		const result = await registry.create({ hash: 'abcdef' }, fetchStub);

		const auths = {
			[CONFIG.REGISTRY_URL]: {
				username: CONFIG.REGISTRY_USERNAME,
				password: CONFIG.REGISTRY_PASSWORD,
			},
		};
		const expectedDockerConfig = Buffer.from(
			JSON.stringify({ auths })
		).toString('base64');

		chai.expect(fetchStub.calledOnce).to.be.true;
		chai.expect(fetchStub.args[0][0]).to.deep.equal({
			url: '/api/v1/namespaces/nabcdef/secrets',
			method: 'POST',
			body: {
				data: {
					'.dockerconfigjson': expectedDockerConfig,
				},
				metadata: {
					name: 'registryhub',
					namespace: 'nabcdef',
					labels: {
						type: 'RegistryHub',
						hash: 'abcdef',
					},
				},
				type: 'kubernetes.io/dockerconfigjson',
			},
		});
		chai.expect(result).to.deep.equal({
			result: fetchResult,
			type: 'RegistryHub',
			name: 'registryhub',
		});
	});

	it('throws on invalid hash', async () => {
		try {
			await registry.create({ hash: 'bad' }, fetchStub);
			chai.expect.fail('Expected create to throw for invalid hash');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});
});

describe('registry.deletion()', () => {
	let fetchStub;

	beforeEach(() => {
		fetchStub = sinon.stub();
	});

	afterEach(() => {
		sinon.restore();
	});

	it('deletes the registry secret', async () => {
		const fetchResult = { ok: true };
		fetchStub.resolves(fetchResult);

		const result = await registry.deletion({ hash: 'abcdef' }, fetchStub);

		chai.expect(fetchStub.calledOnce).to.be.true;
		chai.expect(fetchStub.args[0][0]).to.deep.equal({
			url: '/api/v1/namespaces/nabcdef/secrets/registryhub',
			method: 'DELETE',
		});
		chai.expect(result).to.deep.equal({
			result: fetchResult,
			type: 'RegistryHub',
			name: 'registryhub',
		});
	});

	it('throws on invalid hash', async () => {
		try {
			await registry.deletion({ hash: 'nope' }, fetchStub);
			chai.expect.fail('Expected deletion to throw for invalid hash');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});
});
