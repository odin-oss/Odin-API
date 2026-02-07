import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Session } from '../../src/objects/Session.js';
import CONFIG from '../../src/config/config.js';
import moment from 'moment-timezone';
chai.use(sinonChai);

describe('<object> Session', () => {
  it('creates and checks values of Session object.', () => {
    const begin = moment('2020-01-01T00:00:00Z').tz(CONFIG.APP_TZ);
    const end = moment('2020-02-01T00:00:00Z').tz(CONFIG.APP_TZ);

    const env = {
      toJSON: () => ({ env: 'env_json' }),
      public_format: () => ({ env: 'env_public' }),
    };

    const app = {
      toJSON: () => ({ app_id: 1 }),
      public_format: () => ({ app_public: 1 }),
    };

    const user = {
      toJSON: () => ({ user_id: 2 }),
      public_format: () => ({ user_public: 2 }),
    };

    const prof = {
      toJSON: () => ({ prof_id: 3 }),
      public_format: () => ({ prof_public: 3 }),
    };

    const dc = {
      toJSON: () => ({ dc: 'dc_json' }),
      public_format: () => ({ dc: 'dc_public' }),
    };

    const s = new Session({
      id_session: 5,
      label: 'session_label',
      begin_date: begin,
      end_date: end,
      environment: env,
      applications: [app],
      users: [user],
      professors: [prof],
      datacenter: dc,
    });

    chai.expect(s.id_session).to.equal(5);
    chai.expect(s.label).to.equal('session_label');
    chai.expect(s.begin_date).to.equal(begin);
    chai.expect(s.end_date).to.equal(end);
    chai.expect(s.environment).to.equal(env);
    chai.expect(s.applications).to.deep.equal([app]);
    chai.expect(s.users).to.deep.equal([user]);
    chai.expect(s.professors).to.deep.equal([prof]);
    chai.expect(s.datacenter).to.equal(dc);
  });

  it('updates fields and returns proper toJSON and public_format structures.', () => {
    const begin1 = moment('2021-03-01T00:00:00Z').tz(CONFIG.APP_TZ);
    const end1 = moment('2021-04-01T00:00:00Z').tz(CONFIG.APP_TZ);

    const env1 = {
      toJSON: () => ({ env: 'env1_json' }),
      public_format: () => ({ env: 'env1_public' }),
    };

    const app1 = {
      toJSON: () => ({ app_id: 11 }),
      public_format: () => ({ app_public: 11 }),
    };

    const user1 = {
      toJSON: () => ({ user_id: 12 }),
      public_format: () => ({ user_public: 12 }),
    };

    const prof1 = {
      toJSON: () => ({ prof_id: 13 }),
      public_format: () => ({ prof_public: 13 }),
    };

    const dc1 = {
      toJSON: () => ({ dc: 'dc1_json' }),
      public_format: () => ({ dc: 'dc1_public' }),
    };

    const s = new Session();

    // Update all fields via setters
    s.id_session = 42;
    s.label = 'updated_session';
    s.begin_date = begin1;
    s.end_date = end1;
    s.environment = env1;
    s.applications = [app1];
    s.users = [user1];
    s.professors = [prof1];
    s.datacenter = dc1;

    // Verify getters reflect updates
    chai.expect(s.id_session).to.equal(42);
    chai.expect(s.label).to.equal('updated_session');
    chai.expect(s.begin_date).to.equal(begin1);
    chai.expect(s.end_date).to.equal(end1);
    chai.expect(s.environment).to.equal(env1);
    chai.expect(s.applications).to.deep.equal([app1]);
    chai.expect(s.users).to.deep.equal([user1]);
    chai.expect(s.professors).to.deep.equal([prof1]);
    chai.expect(s.datacenter).to.equal(dc1);

    // Expected outputs
    const expectedJSON = {
      id_session: 42,
      label: 'updated_session',
      begin_date: begin1,
      end_date: end1,
      environment: { env: 'env1_json' },
      applications: [{ app_id: 11 }],
      users: [{ user_id: 12 }],
      professors: [{ prof_id: 13 }],
      datacenter: { dc: 'dc1_json' },
    };

    const expectedPublic = {
      id_session: 42,
      label: 'updated_session',
      begin_date: begin1,
      end_date: end1,
      environment: { env: 'env1_public' },
      applications: [{ app_public: 11 }],
      users: [{ user_public: 12 }],
      professors: [{ prof_public: 13 }],
      datacenter: { dc: 'dc1_public' },
    };

    chai.expect(s.toJSON()).to.deep.equal(expectedJSON);
    chai.expect(s.public_format()).to.deep.equal(expectedPublic);
  });
});
