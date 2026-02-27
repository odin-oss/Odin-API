import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as portType_service from '../../src/services/portType.service.js';

chai.use(sinonChai);

describe('portType.service.list()', () => {
  it('should list all port types successfully', async () => {
    const mockPortTypes = [
      { id_port_type: 1, label: 'TCP' },
      { id_port_type: 2, label: 'UDP' },
    ];
    const mockList = sinon.stub().resolves(mockPortTypes);

    const result = await portType_service.list({
      portType_list: mockList,
    });

    chai.expect(result).to.deep.equal(mockPortTypes);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should return empty array when no port types exist', async () => {
    const mockList = sinon.stub().resolves([]);

    const result = await portType_service.list({
      portType_list: mockList,
    });

    chai.expect(result).to.deep.equal([]);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should propagate error when builder throws', async () => {
    const mockError = new Error('Database error');
    const mockList = sinon.stub().rejects(mockError);

    try {
      await portType_service.list({
        portType_list: mockList,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err.message).to.equal('Database error');
    }
  });
});
