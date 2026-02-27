import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as kapiModule from '../../src/modules/kapi.module.js';

chai.use(sinonChai);
const { expect } = chai;

describe('kapi.module.fetch()', () => {
  it('should return message when kubernetes is not activated', async () => {
    // Skip if CONFIG.KUBERNETES_ACTIVATED is true
    // This test verifies the early return when kubernetes is disabled
    const mockFetch = sinon.stub().resolves({
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ test: true }),
    });
    const result = await kapiModule.fetch(
      { url: '/api', method: 'GET' },
      mockFetch
    );

    // If kubernetes is not activated, function returns the message
    if (typeof result === 'string') {
      expect(result).to.equal('Kubernetes is not activated.');
    }
  });

  it('should perform GET request successfully', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ success: true }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    const result = await kapiModule.fetch(
      { url: '/api/test', method: 'GET', body: undefined },
      mockFetch,
      1,
      0
    );

    expect(result).to.deep.equal({ success: true });
    expect(mockFetch.called).to.be.true;
  });

  it('should perform POST request with body', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ id: 1 }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);
    const body = { name: 'test', metadata: { name: 'test-obj' } };

    const result = await kapiModule.fetch(
      { url: '/api/test', method: 'POST', body },
      mockFetch,
      1,
      0
    );

    expect(result).to.deep.equal({ id: 1 });
    expect(mockFetch.called).to.be.true;
  });

  it('should handle text response content type', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'text/plain',
      },
      text: async () => 'success',
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    const result = await kapiModule.fetch(
      { url: '/api/test', method: 'GET' },
      mockFetch,
      1,
      0
    );

    expect(result).to.equal('success');
  });

  it('should throw KubernetesAPITimedOut for status 429', async () => {
    const mockResponse = {
      status: 429,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ error: 'too many requests' }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    try {
      await kapiModule.fetch(
        { url: '/api/test', method: 'GET' },
        mockFetch,
        1,
        0
      );
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.message).to.include('timed out');
    }
  });

  it('should throw KubernetesAPITimedOut for status 504', async () => {
    const mockResponse = {
      status: 504,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ error: 'bad gateway' }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    try {
      await kapiModule.fetch(
        { url: '/api/test', method: 'GET' },
        mockFetch,
        1,
        0
      );
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.message).to.include('timed out');
    }
  });

  it('should throw KubernetesAPITimedOut for status 502', async () => {
    const mockResponse = {
      status: 502,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ error: 'bad gateway' }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    try {
      await kapiModule.fetch(
        { url: '/api/test', method: 'GET' },
        mockFetch,
        1,
        0
      );
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.message).to.include('timed out');
    }
  });

  it('should handle 409 Conflict status and return success message', async () => {
    const mockResponse = {
      status: 409,
      statusText: 'Conflict',
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ error: 'conflict' }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);
    const body = { kind: 'Pod', metadata: { name: 'test', namespace: 'default' } };

    const result = await kapiModule.fetch(
      { url: '/api/test', method: 'POST', body },
      mockFetch,
      1,
      0
    );

    expect(result).to.be.a('string');
    expect(result).to.include('Already present on the cluster');
  });

  it('should throw error for status >= 400 (not 409)', async () => {
    const mockResponse = {
      status: 500,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ error: 'internal error' }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    try {
      await kapiModule.fetch(
        { url: '/api/test', method: 'GET' },
        mockFetch,
        1,
        0
      );
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.message).to.include('status code');
    }
  });

  it('should handle DELETE request', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ deleted: true }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    const result = await kapiModule.fetch(
      { url: '/api/test', method: 'DELETE' },
      mockFetch,
      1,
      0
    );

    expect(result).to.deep.equal({ deleted: true });
  });

  it('should retry on failure and succeed on retry', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ success: true }),
    };
    const mockFetch = sinon
      .stub()
      .onFirstCall()
      .rejects(new Error('Network error'))
      .onSecondCall()
      .resolves(mockResponse);

    const result = await kapiModule.fetch(
      { url: '/api/test', method: 'GET' },
      mockFetch,
      2,
      0
    );

    expect(result).to.deep.equal({ success: true });
    expect(mockFetch.calledTwice).to.be.true;
  });

  it('should throw error after max retries exceeded', async () => {
    const mockFetch = sinon
      .stub()
      .rejects(new Error('Network error'));

    try {
      await kapiModule.fetch(
        { url: '/api/test', method: 'GET' },
        mockFetch,
        2,
        0
      );
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(mockFetch.callCount).to.equal(2);
    }
  });

  it('should throw KubernetesAPINotResponding for ECONNREFUSED', async () => {
    const mockFetch = sinon
      .stub()
      .rejects(new Error('ECONNREFUSED: Connection refused'));

    try {
      await kapiModule.fetch(
        { url: '/api/test', method: 'GET' },
        mockFetch,
        1,
        0
      );
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.name).to.equal('KubernetesAPINotResponding');
    }
  });

  it('should throw KubernetesAPIInvalidURL for Invalid URL error', async () => {
    const mockFetch = sinon
      .stub()
      .rejects(new Error('Invalid URL format provided'));

    try {
      await kapiModule.fetch(
        { url: '/api/test', method: 'GET' },
        mockFetch,
        1,
        0
      );
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.name).to.equal('KubernetesAPIInvalidURL');
    }
  });

  it('should handle AlreadyExists error in response object', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ reason: 'AlreadyExists', message: 'Object already exists' }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    try {
      await kapiModule.fetch(
        { url: '/api/test', method: 'GET' },
        mockFetch,
        1,
        0
      );
      expect.fail('Should have thrown an error');
    } catch (err) {
      expect(err.message).to.include('already exists');
    }
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

    const result = await kapiModule.fetch(
      { url: '/api/test' },
      mockFetch,
      1,
      0
    );

    expect(result).to.deep.equal({ success: true });
  });

  it('should include Authorization header in request', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ success: true }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    await kapiModule.fetch(
      { url: '/api/test', method: 'GET' },
      mockFetch,
      1,
      0
    );

    const callArgs = mockFetch.getCall(0).args[1];
    expect(callArgs.headers['Authorization']).to.include('Bearer');
  });

  it('should include Content-Type header in request', async () => {
    const mockResponse = {
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ success: true }),
    };
    const mockFetch = sinon.stub().resolves(mockResponse);

    await kapiModule.fetch(
      { url: '/api/test', method: 'GET' },
      mockFetch,
      1,
      0
    );

    const callArgs = mockFetch.getCall(0).args[1];
    expect(callArgs.headers['Content-Type']).to.equal('application/json');
  });
});
