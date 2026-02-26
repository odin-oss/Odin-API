import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import dbManager from '../../src/config/db.config.js';
import * as argument_builder from '../../src/builders/argument.builder.js';
import Argument from '../../src/objects/Argument.js';

chai.use(sinonChai);

describe('argument.builder.list()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.ARGUMENT, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return all arguments from database.', async () => {
    findAllStub.resolves([
      {
        id_argument: 1,
        value: 'arg1',
      },
      {
        id_argument: 2,
        value: 'arg2',
      },
    ]);

    const result = await argument_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(2);
    chai.expect(result[0]).to.be.instanceOf(Argument);
    chai.expect(result[1]).to.be.instanceOf(Argument);
  });

  it('should return empty array when no arguments exist.', async () => {
    findAllStub.resolves([]);

    const result = await argument_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });

  it('should transform database objects to Argument instances.', async () => {
    findAllStub.resolves([
      {
        id_argument: 1,
        value: 'test-arg',
      },
    ]);

    const result = await argument_builder.list();

    chai.expect(result[0]).to.be.instanceOf(Argument);
    chai.expect(result[0].id_argument).to.equal(1);
    chai.expect(result[0].value).to.equal('test-arg');
  });

  it('should handle database error.', async () => {
    findAllStub.rejects(new Error('Database connection failed'));

    try {
      await argument_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should return arguments with correct properties.', async () => {
    findAllStub.resolves([
      {
        id_argument: 5,
        value: 'output-format',
      },
    ]);

    const result = await argument_builder.list();

    chai.expect(result).to.have.lengthOf(1);
    chai.expect(result[0]).to.include({
      id_argument: 5,
      value: 'output-format',
    });
  });

  it('should preserve all argument properties when mapping.', async () => {
    const testData = [
      {
        id_argument: 10,
        value: 'verbose',
      },
    ];
    findAllStub.resolves(testData);

    const result = await argument_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result[0]).to.be.instanceOf(Argument);
  });

  it('should handle large dataset of arguments.', async () => {
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      id_argument: i + 1,
      value: `arg-${i + 1}`,
    }));
    findAllStub.resolves(largeDataset);

    const result = await argument_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.have.lengthOf(100);
    chai.expect(result[0]).to.be.instanceOf(Argument);
    chai.expect(result[99]).to.be.instanceOf(Argument);
  });

  it('called multiple times should call findAll each time.', async () => {
    findAllStub.resolves([]);

    await argument_builder.list();
    await argument_builder.list();
    await argument_builder.list();

    chai.expect(findAllStub.callCount).to.equal(3);
  });
});
