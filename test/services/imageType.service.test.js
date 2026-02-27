import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as imageType_service from '../../src/services/imageType.service.js';

chai.use(sinonChai);

describe('imageType.service.list()', () => {
  it('should list all image types successfully', async () => {
    const mockImageTypes = [
      { id_type: 1, label: 'type1' },
      { id_type: 2, label: 'type2' },
    ];
    const mockList = sinon.stub().resolves(mockImageTypes);

    const result = await imageType_service.list({
      list: mockList,
    });

    chai.expect(result).to.deep.equal(mockImageTypes);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should return empty array when no image types exist', async () => {
    const mockList = sinon.stub().resolves([]);

    const result = await imageType_service.list({
      list: mockList,
    });

    chai.expect(result).to.deep.equal([]);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should propagate error when builder throws', async () => {
    const mockError = new Error('Database error');
    const mockList = sinon.stub().rejects(mockError);

    try {
      await imageType_service.list({
        list: mockList,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err.message).to.equal('Database error');
    }
  });
});
