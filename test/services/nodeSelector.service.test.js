import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as nodeSelector_service from '../../src/services/nodeSelector.service.js';

chai.use(sinonChai);

describe('nodeSelector.service.list()', () => {
  it('should list all node selectors successfully', async () => {
    const mockNodeSelectors = [
      { id_node_selector: 1, label: 'selector1' },
      { id_node_selector: 2, label: 'selector2' },
    ];
    const mockList = sinon.stub().resolves(mockNodeSelectors);

    const result = await nodeSelector_service.list({
      list: mockList,
    });

    chai.expect(result).to.deep.equal(mockNodeSelectors);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should return empty array when no node selectors exist', async () => {
    const mockList = sinon.stub().resolves([]);

    const result = await nodeSelector_service.list({
      list: mockList,
    });

    chai.expect(result).to.deep.equal([]);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should propagate error when builder throws', async () => {
    const mockError = new Error('Database error');
    const mockList = sinon.stub().rejects(mockError);

    try {
      await nodeSelector_service.list({
        list: mockList,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err.message).to.equal('Database error');
    }
  });
});
