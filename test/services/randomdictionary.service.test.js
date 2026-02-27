import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as randomdictonary_service from '../../src/services/randomdictonary.service.js';
import { RandomDictionary } from '../../src/objects/RandomDictionary.js';

chai.use(sinonChai);

describe('randomdictonary.service.generate_label()', () => {
  it('should generate label with default count (3 words)', () => {
    const mockDictionary = new RandomDictionary();
    mockDictionary.words = ['apple', 'banana', 'cherry', 'dragon', 'elephant'];

    const result = randomdictonary_service.generate_label({
      count: 3,
      dictionary: mockDictionary,
    });

    chai.expect(result).to.be.a('string');
    const parts = result.split('-');
    chai.expect(parts.length).to.equal(3);
    parts.forEach((part) => {
      chai.expect(mockDictionary.words).to.include(part);
    });
  });

  it('should generate label with custom count', () => {
    const mockDictionary = new RandomDictionary();
    mockDictionary.words = ['apple', 'banana', 'cherry'];

    const result = randomdictonary_service.generate_label({
      count: 2,
      dictionary: mockDictionary,
    });

    const parts = result.split('-');
    chai.expect(parts.length).to.equal(2);
  });

  it('should generate label with single word', () => {
    const mockDictionary = new RandomDictionary();
    mockDictionary.words = ['apple', 'banana', 'cherry'];

    const result = randomdictonary_service.generate_label({
      count: 1,
      dictionary: mockDictionary,
    });

    const parts = result.split('-');
    chai.expect(parts.length).to.equal(1);
  });

  it('should throw error when dictionary is not an instance of RandomDictionary', () => {
    try {
      randomdictonary_service.generate_label({
        count: 3,
        dictionary: { words: ['apple', 'banana'] },
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when count is not a number', () => {
    const mockDictionary = new RandomDictionary();
    mockDictionary.words = ['apple', 'banana'];

    try {
      randomdictonary_service.generate_label({
        count: 'three',
        dictionary: mockDictionary,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('randomdictonary.service.generate_unique_label()', () => {
  it('should generate unique label when name does not exist', async () => {
    const mockDictionary = new RandomDictionary();
    mockDictionary.words = ['apple', 'banana', 'cherry'];
    const mockGenerateLabel = sinon.stub().returns('apple-banana-cherry');
    const mockNameExists = sinon.stub().resolves(false);

    const result = await randomdictonary_service.generate_unique_label(
      {
        count: 3,
        dictionary: mockDictionary,
      },
      {
        generate_label: mockGenerateLabel,
        nameExists: mockNameExists,
      }
    );

    chai.expect(result).to.equal('apple-banana-cherry');
    chai.expect(mockNameExists.calledOnce).to.be.true;
  });

  it('should retry generation when name already exists', async () => {
    const mockDictionary = new RandomDictionary();
    mockDictionary.words = ['apple', 'banana', 'cherry'];
    const mockGenerateLabel = sinon
      .stub()
      .onFirstCall()
      .returns('apple-banana-cherry')
      .onSecondCall()
      .returns('apple-banana-dragon');
    const mockNameExists = sinon
      .stub()
      .onFirstCall()
      .resolves(true)
      .onSecondCall()
      .resolves(false);

    const result = await randomdictonary_service.generate_unique_label(
      {
        count: 3,
        dictionary: mockDictionary,
      },
      {
        generate_label: mockGenerateLabel,
        nameExists: mockNameExists,
      }
    );

    chai.expect(result).to.equal('apple-banana-dragon');
    chai.expect(mockGenerateLabel.callCount).to.equal(2);
    chai.expect(mockNameExists.callCount).to.equal(2);
  });

  it('should throw error when dictionary is missing', async () => {
    try {
      await randomdictonary_service.generate_unique_label({
        count: 3,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when dictionary is not an instance of RandomDictionary', async () => {
    try {
      await randomdictonary_service.generate_unique_label({
        count: 3,
        dictionary: { words: ['apple'] },
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('randomdictonary.service.generate_unique_hash()', () => {
  it('should generate unique hash when no hash exists', async () => {
    const mockHashExists = sinon.stub().resolves(false);

    const result = await randomdictonary_service.generate_unique_hash({
      hashExists: mockHashExists,
    });

    chai.expect(result).to.be.a('string');
    chai.expect(result.length).to.equal(6);
    chai.expect(mockHashExists.calledOnce).to.be.true;
  });

  it('should retry generation when hash already exists', async () => {
    const mockHashExists = sinon
      .stub()
      .onFirstCall()
      .resolves(true)
      .onSecondCall()
      .resolves(false);

    const result = await randomdictonary_service.generate_unique_hash({
      hashExists: mockHashExists,
    });

    chai.expect(result).to.be.a('string');
    chai.expect(result.length).to.equal(6);
    chai.expect(mockHashExists.callCount).to.equal(2);
  });

  it('should generate different hashes on each call', async () => {
    const mockHashExists = sinon.stub().resolves(false);

    const result1 = await randomdictonary_service.generate_unique_hash({
      hashExists: mockHashExists,
    });
    const result2 = await randomdictonary_service.generate_unique_hash({
      hashExists: mockHashExists,
    });

    // Hashes should be different (with very high probability)
    chai.expect(result1).to.be.a('string');
    chai.expect(result2).to.be.a('string');
  });

  it('should handle multiple retries', async () => {
    const mockHashExists = sinon
      .stub()
      .onFirstCall()
      .resolves(true)
      .onSecondCall()
      .resolves(true)
      .onThirdCall()
      .resolves(true)
      .onCall(3)
      .resolves(false);

    const result = await randomdictonary_service.generate_unique_hash({
      hashExists: mockHashExists,
    });

    chai.expect(result).to.be.a('string');
    chai.expect(result.length).to.equal(6);
    chai.expect(mockHashExists.callCount).to.equal(4);
  });
});
