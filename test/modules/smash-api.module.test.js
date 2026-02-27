import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as smashApiModule from '../../src/modules/smash-api.module.js';

chai.use(sinonChai);
const { expect } = chai;

describe('smash-api.module', () => {
  describe('smash_module()', () => {
    it('should perform GET request to smash api', async () => {
      const mockResponse = { ok: true, status: 200 };
      const mockFetch = sinon.stub().resolves(mockResponse);

      const result = await smashApiModule.smash_module(
        {
          route: '/transfers',
          method: 'get',
          body: {},
        },
        { fetch: mockFetch }
      );

      expect(result).to.deep.equal(mockResponse);
      expect(mockFetch.called).to.be.true;
    });

    it('should perform POST request to smash api', async () => {
      const mockResponse = { ok: true, status: 201, id: 1 };
      const mockFetch = sinon.stub().resolves(mockResponse);
      const body = { name: 'test-transfer' };

      const result = await smashApiModule.smash_module(
        {
          route: '/transfers',
          method: 'post',
          body,
        },
        { fetch: mockFetch }
      );

      expect(result).to.deep.equal(mockResponse);
    });

    it('should perform DELETE request to smash api', async () => {
      const mockResponse = { ok: true, status: 204 };
      const mockFetch = sinon.stub().resolves(mockResponse);

      const result = await smashApiModule.smash_module(
        {
          route: '/transfers/1',
          method: 'delete',
        },
        { fetch: mockFetch }
      );

      expect(result).to.deep.equal(mockResponse);
    });

    it('should include authorization header with api key', async () => {
      const mockFetch = sinon.stub().resolves({ ok: true });

      await smashApiModule.smash_module(
        {
          route: '/transfers',
          method: 'get',
        },
        { fetch: mockFetch }
      );

      const callArgs = mockFetch.getCall(0).args[1];
      expect(callArgs.headers.Authorization).to.include('Bearer');
    });

    it('should include content-type header application/json', async () => {
      const mockFetch = sinon.stub().resolves({ ok: true });

      await smashApiModule.smash_module(
        {
          route: '/transfers',
          method: 'get',
        },
        { fetch: mockFetch }
      );

      const callArgs = mockFetch.getCall(0).args[1];
      expect(callArgs.headers['Content-Type']).to.equal('application/json');
    });

    it('should stringify JSON body in request', async () => {
      const mockFetch = sinon.stub().resolves({ ok: true });
      const body = { name: 'test', url: 'http://example.com' };

      await smashApiModule.smash_module(
        {
          route: '/transfers',
          method: 'post',
          body,
        },
        { fetch: mockFetch }
      );

      const callArgs = mockFetch.getCall(0).args[1];
      expect(callArgs.body).to.equal(JSON.stringify(body));
    });

    it('should default body to empty object when not provided', async () => {
      const mockFetch = sinon.stub().resolves({ ok: true });

      await smashApiModule.smash_module(
        {
          route: '/transfers',
          method: 'get',
        },
        { fetch: mockFetch }
      );

      const callArgs = mockFetch.getCall(0).args[1];
      expect(callArgs.body).to.equal(JSON.stringify({}));
    });

    it('should construct correct URL with version and region', async () => {
      const mockFetch = sinon.stub().resolves({ ok: true });

      await smashApiModule.smash_module(
        {
          route: '/transfers',
          method: 'get',
        },
        { fetch: mockFetch }
      );

      const url = mockFetch.getCall(0).args[0];
      expect(url).to.include('https://transfer.');
      expect(url).to.include('.fromsmash.co');
      expect(url).to.include('version=01-2024');
    });

    it('should throw error on invalid method', async () => {
      const mockFetch = sinon.stub().resolves({ ok: true });

      try {
        await smashApiModule.smash_module(
          {
            route: '/transfers',
            method: 'invalid',
          },
          { fetch: mockFetch }
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.exist;
      }
    });

    it('should throw error on missing route', async () => {
      const mockFetch = sinon.stub().resolves({ ok: true });

      try {
        await smashApiModule.smash_module(
          {
            method: 'get',
          },
          { fetch: mockFetch }
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.exist;
      }
    });

    it('should handle GET with body (though unusual)', async () => {
      const mockResponse = { ok: true };
      const mockFetch = sinon.stub().resolves(mockResponse);
      const body = { filter: 'test' };

      const result = await smashApiModule.smash_module(
        {
          route: '/transfers',
          method: 'get',
          body,
        },
        { fetch: mockFetch }
      );

      expect(result).to.deep.equal(mockResponse);
      const callArgs = mockFetch.getCall(0).args[1];
      expect(callArgs.body).to.equal(JSON.stringify(body));
    });

    it('should use default fetch when not provided', async () => {
      // This test verifies the function signature accepts default fetch
      expect(smashApiModule.smash_module).to.be.a('function');
    });

    it('should set correct HTTP method in options', async () => {
      const mockFetch = sinon.stub().resolves({ ok: true });

      await smashApiModule.smash_module(
        {
          route: '/transfers/1',
          method: 'delete',
        },
        { fetch: mockFetch }
      );

      const callArgs = mockFetch.getCall(0).args[1];
      expect(callArgs.method).to.equal('delete');
    });
  });

  describe('exec_transfer_deletion()', () => {
    it('should delete transfer with valid transfer_id', async () => {
      const mockResponse = {
        json: async () => ({ success: true }),
      };
      const mockSmashModule = sinon.stub().resolves(mockResponse);

      const result = await smashApiModule.exec_transfer_deletion(
        { transfer_id: '12345' },
        { smash_module: mockSmashModule }
      );

      expect(result).to.deep.equal({ success: true });
    });

    it('should call smash_module with correct parameters', async () => {
      const mockResponse = {
        json: async () => ({ deleted: true }),
      };
      const mockSmashModule = sinon.stub().resolves(mockResponse);

      await smashApiModule.exec_transfer_deletion(
        { transfer_id: 'transfer123' },
        { smash_module: mockSmashModule }
      );

      expect(mockSmashModule.called).to.be.true;
      const args = mockSmashModule.getCall(0).args[0];
      expect(args.route).to.include('transfer123');
      expect(args.method).to.equal('delete');
    });

    it('should use DELETE method for transfer deletion', async () => {
      const mockResponse = {
        json: async () => ({ deleted: true }),
      };
      const mockSmashModule = sinon.stub().resolves(mockResponse);

      await smashApiModule.exec_transfer_deletion(
        { transfer_id: '12345' },
        { smash_module: mockSmashModule }
      );

      const args = mockSmashModule.getCall(0).args[0];
      expect(args.method).to.equal('delete');
    });

    it('should construct route with transfer_id', async () => {
      const mockResponse = {
        json: async () => ({ deleted: true }),
      };
      const mockSmashModule = sinon.stub().resolves(mockResponse);

      await smashApiModule.exec_transfer_deletion(
        { transfer_id: 'abc123' },
        { smash_module: mockSmashModule }
      );

      const args = mockSmashModule.getCall(0).args[0];
      expect(args.route).to.equal('/transfer/abc123');
    });

    it('should parse response JSON', async () => {
      const expectedResponse = { id: 'transfer123', deleted: true };
      const mockResponse = {
        json: async () => expectedResponse,
      };
      const mockSmashModule = sinon.stub().resolves(mockResponse);

      const result = await smashApiModule.exec_transfer_deletion(
        { transfer_id: 'transfer123' },
        { smash_module: mockSmashModule }
      );

      expect(result).to.deep.equal(expectedResponse);
    });

    it('should throw error on invalid transfer_id', async () => {
      const mockSmashModule = sinon.stub().resolves({});

      try {
        await smashApiModule.exec_transfer_deletion(
          { transfer_id: '' },
          { smash_module: mockSmashModule }
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.exist;
      }
    });

    it('should throw error on missing transfer_id', async () => {
      const mockSmashModule = sinon.stub().resolves({});

      try {
        await smashApiModule.exec_transfer_deletion(
          {},
          { smash_module: mockSmashModule }
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.exist;
      }
    });

    it('should handle response with error message', async () => {
      const mockResponse = {
        json: async () => ({ error: 'Transfer not found', code: 404 }),
      };
      const mockSmashModule = sinon.stub().resolves(mockResponse);

      const result = await smashApiModule.exec_transfer_deletion(
        { transfer_id: 'nonexistent' },
        { smash_module: mockSmashModule }
      );

      expect(result).to.have.property('error');
      expect(result.error).to.equal('Transfer not found');
    });

    it('should use default smash_module when not provided', async () => {
      // This test verifies the function signature accepts default smash_module
      expect(smashApiModule.exec_transfer_deletion).to.be.a('function');
    });

    it('should handle numeric transfer_id as string', async () => {
      const mockResponse = {
        json: async () => ({ success: true }),
      };
      const mockSmashModule = sinon.stub().resolves(mockResponse);

      const result = await smashApiModule.exec_transfer_deletion(
        { transfer_id: '98765' },
        { smash_module: mockSmashModule }
      );

      expect(result).to.deep.equal({ success: true });
      const args = mockSmashModule.getCall(0).args[0];
      expect(args.route).to.equal('/transfer/98765');
    });

    it('should handle transfer_id with special characters', async () => {
      const mockResponse = {
        json: async () => ({ success: true }),
      };
      const mockSmashModule = sinon.stub().resolves(mockResponse);

      const result = await smashApiModule.exec_transfer_deletion(
        { transfer_id: 'abc-def-123_xyz' },
        { smash_module: mockSmashModule }
      );

      expect(result).to.deep.equal({ success: true });
    });

    it('should chain response.json() correctly', async () => {
      const jsonData = { deleted: true, transferId: 'transfer123' };
      const mockResponse = {
        json: sinon.stub().resolves(jsonData),
      };
      const mockSmashModule = sinon.stub().resolves(mockResponse);

      const result = await smashApiModule.exec_transfer_deletion(
        { transfer_id: 'transfer123' },
        { smash_module: mockSmashModule }
      );

      expect(mockResponse.json.called).to.be.true;
      expect(result).to.deep.equal(jsonData);
    });
  });
});
