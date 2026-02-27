import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as argument_service from '../../src/services/argument.service.js';

chai.use(sinonChai);

describe('argument.service.list()', () => {
  it('should list all arguments successfully', async () => {
    const mockArguments = [
      { id_argument: 1, label: 'arg1' },
      { id_argument: 2, label: 'arg2' },
    ];
    const mockList = sinon.stub().resolves(mockArguments);

    const result = await argument_service.list({
      argument_list: mockList,
    });

    chai.expect(result).to.deep.equal(mockArguments);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should return empty array when no arguments exist', async () => {
    const mockList = sinon.stub().resolves([]);

    const result = await argument_service.list({
      argument_list: mockList,
    });

    chai.expect(result).to.deep.equal([]);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should propagate error when builder throws', async () => {
    const mockError = new Error('Database error');
    const mockList = sinon.stub().rejects(mockError);

    try {
      await argument_service.list({
        argument_list: mockList,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err.message).to.equal('Database error');
    }
  });
});
