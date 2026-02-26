import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import dbManager from '../../src/config/db.config.js';
import * as variableEnvironment_builder from '../../src/builders/variableEnvironment.builder.js';
import VariableEnvironment from '../../src/objects/Variable_environment.js';

chai.use(sinonChai);

describe('variableEnvironment.builder.list()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(
      dbManager.models.VARIABLE_ENVIRONMENT,
      'findAll',
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve all variable environments', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_variable_environment: 1,
          key: 'ENV_VAR_1',
          value: 'value1',
        },
      },
      {
        dataValues: {
          id_variable_environment: 2,
          key: 'ENV_VAR_2',
          value: 'value2',
        },
      },
      {
        dataValues: {
          id_variable_environment: 3,
          key: 'ENV_VAR_3',
          value: 'value3',
        },
      },
    ]);

    const result = await variableEnvironment_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(3);
    chai.expect(result[0]).to.be.instanceOf(VariableEnvironment);
    chai.expect(result[0].id_variable_environment).to.equal(1);
    chai.expect(result[0].key).to.equal('ENV_VAR_1');
    chai.expect(result[0].value).to.equal('value1');
    chai.expect(result[1].id_variable_environment).to.equal(2);
    chai.expect(result[1].key).to.equal('ENV_VAR_2');
    chai.expect(result[1].value).to.equal('value2');
    chai.expect(result[2].id_variable_environment).to.equal(3);
    chai.expect(result[2].key).to.equal('ENV_VAR_3');
    chai.expect(result[2].value).to.equal('value3');
  });

  it('should return an empty array when no variable environments exist', async () => {
    findAllStub.resolves([]);

    const result = await variableEnvironment_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });

  it('should handle database errors gracefully', async () => {
    const dbError = new Error('Database connection failed');
    findAllStub.rejects(dbError);

    try {
      await variableEnvironment_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should create VariableEnvironment objects with optional properties', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_variable_environment: 10,
          key: 'OPTIONAL_KEY',
          value: undefined,
        },
      },
    ]);

    const result = await variableEnvironment_builder.list();

    chai.expect(result).to.have.lengthOf(1);
    chai.expect(result[0]).to.be.instanceOf(VariableEnvironment);
    chai.expect(result[0].id_variable_environment).to.equal(10);
    chai.expect(result[0].key).to.equal('OPTIONAL_KEY');
    chai.expect(result[0].value).to.be.undefined;
  });
});
