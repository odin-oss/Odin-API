import * as chai from 'chai';
import VariableEnvironment from '../../src/objects/Variable_environment.js';

describe('VariableEnvironment object', () => {
	it('creates with valid properties', () => {
		const env = new VariableEnvironment({
			id_variable_environment: '2',
			key: 'ENV_KEY',
			value: 'ENV_VALUE',
		});

		chai.expect(env.id_variable_environment).to.equal(2);
		chai.expect(env.key).to.equal('ENV_KEY');
		chai.expect(env.value).to.equal('ENV_VALUE');
	});

	it('throws on invalid id_variable_environment', () => {
		chai.expect(() => {
			new VariableEnvironment({ id_variable_environment: -1 });
		}).to.throw();
	});

	it('serializes to JSON', () => {
		const env = new VariableEnvironment({
			id_variable_environment: 1,
			key: 'KEY',
			value: 'VALUE',
		});

		chai.expect(env.toJSON()).to.deep.equal({
			id_variable_environment: 1,
			key: 'KEY',
			value: 'VALUE',
		});
	});
});
