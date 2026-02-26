import * as chai from 'chai';
import * as sinon from 'sinon';
import dbManager from '../../src/config/db.config.js';
import * as nodeSelector_builder from '../../src/builders/nodeSelector.builder.js';
import NodeSelector from '../../src/objects/NodeSelector.js';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('nodeSelector.builder.list()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.NODE_SELECTOR, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve all node selectors', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_node_selector: 1,
          key: 'gpu',
          value: 'true',
        },
      },
      {
        dataValues: {
          id_node_selector: 2,
          key: 'disk-type',
          value: 'ssd',
        },
      },
    ]);

    const result = await nodeSelector_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(2);
    chai.expect(result[0]).to.be.instanceOf(NodeSelector);
    chai.expect(result[1]).to.be.instanceOf(NodeSelector);
  });

  it('should map database results to NodeSelector instances', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_node_selector: 1,
          key: 'gpu',
          value: 'true',
        },
      },
    ]);

    const result = await nodeSelector_builder.list();

    chai.expect(result[0].id_node_selector).to.equal(1);
    chai.expect(result[0].key).to.equal('gpu');
    chai.expect(result[0].value).to.equal('true');
  });

  it('should return empty array when no node selectors exist', async () => {
    findAllStub.resolves([]);

    const result = await nodeSelector_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });

  it('should handle database errors during list retrieval', async () => {
    findAllStub.rejects(new Error('Database connection failed'));

    try {
      await nodeSelector_builder.list();
      chai.expect.fail('Expected an error to be thrown');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle multiple node selectors with various property values', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_node_selector: 1,
          key: 'gpu',
          value: 'nvidia',
        },
      },
      {
        dataValues: {
          id_node_selector: 2,
          key: 'disk-type',
          value: 'nvme',
        },
      },
      {
        dataValues: {
          id_node_selector: 3,
          key: 'cpu-type',
          value: 'amd64',
        },
      },
    ]);

    const result = await nodeSelector_builder.list();

    chai.expect(result).to.have.lengthOf(3);
    chai.expect(result[0].key).to.equal('gpu');
    chai.expect(result[1].key).to.equal('disk-type');
    chai.expect(result[2].key).to.equal('cpu-type');
    chai.expect(result[0].value).to.equal('nvidia');
    chai.expect(result[1].value).to.equal('nvme');
    chai.expect(result[2].value).to.equal('amd64');
  });

  it('should handle node selectors with undefined properties', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_node_selector: 1,
        },
      },
    ]);

    const result = await nodeSelector_builder.list();

    chai.expect(result).to.have.lengthOf(1);
    chai.expect(result[0]).to.be.instanceOf(NodeSelector);
  });
});
