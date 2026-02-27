import * as chai from 'chai';
import { RandomDictionary } from '../../src/objects/RandomDictionary.js';

describe('RandomDictionary object', () => {
	it('creates with default words', () => {
		const dict = new RandomDictionary();

		chai.expect(dict.words).to.deep.equal([]);
	});

	it('adds words and serializes', () => {
		const dict = new RandomDictionary({ words: ['one'] });
		dict.add('two');

		chai.expect(dict.words).to.deep.equal(['one', 'two']);
		chai.expect(dict.toJSON()).to.deep.equal({ words: ['one', 'two'] });
	});
});
