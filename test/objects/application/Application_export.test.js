import * as chai from 'chai';
import * as sinon from 'sinon';
import moment from 'moment-timezone';
import sinonChai from 'sinon-chai';
import { Application_export } from '../../../src/objects/application/Application_export.js';
import CONFIG from '../../../src/config/config.js';

chai.use(sinonChai);

describe('<object> Application_export', () => {
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

  it('creates and checks value of Application_export object.', () => {
    const appExport = new Application_export({
      id_export: 1,
      id_application: 1,
      init_date: moment.tz(CONFIG.APP_TZ),
      expiration_date: moment.tz(CONFIG.APP_TZ).add(1, 'days'),
      id_enum_export_state: 1,
    });

    chai.expect(appExport.id_export).to.be.equal(1);
    chai.expect(appExport.id_application).to.be.equal(1);
    chai.expect(appExport.init_date.isSame(moment.tz(CONFIG.APP_TZ))).to.be
      .true;
    chai.expect(
      appExport.expiration_date.isSame(
        moment.tz(CONFIG.APP_TZ).add(1, 'days')
      )
    ).to.be.true;
    chai.expect(appExport.id_enum_export_state).to.be.equal(1);
    chai.expect(appExport.download_link).to.be.null;
    chai.expect(appExport.previous_export_deleted).to.be.false;
  });

  it('creates, updates, and checks value of Application_export object.', () => {
    const appExport = new Application_export({
      id_export: 1,
      id_application: 1,
      init_date: moment.tz(CONFIG.APP_TZ),
      expiration_date: moment.tz(CONFIG.APP_TZ).add(1, 'days'),
      id_enum_export_state: 1,
      download_link: 'https://example.com/download',
    });

    appExport.id_export = 2;
    chai.expect(appExport.id_export).to.be.equal(2);

    appExport.id_application = 2;
    chai.expect(appExport.id_application).to.be.equal(2);

    // Test updating id_provider
    appExport.id_provider = 'jfsMze_y12-ct';
    chai.expect(appExport.id_provider).to.be.equal('jfsMze_y12-ct');

    appExport.init_date = moment.tz(CONFIG.APP_TZ);
    chai.expect(appExport.init_date.isSame(moment.tz(CONFIG.APP_TZ))).to.be
      .true;

    appExport.expiration_date = moment.tz(CONFIG.APP_TZ).add(2, 'days');
    chai.expect(
      appExport.expiration_date.isSame(
        moment.tz(CONFIG.APP_TZ).add(2, 'days')
      )
    ).to.be.true;

    appExport.id_enum_export_state = 2;
    chai.expect(appExport.id_enum_export_state).to.be.equal(2);

    appExport.status = 'Available';
    chai.expect(appExport.status).to.be.equal('Available');

    appExport.download_link = 'https://example.com/new-download';
    chai
      .expect(appExport.download_link)
      .to.be.equal('https://example.com/new-download');

    appExport.previous_export_deleted = true;
    chai.expect(appExport.previous_export_deleted).to.be.true;
  });

  it('creates and checks public_format of Application_export object.', () => {
    const appExport = new Application_export({
      id_export: 1,
      id_application: 1,
      init_date: moment.tz(CONFIG.APP_TZ),
      expiration_date: moment.tz(CONFIG.APP_TZ).add(1, 'days'),
      id_enum_export_state: 1,
    });

    chai.expect(appExport.public_format()).to.deep.equal({
      id_export: 1,
      id_application: 1,
      init_date: moment.tz(CONFIG.APP_TZ).format(),
      expiration_date: moment.tz(CONFIG.APP_TZ).add(1, 'days').format(),
      id_enum_export_state: 1,
      status: null,
      download_link: null,
      previous_export_deleted: false,
    });
  });

  it('creates and checks toJSON of Application_export object.', () => {
    const appExport = new Application_export({
      id_export: 1,
      id_application: 1,
      init_date: moment.tz(CONFIG.APP_TZ),
      expiration_date: moment.tz(CONFIG.APP_TZ).add(1, 'days'),
      id_enum_export_state: 1,
    });

    chai.expect(appExport.toJSON()).to.deep.equal({
      id_export: 1,
      id_application: 1,
      init_date: moment.tz(CONFIG.APP_TZ).format(),
      expiration_date: moment.tz(CONFIG.APP_TZ).add(1, 'days').format(),
      id_enum_export_state: 1,
      status: null,
      id_provider: null,
      download_link: null,
      previous_export_deleted: false,
    });
  });
});
