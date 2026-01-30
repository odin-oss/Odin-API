import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { RandomDictionary } from '../../src/objects/RandomDictionary.js';
chai.use(sinonChai);

describe('<object> RandomDictionary', () => {
  it('creates, updates and checks value of Interface object.', () => {
    const dico = new RandomDictionary({
      words: ['un', 'deux'],
    });
    dico.add('trois');
    chai.expect(dico.words).to.deep.equal(['un', 'deux', 'trois']);
    dico.words = ['un'];
    chai.expect(dico.words).to.deep.equal(['un']);
    chai.expect(dico.toJSON()).to.deep.equal({
      words: ['un'],
    });
  });
});
