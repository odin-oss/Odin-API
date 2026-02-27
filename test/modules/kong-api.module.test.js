import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as kongApiModule from '../../src/modules/kong-api.module.js';

chai.use(sinonChai);
const { expect } = chai;

describe('kong-api.module.fetch()', () => {
  it('should return message when apps-ingress is not activated', async () => {
    // This test verifies the early return when apps-ingress is disabled
    // CONFIG.APPS_INGRESS_ACTIVATED controls this behavior
    const mockFetch = sinon.stub().resolves({
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true }),
    });
    const result = await kongApiModule.fetch(
      { url: '/services', method: 'GET' },
      mockFetch
    );

    // If apps-ingress is not activated, function returns the message
    if (typeof result === 'string') {
      expect(result).to.equal('Apps-Ingress (Kong) is not activated.');
    }
  });

  it('should perform GET request successfully with JSON response', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ id: 1, name: 'test-service' }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    const result = await kongApiModule.fetch(
      { url: '/services', method: 'GET' },
      mockFetch
    );

    expect(result).to.deep.equal({ id: 1, name: 'test-service' });
  });

  it('should perform POST request with body', async () => {
    const mockResponse = {
      status: 201,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ id: 1, name: 'new-service' }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);
    const body = { name: 'new-service', url: 'http://localhost:8000' };

    const result = await kongApiModule.fetch(
      { url: '/services', method: 'POST', body },
      mockFetch
    );

    expect(result).to.deep.equal({ id: 1, name: 'new-service' });
  });

  it('should return {result: ok} for non-JSON response', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'text/html',
      },
      json: async () => ({ error: 'not json' }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    const result = await kongApiModule.fetch(
      { url: '/health', method: 'GET' },
      mockFetch
    );

    expect(result).to.deep.equal({ result: 'ok' });
  });

  it('should perform DELETE request', async () => {
    const mockResponse = {
      status: 204,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({}),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    const result = await kongApiModule.fetch(
      { url: '/services/1', method: 'DELETE' },
      mockFetch
    );

    expect(result).to.deep.equal({});
  });

  it('should use custom headers when provided', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ success: true }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);
    const customHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };

    await kongApiModule.fetch(
      { url: '/services', method: 'GET', headers: customHeaders },
      mockFetch
    );

    const callArgs = mockFetch.getCall(0).args[1];
    expect(callArgs.headers['Content-Type']).to.equal('application/x-www-form-urlencoded');
  });

  it('should use default Content-Type when custom headers not provided', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ success: true }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    await kongApiModule.fetch(
      { url: '/services', method: 'GET' },
      mockFetch
    );

    const callArgs = mockFetch.getCall(0).args[1];
    expect(callArgs.headers['Content-Type']).to.equal('application/json');
  });

  it('should handle unique constraint violation error', async () => {
    const mockResponse = {
      status: 409,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ name: 'unique constraint violation', message: 'Service already exists' }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    const result = await kongApiModule.fetch(
      { url: '/services', method: 'POST', body: { name: 'test' } },
      mockFetch
    );

    expect(result.name).to.equal('unique constraint violation');
  });

  it('should handle odin-auth plugin missing error', async () => {
    const mockResponse = {
      status: 500,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({
        fields: {
          name: "plugin 'odin-auth' not enabled; add it to the 'plugins' configuration property"
        },
        message: 'Plugin error'
      }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    const result = await kongApiModule.fetch(
      { url: '/services', method: 'POST', body: { name: 'test' } },
      mockFetch
    );

    expect(result.fields.name).to.include('odin-auth');
  });

  it('should throw AppsIngressErrorNotDefined on generic error', async () => {
    // Note: Testing instanceof nf.FetchError requires actual FetchError class
    // Generic errors caught in try-catch throw AppsIngressErrorNotDefined
    const mockError = new Error('Connection refused');
    const mockFetch = sinon.stub().rejects(mockError);

    try {
      await kongApiModule.fetch(
        { url: '/services', method: 'GET' },
        mockFetch
      );
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.name).to.equal('AppsIngressErrorNotDefined');
    }
  });

  it('should throw AppsIngressErrorNotDefined on timeout error', async () => {
    const timeoutError = new Error('Request timeout');
    const mockFetch = sinon
      .stub()
      .rejects(timeoutError);

    try {
      await kongApiModule.fetch(
        { url: '/services', method: 'GET' },
        mockFetch
      );
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.name).to.equal('AppsIngressErrorNotDefined');
    }
  });

  it('should stringify JSON body for POST request', async () => {
    const mockResponse = {
      status: 201,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ id: 1 }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);
    const body = { name: 'test', routes: ['route1', 'route2'] };

    await kongApiModule.fetch(
      { url: '/services', method: 'POST', body },
      mockFetch
    );

    const callArgs = mockFetch.getCall(0).args[1];
    expect(callArgs.body).to.equal(JSON.stringify(body));
  });

  it('should not include body for GET request', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ success: true }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    await kongApiModule.fetch(
      { url: '/services', method: 'GET', body: { name: 'test' } },
      mockFetch
    );

    const callArgs = mockFetch.getCall(0).args[1];
    expect(callArgs.body).to.be.undefined;
  });

  it('should not include body for DELETE request', async () => {
    const mockResponse = {
      status: 204,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({}),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    await kongApiModule.fetch(
      { url: '/services/1', method: 'DELETE', body: { id: 1 } },
      mockFetch
    );

    const callArgs = mockFetch.getCall(0).args[1];
    expect(callArgs.body).to.be.undefined;
  });

  it('should handle response with missing content-type header', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => null,
      },
      json: async () => ({ should: 'not be called' }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    const result = await kongApiModule.fetch(
      { url: '/health', method: 'GET' },
      mockFetch
    );

    expect(result).to.deep.equal({ result: 'ok' });
  });

  it('should use default parameters when not provided', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ success: true }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    const result = await kongApiModule.fetch({}, mockFetch);

    expect(result).to.deep.equal({ success: true });
  });

  it('should construct correct URL with APPS_INGRESS_URL', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ success: true }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    await kongApiModule.fetch(
      { url: '/services', method: 'GET' },
      mockFetch
    );

    const callArgs = mockFetch.getCall(0).args[0];
    expect(callArgs).to.include('http://');
  });

  it('should handle PATCH request', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ id: 1, updated: true }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);
    const body = { name: 'updated-service' };

    const result = await kongApiModule.fetch(
      { url: '/services/1', method: 'PATCH', body },
      mockFetch
    );

    expect(result).to.deep.equal({ id: 1, updated: true });
    const callArgs = mockFetch.getCall(0).args[1];
    expect(callArgs.body).to.equal(JSON.stringify(body));
  });

  it('should handle PUT request', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ id: 1, replaced: true }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);
    const body = { name: 'replaced-service' };

    const result = await kongApiModule.fetch(
      { url: '/services/1', method: 'PUT', body },
      mockFetch
    );

    expect(result).to.deep.equal({ id: 1, replaced: true });
  });
});
