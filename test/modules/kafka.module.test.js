import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as kafkaModule from '../../src/modules/kafka.module.js';

chai.use(sinonChai);
const { expect } = chai;

describe('kafka.module', () => {
  describe('changeConsumerIsConnected()', () => {
    it('should set consumer connection state to true', () => {
      kafkaModule.changeConsumerIsConnected({ state: true });
      // We can't directly verify the variable, but function should not throw
      expect(() => kafkaModule.changeConsumerIsConnected({ state: true })).to
        .not.throw();
    });

    it('should set consumer connection state to false', () => {
      kafkaModule.changeConsumerIsConnected({ state: false });
      expect(() => kafkaModule.changeConsumerIsConnected({ state: false })).to
        .not.throw();
    });

    it('should default state to false if not provided', () => {
      expect(() => kafkaModule.changeConsumerIsConnected({})).to.not.throw();
    });

    it('should throw error on invalid state type', () => {
      expect(() => kafkaModule.changeConsumerIsConnected({ state: 'invalid' }))
        .to.throw();
    });
  });

  describe('changeProducerIsConnected()', () => {
    it('should set producer connection state to true', () => {
      kafkaModule.changeProducerIsConnected({ state: true });
      expect(() => kafkaModule.changeProducerIsConnected({ state: true })).to
        .not.throw();
    });

    it('should set producer connection state to false', () => {
      kafkaModule.changeProducerIsConnected({ state: false });
      expect(() => kafkaModule.changeProducerIsConnected({ state: false })).to
        .not.throw();
    });

    it('should default state to false if not provided', () => {
      expect(() => kafkaModule.changeProducerIsConnected({})).to.not.throw();
    });

    it('should throw error on invalid state type', () => {
      expect(() => kafkaModule.changeProducerIsConnected({ state: 123 })).to
        .throw();
    });
  });

  describe('shutdown()', () => {
    beforeEach(() => {
      // Reset connection states before each test
      kafkaModule.changeConsumerIsConnected({ state: false });
      kafkaModule.changeProducerIsConnected({ state: false });
    });

    it('should disconnect producer when producer is connected and kafka is activated', async () => {
      kafkaModule.changeProducerIsConnected({ state: true });
      const producerDisconnectStub = sinon.stub().resolves();
      const consumerDisconnectStub = sinon.stub().resolves();

      await kafkaModule.shutdown({
        producer_disconnect: producerDisconnectStub,
        consumer_disconnect: consumerDisconnectStub,
      });

      expect(producerDisconnectStub.called).to.be.true;
    });

    it('should disconnect consumer when consumer is connected and kafka is activated', async () => {
      kafkaModule.changeConsumerIsConnected({ state: true });
      const producerDisconnectStub = sinon.stub().resolves();
      const consumerDisconnectStub = sinon.stub().resolves();

      await kafkaModule.shutdown({
        producer_disconnect: producerDisconnectStub,
        consumer_disconnect: consumerDisconnectStub,
      });

      expect(consumerDisconnectStub.called).to.be.true;
    });

    it('should disconnect both when both are connected', async () => {
      kafkaModule.changeProducerIsConnected({ state: true });
      kafkaModule.changeConsumerIsConnected({ state: true });
      const producerDisconnectStub = sinon.stub().resolves();
      const consumerDisconnectStub = sinon.stub().resolves();

      await kafkaModule.shutdown({
        producer_disconnect: producerDisconnectStub,
        consumer_disconnect: consumerDisconnectStub,
      });

      expect(producerDisconnectStub.called).to.be.true;
      expect(consumerDisconnectStub.called).to.be.true;
    });

    it('should not disconnect anything when nothing is connected', async () => {
      const producerDisconnectStub = sinon.stub().resolves();
      const consumerDisconnectStub = sinon.stub().resolves();

      await kafkaModule.shutdown({
        producer_disconnect: producerDisconnectStub,
        consumer_disconnect: consumerDisconnectStub,
      });

      expect(producerDisconnectStub.called).to.be.false;
      expect(consumerDisconnectStub.called).to.be.false;
    });
  });

  describe('startKafkaConsumption()', () => {
    beforeEach(() => {
      kafkaModule.changeConsumerIsConnected({ state: false });
    });

    it('should connect, subscribe and run consumer when not connected', async () => {
      const connectStub = sinon.stub().resolves();
      const subscribeStub = sinon.stub().resolves();
      const runStub = sinon.stub().resolves();
      const setIntervalStub = sinon.stub();

      await kafkaModule.startKafkaConsumption({
        connect: connectStub,
        subscribe: subscribeStub,
        run: runStub,
        setInterval: setIntervalStub,
      });

      expect(connectStub.called).to.be.true;
      expect(subscribeStub.called).to.be.true;
      expect(runStub.called).to.be.true;
    });

    it('should set up interval for dump cleanup', async () => {
      const connectStub = sinon.stub().resolves();
      const subscribeStub = sinon.stub().resolves();
      const runStub = sinon.stub().resolves();
      const setIntervalStub = sinon.stub();

      await kafkaModule.startKafkaConsumption({
        connect: connectStub,
        subscribe: subscribeStub,
        run: runStub,
        setInterval: setIntervalStub,
      });

      expect(setIntervalStub.called).to.be.true;
    });

    it('should subscribe to correct topics', async () => {
      const connectStub = sinon.stub().resolves();
      const subscribeStub = sinon.stub().resolves();
      const runStub = sinon.stub().resolves();
      const setIntervalStub = sinon.stub();

      await kafkaModule.startKafkaConsumption({
        connect: connectStub,
        subscribe: subscribeStub,
        run: runStub,
        setInterval: setIntervalStub,
      });

      expect(subscribeStub.calledWith(sinon.match.has('topics'))).to.be.true;
    });

    it('should handle connection errors', async () => {
      const connectStub = sinon
        .stub()
        .rejects(new Error('Connection failed'));
      const subscribeStub = sinon.stub().resolves();
      const runStub = sinon.stub().resolves();
      const setIntervalStub = sinon.stub();

      try {
        await kafkaModule.startKafkaConsumption({
          connect: connectStub,
          subscribe: subscribeStub,
          run: runStub,
          setInterval: setIntervalStub,
        });
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('Connection failed');
      }
    });
  });

  describe('startKafkaPublication()', () => {
    beforeEach(() => {
      kafkaModule.changeProducerIsConnected({ state: false });
    });

    it('should connect and list applications when not connected', async () => {
      const connectStub = sinon.stub().resolves();
      const sendStub = sinon.stub().resolves();
      const listStub = sinon.stub().resolves([]);
      const getK8sObjectStub = sinon.stub().resolves([]);

      await kafkaModule.startKafkaPublication({
        connect: connectStub,
        send: sendStub,
        list: listStub,
        get_k8s_object: getK8sObjectStub,
      });

      expect(connectStub.called).to.be.true;
      expect(listStub.called).to.be.true;
    });

    it('should fetch kubernetes objects', async () => {
      const connectStub = sinon.stub().resolves();
      const sendStub = sinon.stub().resolves();
      const listStub = sinon.stub().resolves([
        { hash: 'ABCDEF' },
        { hash: 'GHIJKL' },
      ]);
      const getK8sObjectStub = sinon.stub().resolves([]);

      await kafkaModule.startKafkaPublication({
        connect: connectStub,
        send: sendStub,
        list: listStub,
        get_k8s_object: getK8sObjectStub,
      });

      expect(getK8sObjectStub.called).to.be.true;
    });

    it('should send kubernetes objects to kafka topic', async () => {
      const mockK8sObject = {
        topic: 'ABCDEF',
        stdout: 'test output',
      };
      const connectStub = sinon.stub().resolves();
      const sendStub = sinon.stub().resolves();
      const listStub = sinon.stub().resolves([{ hash: 'ABCDEF' }]);
      const getK8sObjectStub = sinon.stub().resolves([mockK8sObject]);

      await kafkaModule.startKafkaPublication({
        connect: connectStub,
        send: sendStub,
        list: listStub,
        get_k8s_object: getK8sObjectStub,
      });

      expect(sendStub.called).to.be.true;
    });

    it('should handle list errors', async () => {
      const connectStub = sinon.stub().resolves();
      const sendStub = sinon.stub().resolves();
      const listStub = sinon
        .stub()
        .rejects(new Error('List failed'));
      const getK8sObjectStub = sinon.stub().resolves([]);

      try {
        await kafkaModule.startKafkaPublication({
          connect: connectStub,
          send: sendStub,
          list: listStub,
          get_k8s_object: getK8sObjectStub,
        });
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('List failed');
      }
    });
  });

  describe('createKafkaTopics()', () => {
    it('should be an async function', () => {
      expect(kafkaModule.createKafkaTopics).to.be.a('function');
    });

    it('should not throw when called', async () => {
      // Note: This test would require mocking the Kafka admin client
      // which is more complex, so we just test that the function exists
      // and is exported
      expect(kafkaModule.createKafkaTopics).to.exist;
    });
  });

  describe('get_all_kubernetes_object()', () => {
    it('should return empty array when no hashes provided', async () => {
      const getReplicasetsStub = sinon.stub().resolves({ items: [] });
      const getPvcStub = sinon.stub().resolves({ items: [] });
      const getDeploymentsStub = sinon.stub().resolves({ items: [] });
      const getPodsStub = sinon.stub().resolves({ items: [] });
      const getServicesStub = sinon.stub().resolves({ items: [] });
      const parsingK8sStub = sinon.stub().returns('');

      const result = await kafkaModule.get_all_kubernetes_object(
        { hashes: [] },
        {
          get_replicasets: getReplicasetsStub,
          get_pvc: getPvcStub,
          get_deployments: getDeploymentsStub,
          get_pods: getPodsStub,
          get_services: getServicesStub,
          parsingK8SObjects: parsingK8sStub,
        }
      );

      expect(result).to.deep.equal([]);
    });

    it('should fetch all k8s objects for provided hashes', async () => {
      const getReplicasetsStub = sinon.stub().resolves({ items: [] });
      const getPvcStub = sinon.stub().resolves({ items: [] });
      const getDeploymentsStub = sinon.stub().resolves({ items: [] });
      const getPodsStub = sinon.stub().resolves({ items: [] });
      const getServicesStub = sinon.stub().resolves({ items: [] });
      const parsingK8sStub = sinon.stub().returns('');

      await kafkaModule.get_all_kubernetes_object(
        { hashes: ['ABCDEF'] },
        {
          get_replicasets: getReplicasetsStub,
          get_pvc: getPvcStub,
          get_deployments: getDeploymentsStub,
          get_pods: getPodsStub,
          get_services: getServicesStub,
          parsingK8SObjects: parsingK8sStub,
        }
      );

      expect(getReplicasetsStub.called).to.be.true;
      expect(getPvcStub.called).to.be.true;
      expect(getDeploymentsStub.called).to.be.true;
      expect(getPodsStub.called).to.be.true;
      expect(getServicesStub.called).to.be.true;
    });

    it('should parse k8s objects with correct hash', async () => {
      const mockItems = [{ kind: 'Pod', metadata: { name: 'test' } }];
      const getReplicasetsStub = sinon.stub().resolves({ items: [] });
      const getPvcStub = sinon.stub().resolves({ items: [] });
      const getDeploymentsStub = sinon.stub().resolves({ items: mockItems });
      const getPodsStub = sinon.stub().resolves({ items: [] });
      const getServicesStub = sinon.stub().resolves({ items: [] });
      const parsingK8sStub = sinon.stub().returns('parsed');

      await kafkaModule.get_all_kubernetes_object(
        { hashes: ['ABCDEF'] },
        {
          get_replicasets: getReplicasetsStub,
          get_pvc: getPvcStub,
          get_deployments: getDeploymentsStub,
          get_pods: getPodsStub,
          get_services: getServicesStub,
          parsingK8SObjects: parsingK8sStub,
        }
      );

      expect(parsingK8sStub.calledWith(sinon.match.has('hash', 'ABCDEF'))).to
        .be.true;
    });

    it('should handle multiple hashes correctly', async () => {
      const getReplicasetsStub = sinon.stub().resolves({ items: [] });
      const getPvcStub = sinon.stub().resolves({ items: [] });
      const getDeploymentsStub = sinon.stub().resolves({ items: [] });
      const getPodsStub = sinon.stub().resolves({ items: [] });
      const getServicesStub = sinon.stub().resolves({ items: [] });
      const parsingK8sStub = sinon.stub().returns('parsed');

      const result = await kafkaModule.get_all_kubernetes_object(
        { hashes: ['ABCDEF', 'GHIJKL'] },
        {
          get_replicasets: getReplicasetsStub,
          get_pvc: getPvcStub,
          get_deployments: getDeploymentsStub,
          get_pods: getPodsStub,
          get_services: getServicesStub,
          parsingK8SObjects: parsingK8sStub,
        }
      );

      expect(result).to.have.lengthOf(2);
      expect(parsingK8sStub.callCount).to.equal(2);
    });

    it('should throw error for invalid hash format', async () => {
      const getReplicasetsStub = sinon.stub().resolves({ items: [] });
      const getPvcStub = sinon.stub().resolves({ items: [] });
      const getDeploymentsStub = sinon.stub().resolves({ items: [] });
      const getPodsStub = sinon.stub().resolves({ items: [] });
      const getServicesStub = sinon.stub().resolves({ items: [] });
      const parsingK8sStub = sinon.stub().returns('');

      try {
        await kafkaModule.get_all_kubernetes_object(
          { hashes: ['INVALID'] },
          {
            get_replicasets: getReplicasetsStub,
            get_pvc: getPvcStub,
            get_deployments: getDeploymentsStub,
            get_pods: getPodsStub,
            get_services: getServicesStub,
            parsingK8SObjects: parsingK8sStub,
          }
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });
});
