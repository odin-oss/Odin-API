import * as chai from 'chai';
import * as sinon from 'sinon';
import * as networkPolicy from '../../../src/objects/kubernetes/network-policy.js';

describe('network-policy.create()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('creates a network policy with expected payload', async () => {
    const fetchResult = { ok: true };
    fetchStub.resolves(fetchResult);

    const result = await networkPolicy.create(
      { hash: 'abcdef' },
      { fetch: fetchStub }
    );

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(fetchStub.args[0][0]).to.deep.equal({
      url: '/apis/networking.k8s.io/v1/namespaces/odin/networkpolicies',
      method: 'POST',
      body: {
        metadata: {
          name: 'kubec-np-odin-kafka-from-nabcdef',
          namespace: 'odin',
        },
        spec: {
          podSelector: {
            matchLabels: {
              app: 'odin-kafka',
            },
          },
          policyTypes: ['Ingress'],
          ingress: [
            {
              from: [
                {
                  namespaceSelector: {
                    matchLabels: {
                      'kubernetes.io/metadata.name': 'nabcdef',
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    });
    chai.expect(result).to.deep.equal({
      result: fetchResult,
      type: 'NetworkPolicy',
      name: 'network-policy-abcdef',
    });
  });

  it('throws on invalid hash', async () => {
    try {
      await networkPolicy.create({ hash: 'bad' }, { fetch: fetchStub });
      chai.expect.fail('Expected create to throw for invalid hash');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('network-policy.deletion()', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('deletes the network policy by hash', async () => {
    const fetchResult = { ok: true };
    fetchStub.resolves(fetchResult);

    const result = await networkPolicy.deletion(
      { hash: 'abcdef' },
      { fetch: fetchStub }
    );

    chai.expect(fetchStub.calledOnce).to.be.true;
    chai.expect(fetchStub.args[0][0]).to.deep.equal({
      url: '/apis/networking.k8s.io/v1/namespaces/odin/networkpolicies/kubec-np-odin-kafka-from-nabcdef',
      method: 'DELETE',
    });
    chai.expect(result).to.deep.equal({
      result: fetchResult,
      type: 'NetworkPolicy',
      name: 'network-policy-abcdef',
    });
  });

  it('throws on invalid hash', async () => {
    try {
      await networkPolicy.deletion({ hash: 'nope' }, { fetch: fetchStub });
      chai.expect.fail('Expected deletion to throw for invalid hash');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
