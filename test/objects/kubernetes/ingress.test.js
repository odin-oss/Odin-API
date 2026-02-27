import * as chai from 'chai';
import * as sinon from 'sinon';
import * as ingress from '../../../src/objects/kubernetes/ingress.js';
import Port from '../../../src/objects/Port.js';
import PortType from '../../../src/objects/Port_type.js';

describe('ingress.addInKong()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('creates services, routes, and plugins for each port', async () => {
    fetchStub.callsFake(async ({ method, url }) => {
      if (method === 'GET' && url.startsWith('/services/')) {
        return { id: `svc-${url.split('/').pop()}` };
      }
      return { ok: true };
    });

    const ports = [
      new Port({
        port: 8080,
        label: 'HTTP',
        port_type: new PortType({ label: 'strip_path' }),
      }),
      new Port({
        port: 2222,
        label: 'SSH',
        port_type: new PortType({ label: 'passthrough' }),
      }),
    ];

    await ingress.addInKong(
      { hash: 'abcdef', ports, label: 'app' },
      { fetch: fetchStub }
    );

    chai.expect(fetchStub.callCount).to.equal(8);
    sinon.assert.calledWithMatch(fetchStub, {
      method: 'POST',
      url: '/services',
      body: {
        name: 'abcdef-app-http',
      },
    });
    sinon.assert.calledWithMatch(fetchStub, {
      method: 'GET',
      url: '/services/abcdef-app-ssh',
    });
    sinon.assert.calledWithMatch(fetchStub, {
      method: 'POST',
      url: sinon.match(/\/services\/svc-.*\/plugins/),
      body: {
        name: 'odin-auth',
      },
    });
    sinon.assert.calledWithMatch(fetchStub, {
      method: 'POST',
      url: sinon.match(/\/services\/svc-.*\/routes/),
      body: {
        preserve_host: true,
      },
    });
  });

  it('throws on invalid hash', async () => {
    try {
      await ingress.addInKong(
        { hash: 'bad', ports: [], label: 'app' },
        { fetch: fetchStub }
      );
      chai.expect.fail('Expected addInKong to throw for invalid hash');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('ingress.deleteFromKong()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('deletes routes and services matching the hash', async () => {
    fetchStub.callsFake(async ({ method, url }) => {
      if (method === 'GET' && url === '/services') {
        return {
          data: [
            { id: 'svc1', host: 'ciappabcdef8080-proxy' },
            { id: 'svc2', host: 'ciappxxxx8080-proxy' },
          ],
        };
      }
      if (method === 'GET' && url === '/routes') {
        return {
          data: [
            { id: 'route1', paths: ['/abcdef/app-http/'] },
            { id: 'route2', paths: ['/xxxx/app-http/'] },
          ],
        };
      }
      return { ok: true };
    });

    await ingress.deleteFromKong({ hash: 'abcdef' }, { fetch: fetchStub });

    chai.expect(fetchStub.callCount).to.equal(4);
    sinon.assert.calledWithMatch(fetchStub, {
      method: 'DELETE',
      url: '/routes/route1',
    });
    sinon.assert.calledWithMatch(fetchStub, {
      method: 'DELETE',
      url: '/services/svc1',
    });
  });

  it('throws on invalid hash', async () => {
    try {
      await ingress.deleteFromKong({ hash: 'nope' }, { fetch: fetchStub });
      chai.expect.fail('Expected deleteFromKong to throw for invalid hash');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
