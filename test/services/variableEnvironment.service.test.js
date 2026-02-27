import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as variableEnvironment_service from '../../src/services/variableEnvironment.service.js';

chai.use(sinonChai);

describe('variableEnvironment.service.list()', () => {
  it('should list all variable environments successfully', async () => {
    const mockVariables = [
      { id_var_env: 1, key: 'VAR1', value: 'value1' },
      { id_var_env: 2, key: 'VAR2', value: 'value2' },
    ];
    const mockList = sinon.stub().resolves(mockVariables);

    const result = await variableEnvironment_service.list({
      list: mockList,
    });

    chai.expect(result).to.deep.equal(mockVariables);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should return empty array when no variable environments exist', async () => {
    const mockList = sinon.stub().resolves([]);

    const result = await variableEnvironment_service.list({
      list: mockList,
    });

    chai.expect(result).to.deep.equal([]);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should propagate error when builder throws', async () => {
    const mockError = new Error('Database error');
    const mockList = sinon.stub().rejects(mockError);

    try {
      await variableEnvironment_service.list({ list: mockList });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err.message).to.equal('Database error');
    }
  });

  it('should handle complex variable environment objects', async () => {
    const mockVariables = [
      {
        id_var_env: 1,
        key: 'DATABASE_URL',
        value: 'postgresql://localhost:5432/db',
        description: 'Database connection URL',
        secret: false,
      },
      {
        id_var_env: 2,
        key: 'API_KEY',
        value: '****',
        description: 'API authentication key',
        secret: true,
      },
    ];
    const mockList = sinon.stub().resolves(mockVariables);

    const result = await variableEnvironment_service.list({
      list: mockList,
    });

    chai.expect(result).to.deep.equal(mockVariables);
    chai.expect(result[0]).to.include.all.keys(
      'id_var_env',
      'key',
      'value',
      'description',
      'secret'
    );
  });
});
