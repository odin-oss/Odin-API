import * as variableEnvironment_controller from '../../src/controllers/variableEnvironment.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.util.js';
import { DBConnexionRefused } from '../../src/utils/errors.util.js';
import VariableEnvironment from '../../src/objects/Variable_environment.js';

chai.use(sinonChai);

describe('variableEnvironment_controller.list()', () => {
	let fakeList, fakeReq, fakeRes;

	beforeEach(() => {
		fakeList = sinon.stub();
		const token = token_service.generateToken({ id_user: 1 });
		fakeReq = {
			headers: {
				authorization: 'Bearer ' + token,
			},
			query: {},
			method: 'GET',
			originalUrl: '/variableEnvironment/list',
		};
		fakeRes = {
			status: sinon.stub().returnsThis(),
			json: sinon.stub(),
		};
	});

	afterEach(() => {
		sinon.restore();
	});

	it('called and should return list of variable environments.', async () => {
		const mockVarEnvs = [
			new VariableEnvironment({
				id_variable_environment: 1,
				key: 'NODE_ENV',
				value: 'production',
			}),
			new VariableEnvironment({
				id_variable_environment: 2,
				key: 'PORT',
				value: '3000',
			}),
		];

		fakeList.resolves(Promise.resolve(mockVarEnvs));

		await variableEnvironment_controller.list(fakeReq, fakeRes, {
			variableEnvironment_list: fakeList,
		});

		chai.expect(fakeList).to.have.been.calledOnceWithExactly();
		chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
		chai.expect(fakeRes.json).to.have.been.calledOnce;
		const jsonCall = fakeRes.json.firstCall.args[0];
		chai.expect(jsonCall.success).to.equal(true);
		chai
			.expect(jsonCall.message)
			.to.equal('List of variables environments type transmitted.');
	});

	it('called but should reject with DBConnexionRefused error.', async () => {
		fakeList.rejects(
			new DBConnexionRefused('Connexion to the database refused.'),
		);

		await variableEnvironment_controller.list(fakeReq, fakeRes, {
			variableEnvironment_list: fakeList,
		});

		chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
		const jsonCall = fakeRes.json.firstCall.args[0];
		chai.expect(jsonCall.success).to.equal(false);
		chai
			.expect(jsonCall.message)
			.to.equal('Connexion to the database refused.');
		chai.expect(jsonCall.error.type).to.equal('DBConnexionRefused');
	});
});
