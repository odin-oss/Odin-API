import * as chai from 'chai';
import * as sinon from 'sinon';
import moment from 'moment-timezone';
import sinonChai from 'sinon-chai';
import { Application } from '../../src/objects/Application.js';
import { Environment } from '../../src/objects/Environment.js';
import CONFIG from '../../src/config/config.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
import { History } from '../../src/objects/History.js';
chai.use(sinonChai);

describe('<object> Application', () => {
  let fakeMoment, clock, saveCONFIG;
  beforeEach(() => {
    const fixedTime = '2025-03-07T01:00:00.000+01:00';
    clock = sinon.useFakeTimers(new Date(fixedTime).getTime());
    fakeMoment = sinon.stub(moment, 'tz').callsFake(() => moment(fixedTime));
    saveCONFIG = CONFIG;
  });
  afterEach(() => {
    sinon.restore();
    clock.restore();
    fakeMoment.restore();
    CONFIG.APP_TZ = saveCONFIG.APP_TZ;
  });
  it('creates and checks value of Application object.', () => {
    const app = new Application({
      id_application: 1,
      custom_label: 'custom',
      generated_label: 'generated',
      creation_date: moment.tz('Europe/Paris'),
      hash: 'hashha',
      username: 'b_lefebvre',
      password: 'password',
      id_user: 2,
      id_environment: 1,
      state_application: 'Off',
      state_changed_date: moment.tz('Europe/Paris'),
      programming_shutdown_date: moment.tz('Europe/Paris').add(12, 'h'),
      environment: new Environment({
        id_environment: 1,
        label: 'test',
        icon: 'ereteret',
        interfaces: [],
      }),
    });
    chai.expect(app.id_application).to.be.equal(1);
    chai.expect(app.custom_label).to.be.equal('custom');
    chai.expect(app.creation_date.isSame(moment.tz('Europe/Paris'))).to.be.true;
    chai.expect(app.hash).to.be.equal('hashha');
    chai.expect(app.id_user).to.be.equal(2);
    chai.expect(app.id_environment).to.be.equal(1);
    chai.expect(app.state_application).to.be.equal('Off');
    chai.expect(app.state_changed_date.isSame(moment.tz('Europe/Paris'))).to.be
      .true;
    chai.expect(
      app.programming_shutdown_date.isSame(
        moment.tz('Europe/Paris').add(12, 'h')
      )
    ).to.be.true;
    chai.expect(app.environment).to.be.deep.equal(
      new Environment({
        id_environment: 1,
        label: 'test',
        icon: 'ereteret',
        interfaces: [],
      })
    );
  });
  it('creates, updates and checks value of Application object.', () => {
    const app = new Application({
      id_application: 1,
      custom_label: 'custom',
      generated_label: 'generated',
      creation_date: moment.tz('Europe/Paris'),
      hash: 'hashha',
      username: 'b_lefebvre',
      password: 'password',
      id_user: 2,
      id_environment: 1,
      state_application: 'Off',
      state_changed_date: moment.tz('Europe/Paris'),
      programming_shutdown_date: moment.tz('Europe/Paris').add(12, 'h'),
      environment: new Environment({
        id_environment: 1,
        label: 'test',
        icon: 'ereteret',
        interfaces: [],
      }),
    });
    app.id_application = 2;
    chai.expect(app.id_application).to.be.equal(2);
    app.custom_label = 'customized';
    chai.expect(app.custom_label).to.be.equal('customized');
    app.generated_label = 'customized';
    chai.expect(app.generated_label).to.be.equal('customized');
    app.creation_date = moment.tz('Europe/Paris').add(1, 'hour');
    chai.expect(
      app.creation_date.isSame(moment.tz('Europe/Paris').add(1, 'hour'))
    ).to.be.true;
    app.hash = 'hash12';
    chai.expect(app.hash).to.be.equal('hash12');
    app.username = 'hash12';
    chai.expect(app.username).to.be.equal('hash12');
    app.password = 'hash12';
    chai.expect(app.password).to.be.equal('hash12');
    app.id_user = 12;
    chai.expect(app.id_user).to.be.equal(12);
    app.id_environment = 23;
    chai.expect(app.id_environment).to.be.equal(23);
    app.state_application = 'Ready';
    chai.expect(app.state_application).to.be.equal('Ready');
    app.state_changed_date = moment.tz('Europe/Paris').add(13, 'hour');
    chai.expect(
      app.state_changed_date.isSame(moment.tz('Europe/Paris').add(13, 'hour'))
    ).to.be.true;
    app.programming_shutdown_date = moment.tz('Europe/Paris').add(13, 'h');
    chai.expect(
      app.programming_shutdown_date.isSame(
        moment.tz('Europe/Paris').add(13, 'h')
      )
    ).to.be.true;
    app.environment = new Environment({
      id_environment: 23,
      label: 'wow',
      icon: 'ereteret',
      interfaces: [],
    });
    chai.expect(app.environment).to.be.deep.equal(
      new Environment({
        id_environment: 23,
        label: 'wow',
        icon: 'ereteret',
        interfaces: [],
      })
    );
  });
  it('creates with programming_shutdown_date on null and checks value of Application object.', () => {
    const app = new Application({
      id_application: 1,
      datacenter: new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      }),
      custom_label: 'custom',
      generated_label: 'generated',
      creation_date: moment.tz('Europe/Paris'),
      hash: 'hashha',
      username: 'b_lefebvre',
      password: 'password',
      id_user: 2,
      id_environment: 1,
      state_application: 'Off',
      state_changed_date: moment.tz('Europe/Paris'),
      programming_shutdown_date: null,
      environment: new Environment({
        id_environment: 1,
        label: 'test',
        icon: 'ereteret',
        interfaces: [],
      }),
    });
    chai.expect(app.id_application).to.be.equal(1);
    chai.expect(app.custom_label).to.be.equal('custom');
    chai.expect(app.creation_date.isSame(moment.tz('Europe/Paris'))).to.be.true;
    chai.expect(app.hash).to.be.equal('hashha');
    chai.expect(app.id_user).to.be.equal(2);
    chai.expect(app.id_environment).to.be.equal(1);
    chai.expect(app.state_application).to.be.equal('Off');
    chai.expect(app.state_changed_date.isSame(moment.tz('Europe/Paris'))).to.be
      .true;
    chai.expect(app.programming_shutdown_date).to.be.equal(null);
    chai.expect(app.environment).to.be.deep.equal(
      new Environment({
        id_environment: 1,
        label: 'test',
        icon: 'ereteret',
        interfaces: [],
      })
    );
    chai.expect(app.public_format()).to.deep.equal({
      interfaces: [],
      id_application: 1,
      history: {
        records: [],
      },
      datacenter: {
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      },
      icon: 'ereteret',
      environment: 'test',
      id_environment: 1,
      custom_label: 'custom',
      generated_label: 'generated',
      username: 'b_lefebvre',
      password: 'password',
      hash: 'hashha',
      programming_shutdown_date: null,
      state_application: 'Off',
    });
    app.programming_shutdown_date = moment.tz('Europe/Paris').add(13, 'h');
    chai.expect(
      app.programming_shutdown_date.isSame(
        moment.tz('Europe/Paris').add(13, 'h')
      )
    ).to.be.true;
    chai.expect(app.public_format()).to.deep.equal({
      interfaces: [],
      id_application: 1,
      datacenter: {
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      },
      icon: 'ereteret',
      environment: 'test',
      id_environment: 1,
      custom_label: 'custom',
      generated_label: 'generated',
      username: 'b_lefebvre',
      password: 'password',
      hash: 'hashha',
      programming_shutdown_date: '2025-03-07T14:00:00+01:00',
      state_application: 'Off',
      history: {
        records: [],
      },
    });
  });
  it('creates with programming_shutdown_date on null and checks value of Application object.', () => {
    const app = new Application({
      id_application: 1,
      datacenter: new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      }),
      custom_label: 'custom',
      generated_label: 'generated',
      creation_date: moment.tz(CONFIG.APP_TZ),
      hash: 'hashha',
      username: 'b_lefebvre',
      password: 'password',
      id_user: 2,
      id_environment: 1,
      state_application: 'Off',
      state_changed_date: moment.tz(CONFIG.APP_TZ),
      programming_shutdown_date: null,
      environment: new Environment({
        id_environment: 1,
        label: 'test',
        icon: 'ereteret',
        interfaces: [],
      }),
    });
    chai.expect(app.id_application).to.be.equal(1);
    chai.expect(app.custom_label).to.be.equal('custom');
    chai.expect(app.creation_date.isSame(moment.tz(CONFIG.APP_TZ))).to.be
      .true;
    chai.expect(app.hash).to.be.equal('hashha');
    chai.expect(app.id_user).to.be.equal(2);
    chai.expect(app.id_environment).to.be.equal(1);
    chai.expect(app.state_application).to.be.equal('Off');
    chai.expect(app.state_changed_date.isSame(moment.tz(CONFIG.APP_TZ))).to.be
      .true;
    chai.expect(app.history).to.be.deep.equal(new History());
    chai.expect(app.programming_shutdown_date).to.be.equal(null);
    chai.expect(app.environment).to.be.deep.equal(
      new Environment({
        id_environment: 1,
        label: 'test',
        icon: 'ereteret',
        interfaces: [],
      })
    );
    app.programming_shutdown_date = moment.tz(CONFIG.APP_TZ).add(13, 'h');
    chai.expect(
      app.programming_shutdown_date.isSame(
        moment.tz(CONFIG.APP_TZ).add(13, 'h')
      )
    ).to.be.true;
    chai.expect(app.toJSON()).to.deep.equal({
      id_application: 1,
      custom_label: 'custom',
      generated_label: 'generated',
      datacenter: {
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      },
      history: {
        records: [],
      },
      creation_date: moment.tz(CONFIG.APP_TZ).format(),
      hash: 'hashha',
      username: 'b_lefebvre',
      password: 'password',
      id_user: 2,
      id_environment: 1,
      state_application: 'Off',
      state_changed_date: moment.tz(CONFIG.APP_TZ).format(),
      programming_shutdown_date: moment
        .tz(CONFIG.APP_TZ)
        .add(13, 'h')
        .format(),
      environment: {
        id_environment: 1,
        label: 'test',
        interfaces: [],
        icon: 'ereteret',
      },
    });
  });
});
