import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as randomdictionary_builder from '../../src/builders/randomdictionary.builder.js';
import { RandomDictionary } from '../../src/objects/RandomDictionary.js';
import dbManager from '../../src/config/db.config.js';

chai.use(sinonChai);

describe('randomdictionary.builder.list()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.RANDOM_DICTIONARY, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve all dictionary words and return RandomDictionary object', async () => {
    findAllStub.resolves([
      { word: 'apple' },
      { word: 'banana' },
      { word: 'cherry' },
    ]);

    const result = await randomdictionary_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(RandomDictionary);
    chai.expect(result.words).to.be.an('array');
    chai.expect(result.words).to.have.lengthOf(3);
    chai.expect(result.words).to.deep.equal(['apple', 'banana', 'cherry']);
  });

  it('should return empty RandomDictionary when no words exist', async () => {
    findAllStub.resolves([]);

    const result = await randomdictionary_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(RandomDictionary);
    chai.expect(result.words).to.be.an('array');
    chai.expect(result.words).to.have.lengthOf(0);
  });

  it('should properly add each word to the RandomDictionary', async () => {
    findAllStub.resolves([
      { word: 'dog' },
      { word: 'cat' },
      { word: 'bird' },
      { word: 'fish' },
    ]);

    const result = await randomdictionary_builder.list();

    chai.expect(result.words).to.have.lengthOf(4);
    chai.expect(result.words[0]).to.equal('dog');
    chai.expect(result.words[1]).to.equal('cat');
    chai.expect(result.words[2]).to.equal('bird');
    chai.expect(result.words[3]).to.equal('fish');
  });

  it('should handle database errors during retrieval', async () => {
    findAllStub.rejects(new Error('Database connection failed'));

    try {
      await randomdictionary_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database timeout errors', async () => {
    findAllStub.rejects(new Error('Query timeout'));

    try {
      await randomdictionary_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err.message).to.include('Query timeout');
    }
  });

  it('should correctly serialize RandomDictionary to JSON', async () => {
    findAllStub.resolves([{ word: 'hello' }, { word: 'world' }]);

    const result = await randomdictionary_builder.list();
    const json = result.toJSON();

    chai.expect(json).to.be.an('object');
    chai.expect(json.words).to.be.an('array');
    chai.expect(json.words).to.deep.equal(['hello', 'world']);
  });

  it('should handle large dictionary lists', async () => {
    const largeWordList = Array.from({ length: 1000 }, (_, i) => ({
      word: `word${i}`,
    }));
    findAllStub.resolves(largeWordList);

    const result = await randomdictionary_builder.list();

    chai.expect(result.words).to.have.lengthOf(1000);
    chai.expect(result.words[0]).to.equal('word0');
    chai.expect(result.words[999]).to.equal('word999');
  });

  it('should preserve word order from database', async () => {
    findAllStub.resolves([
      { word: 'zebra' },
      { word: 'apple' },
      { word: 'mango' },
      { word: 'banana' },
    ]);

    const result = await randomdictionary_builder.list();

    chai
      .expect(result.words)
      .to.deep.equal(['zebra', 'apple', 'mango', 'banana']);
  });

  it('should handle words with special characters', async () => {
    findAllStub.resolves([
      { word: 'café' },
      { word: "don't" },
      { word: 'naïve' },
    ]);

    const result = await randomdictionary_builder.list();

    chai.expect(result.words).to.have.lengthOf(3);
    chai.expect(result.words[0]).to.equal('café');
    chai.expect(result.words[1]).to.equal("don't");
    chai.expect(result.words[2]).to.equal('naïve');
  });

  it('should handle empty string words', async () => {
    findAllStub.resolves([{ word: '' }, { word: 'valid' }]);

    const result = await randomdictionary_builder.list();

    chai.expect(result.words).to.have.lengthOf(2);
    chai.expect(result.words[0]).to.equal('');
    chai.expect(result.words[1]).to.equal('valid');
  });
});
