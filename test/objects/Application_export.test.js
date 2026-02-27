import * as chai from 'chai';
import { Application_export } from '../../src/objects/Application_export.js';

describe('Application_export object', () => {
  it('creates with valid properties', () => {
    const appExport = new Application_export({
      id_export: 1,
      id_application: 5,
      init_date: '2026-02-27T10:00:00Z',
      expiration_date: '2026-03-27T10:00:00Z',
      id_provider: 2,
      id_enum_export_state: 1,
      status: 'completed',
      download_link: 'https://example.com/export.zip',
      previous_export_deleted: true,
    });

    chai.expect(appExport.id_export).to.equal(1);
    chai.expect(appExport.id_application).to.equal(5);
    chai.expect(appExport.status).to.equal('completed');
    chai
      .expect(appExport.download_link)
      .to.equal('https://example.com/export.zip');
    chai.expect(appExport.previous_export_deleted).to.be.true;
  });

  it('throws on invalid init_date format', () => {
    chai
      .expect(() => {
        new Application_export({
          init_date: 'not-a-date',
        });
      })
      .to.throw();
  });

  it('throws on invalid expiration_date format', () => {
    chai
      .expect(() => {
        new Application_export({
          init_date: '2026-02-27T10:00:00Z',
          expiration_date: 'invalid-date',
        });
      })
      .to.throw();
  });

  it('handles nullable id_provider', () => {
    const appExport = new Application_export({
      id_export: 2,
      id_application: 10,
      init_date: '2026-02-27T10:00:00Z',
      expiration_date: '2026-03-27T10:00:00Z',
      id_provider: null,
      id_enum_export_state: 1,
      status: 'pending',
      download_link: null,
      previous_export_deleted: false,
    });

    chai.expect(appExport.id_provider).to.be.null;
    chai.expect(appExport.download_link).to.be.null;
  });

  it('serializes with public_format', () => {
    const appExport = new Application_export({
      id_export: 3,
      id_application: 15,
      init_date: '2026-02-27T10:00:00Z',
      expiration_date: '2026-03-27T10:00:00Z',
      id_enum_export_state: 2,
      status: 'failed',
      previous_export_deleted: false,
    });

    const format = appExport.public_format();
    chai.expect(format.id_export).to.equal(3);
    chai.expect(format.id_application).to.equal(15);
    chai.expect(format.status).to.equal('failed');
    chai.expect(format.init_date).to.exist;
    chai.expect(format.expiration_date).to.exist;
  });

  it('serializes with toJSON', () => {
    const appExport = new Application_export({
      id_export: 4,
      id_application: 20,
      init_date: '2026-02-27T10:00:00Z',
      expiration_date: '2026-03-27T10:00:00Z',
      id_provider: 1,
      id_enum_export_state: 3,
      status: 'processing',
      download_link: 'https://example.com/export2.zip',
      previous_export_deleted: true,
    });

    const json = appExport.toJSON();
    chai.expect(json.id_export).to.equal(4);
    chai.expect(json.id_provider).to.equal(1);
    chai.expect(json.status).to.equal('processing');
    chai.expect(json.download_link).to.equal('https://example.com/export2.zip');
  });
});
