import * as chai from 'chai';
import { Session } from '../../src/objects/Session.js';
import { Environment } from '../../src/objects/Environment.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
import { Application } from '../../src/objects/Application.js';
import { User } from '../../src/objects/User.js';

describe('Session object', () => {
  it('creates with valid properties', () => {
    const environment = new Environment({
      id_environment: 1,
      label: 'env',
      icon: 'icon',
    });
    const datacenter = new Datacenter({
      id_datacenter: 1,
      label: 'dc',
      provider: 'provider',
      city: 'city',
    });
    const applications = [new Application({})];
    const users = [
      new User({
        id_user: 1,
        lastname: 'Doe',
        firstname: 'Jane',
        mail: 'jane.doe@example.com',
        role: 'ETUDIANT',
      }),
    ];

    const session = new Session({
      id_session: 10,
      label: 'Session A',
      begin_date: '2026-02-27T10:00:00Z',
      end_date: '2026-02-27T12:00:00Z',
      environment,
      applications,
      users,
      professors: users,
      datacenter,
    });

    chai.expect(session.id_session).to.equal(10);
    chai.expect(session.label).to.equal('Session A');
    chai.expect(session.environment).to.equal(environment);
    chai.expect(session.datacenter).to.equal(datacenter);
  });

  it('throws on invalid dates', () => {
    const environment = new Environment({
      id_environment: 1,
      label: 'env',
      icon: 'icon',
    });
    const datacenter = new Datacenter({
      id_datacenter: 1,
      label: 'dc',
      provider: 'provider',
      city: 'city',
    });

    chai
      .expect(() => {
        new Session({
          label: 'Session A',
          begin_date: 'invalid',
          end_date: 'invalid',
          environment,
          datacenter,
        });
      })
      .to.throw();
  });

  it('serializes to JSON', () => {
    const environment = new Environment({
      id_environment: 2,
      label: 'env',
      icon: 'icon',
    });
    const datacenter = new Datacenter({
      id_datacenter: 2,
      label: 'dc',
      provider: 'provider',
      city: 'city',
    });

    const session = new Session({
      id_session: 2,
      label: 'Session B',
      begin_date: '2026-02-27T10:00:00Z',
      end_date: '2026-02-27T12:00:00Z',
      environment,
      applications: [],
      users: [],
      professors: [],
      datacenter,
    });

    const json = session.toJSON();
    chai.expect(json.id_session).to.equal(2);
    chai.expect(json.label).to.equal('Session B');
    chai.expect(json.environment).to.deep.equal(environment.toJSON());
  });
});
