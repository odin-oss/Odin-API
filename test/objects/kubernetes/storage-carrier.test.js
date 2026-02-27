import * as chai from 'chai';
import * as sinon from 'sinon';
import * as storageCarrier from '../../../src/objects/kubernetes/storage-carrier.js';
import CONFIG from '../../../src/config/config.js';

describe('storage-carrier.smashExport()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('creates a storage carrier job with expected payload', async () => {
    const fetchResult = { ok: true };
    fetchStub.resolves(fetchResult);

    const props = {
      hash: 'abcdef',
      upload_id: 'upload-1',
      label: 'app',
      app_deletion: true,
      folder_path: '/data',
      storage_carrier_image: 'registry/storage-carrier',
      storage_carrier_image_tag: '1.2.3',
      smash_api_key: 'key',
      smash_region: 'eu-west-3',
      smash_teamid: 'team',
      web_title: 'web-title',
      upload_description: 'desc',
      export_language: 'en',
      availability: '7',
      sender_name: 'sender',
      sender_email: 'sender@example.com',
      receiver_email: 'receiver@example.com',
    };

    const result = await storageCarrier.smashExport(props, fetchStub);

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(fetchStub.args[0][0]).to.include({
      url: '/apis/batch/v1/namespaces/nabcdef/jobs',
      method: 'POST',
    });
    chai.expect(fetchStub.args[0][0].body.metadata).to.deep.equal({
      name: 'storage-carrier-abcdef-upload-1',
      namespace: 'nabcdef',
      labels: {
        hash: 'abcdef',
        app: 'odin-storage-carrier',
      },
    });
    const envs = fetchStub.args[0][0].body.spec.template.spec.containers[0].env;
    const envMap = Object.fromEntries(envs.map((env) => [env.name, env.value]));
    chai.expect(envMap.ENV_HASH).to.equal('abcdef');
    chai.expect(envMap.UPLOAD_ID).to.equal('upload-1');
    chai.expect(envMap.APP_DELETION).to.equal('true');
    chai.expect(envMap.KAFKA_BROKERS).to.equal(CONFIG.KAFKA_BROKER);
    chai.expect(envMap.KAFKA_TOPIC).to.equal(CONFIG.KAFKA_TOPIC);
    chai.expect(result).to.deep.equal({
      result: fetchResult,
      type: 'Job',
      name: 'storage-carrier-abcdef-upload-1',
    });
  });

  it('throws on invalid hash', async () => {
    try {
      await storageCarrier.smashExport({ hash: 'bad' }, fetchStub);
      chai.expect.fail('Expected smashExport to throw for invalid hash');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
