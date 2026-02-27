import * as chai from 'chai';
import sinon from 'sinon';
import { Environment } from '../../src/objects/Environment.js';
import { Interface } from '../../src/objects/Interface.js';

describe('Environment object', () => {
  it('creates with valid properties', () => {
    const env = new Environment({
      id_environment: 1,
      label: 'Production',
      icon: 'cloud',
      interfaces: [],
    });

    chai.expect(env.id_environment).to.equal(1);
    chai.expect(env.label).to.equal('Production');
    chai.expect(env.icon).to.equal('cloud');
    chai.expect(env.interfaces).to.be.an('array');
  });

  it('throws on non-positive id_environment', () => {
    chai.expect(() => {
      new Environment({ id_environment: 0 });
    }).to.throw();
  });

  it('serializes with toJSON', () => {
    const env = new Environment({
      id_environment: 2,
      label: 'Development',
      icon: 'laptop',
      interfaces: [],
    });

    const json = env.toJSON();
    chai.expect(json.id_environment).to.equal(2);
    chai.expect(json.label).to.equal('Development');
    chai.expect(json.icon).to.equal('laptop');
    chai.expect(json.interfaces).to.be.an('array');
  });

  it('fetches interfaces with dependency injection', async () => {
    const env = new Environment({
      id_environment: 3,
      label: 'Test',
      icon: 'test',
    });

    const mockEnv = new Environment({
      id_environment: 3,
      label: 'Test',
      icon: 'test',
      interfaces: [],
    });

    const getStub = sinon.stub().resolves(mockEnv);

    const result = await env.fetchInterfaces({
      environment_get: getStub,
    });

    chai.expect(getStub.calledOnce).to.be.true;
    chai.expect(result).to.equal(env);
  });
});
