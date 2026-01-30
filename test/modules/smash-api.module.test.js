import * as smashAPI from '../../src/modules/smash-api.module.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONFIG from '../../src/config/config.js';
chai.use(sinonChai);

describe('smash-api.module.smash_module()', () => {
  let fakeFetch, saveCONFIG;
  beforeEach(() => {
    fakeFetch = sinon.stub();
    saveCONFIG = CONFIG;
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.smash_storage_carrier_region =
      saveCONFIG.smash_storage_carrier_region;
    CONFIG.smash_storage_carrier_api_key =
      saveCONFIG.smash_storage_carrier_api_key;
  });

  it('called with valid arguments and should execute successfully', async () => {
    CONFIG.smash_storage_carrier_region = 'eu-west-1';
    CONFIG.smash_storage_carrier_api_key = 'test-api-key';

    fakeFetch.resolves(
      Promise.resolve({
        result: 'ok',
      })
    );

    const result = await smashAPI.default(
      {
        route: '/test',
        method: 'get',
        body: { test: 'data' },
      },
      { fetch: fakeFetch }
    );

    chai.expect(result).to.be.deep.equal({
      result: 'ok',
    });

    chai
      .expect(fakeFetch)
      .to.have.been.calledOnceWithExactly(
        'https://transfer.eu-west-1.fromsmash.co/test?version=01-2024',
        {
          method: 'get',
          body: JSON.stringify({ test: 'data' }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          },
        }
      );
  });

  it('called with fetch rejecting and should log the error', async () => {
    const testError = new Error('Fetch failed');
    fakeFetch.rejects(testError);

    const consoleLogStub = sinon.stub(console, 'log');

    const result = await smashAPI.default(
      {
        route: '/test',
        method: 'get',
        body: { test: 'data' },
      },
      { fetch: fakeFetch }
    );

    chai.expect(consoleLogStub).to.have.been.calledOnceWithExactly(testError);
    chai.expect(result).to.be.undefined;
    consoleLogStub.restore();
  });
});

describe('smash-api.module.exec_transfer_deletion()', () => {
  let fakeSmashModule;

  beforeEach(() => {
    fakeSmashModule = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with valid transfer_id and should execute deletion', async () => {
    fakeSmashModule.resolves(
      Promise.resolve({
        json: () => {
          return {
            result: 'Transfer deleted',
          };
        },
      })
    );

    const result = await smashAPI.exec_transfer_deletion(
      { transfer_id: '12345' },
      { smash_module: fakeSmashModule }
    );

    chai.expect(fakeSmashModule).to.have.been.calledOnceWithExactly({
      route: '/transfer/12345',
      method: 'delete',
    });

    chai.expect(result).to.be.deep.equal({
      result: 'Transfer deleted',
    });
  });

  it('called with fetch rejecting and should return undefined', async () => {
    fakeSmashModule.rejects(new Error('API error'));

    // We need to catch the error since the function doesn't handle rejections
    try {
      const result = await smashAPI.exec_transfer_deletion(
        { transfer_id: '12345' },
        { smash_module: fakeSmashModule }
      );
      // If we get here, the test should fail
      chai.expect.fail('Expected an error to be thrown');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(Error);
      chai.expect(err.message).to.equal('API error');
    }
  });
});
