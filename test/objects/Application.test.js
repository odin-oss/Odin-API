import * as chai from 'chai';
import { Application } from '../../src/objects/Application.js';
import { Environment } from '../../src/objects/Environment.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
import { History } from '../../src/objects/History.js';

describe('Application object', () => {
  it('creates with valid properties', () => {
    const app = new Application({
      id_application: 1,
      custom_label: 'My App',
      generated_label: 'app-001',
      creation_date: '2026-02-27T10:00:00Z',
      hash: 'abc123',
      username: 'admin',
      password: 'secret',
      id_user: 5,
      id_environment: 2,
      state_application: 'running',
      state_changed_date: '2026-02-27T11:00:00Z',
    });

    chai.expect(app.id_application).to.equal(1);
    chai.expect(app.custom_label).to.equal('My App');
    chai.expect(app.generated_label).to.equal('app-001');
    chai.expect(app.hash).to.equal('abc123');
    chai.expect(app.state_application).to.equal('running');
  });

  it('handles programming_shutdown_date as nullable', () => {
    const app1 = new Application({
      programming_shutdown_date: null,
    });
    chai.expect(app1.programming_shutdown_date).to.be.null;

    const app2 = new Application({
      programming_shutdown_date: '2026-03-01T10:00:00Z',
    });
    chai.expect(app2.programming_shutdown_date).to.exist;
  });

  it('throws on invalid date format', () => {
    chai.expect(() => {
      new Application({
        creation_date: 'not-a-date',
      });
    }).to.throw();
  });

  it('creates with nested objects', () => {
    const env = new Environment({
      id_environment: 1,
      label: 'Production',
      icon: 'cloud',
    });
    const datacenter = new Datacenter({
      id_datacenter: 1,
      label: 'US-East',
      provider: 'AWS',
      city: 'Virginia',
    });
    const history = new History();

    const app = new Application({
      id_application: 10,
      environment: env,
      datacenter: datacenter,
      history: history,
    });

    chai.expect(app.environment).to.equal(env);
    chai.expect(app.datacenter).to.equal(datacenter);
    chai.expect(app.history).to.equal(history);
  });

  it('serializes with toJSON', () => {
    const app = new Application({
      id_application: 2,
      custom_label: 'Test App',
      hash: 'def456',
    });

    const json = app.toJSON();
    chai.expect(json.id_application).to.equal(2);
    chai.expect(json.custom_label).to.equal('Test App');
    chai.expect(json.hash).to.equal('def456');
  });

  it('serializes with public_format', () => {
    const env = new Environment({
      id_environment: 1,
      label: 'Production',
      icon: 'cloud',
      interfaces: [],
    });
    const datacenter = new Datacenter({
      id_datacenter: 1,
      label: 'US-East',
      provider: 'AWS',
      city: 'Virginia',
    });

    const app = new Application({
      id_application: 3,
      custom_label: 'Public App',
      hash: 'xyz789',
      environment: env,
      datacenter: datacenter,
    });

    const format = app.public_format();
    chai.expect(format.id_application).to.equal(3);
    chai.expect(format.custom_label).to.equal('Public App');
    chai.expect(format.hash).to.equal('xyz789');
    chai.expect(format.environment).to.equal('Production');
    chai.expect(format.interfaces).to.be.an('array');
  });
});
