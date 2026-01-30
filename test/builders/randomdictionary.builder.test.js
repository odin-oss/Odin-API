import * as random_dictionary_builder from '../../src/builders/randomdictionary.builder.js';
import Sequelize from 'sequelize';
import { DBConnexionRefused } from '../../src/utils/errors.service.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { RandomDictionary } from '../../src/objects/RandomDictionary.js';
import db from '../../src/config/db.config.js';
chai.use(sinonChai);

describe('randomdictionary.builder.list()', () => {
  let fakeFindAll;
  beforeEach(() => {
    fakeFindAll = sinon.stub(db.caelus.RANDOM_DICTIONARY, 'findAll');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called without arguments and should return a RandomDictionary object with all the words in it.', async () => {
    fakeFindAll.resolves([
      {
        word: 'benoit',
      },
      {
        word: 'peheux',
      },
      {
        word: 'louis',
      },
      {
        word: 'daphne',
      },
    ]);
    const result = await random_dictionary_builder.list();
    chai.expect(result).to.be.deep.equal(
      new RandomDictionary({
        words: ['benoit', 'peheux', 'louis', 'daphne'],
      })
    );
    chai.expect(fakeFindAll).to.have.been.calledOnce;
  });
  it('called without arguments on empty DB and should return an empty RandomDictionary object.', async () => {
    fakeFindAll.resolves([]);
    const result = await random_dictionary_builder.list();
    chai.expect(result).to.be.deep.equal(new RandomDictionary());
    chai.expect(fakeFindAll).to.have.been.calledOnce;
  });
  it('called on not connected database and should reject with DBConnexionRefused error.', async () => {
    try {
      fakeFindAll.resolves(
        Promise.reject(
          new Sequelize.ConnectionRefusedError(
            'Error during connexion to the database.'
          )
        )
      );
      await random_dictionary_builder.list();
      chai.expect.fail(
        'chai.expected to throw DBConnexionRefused, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
      chai
        .expect(err.message)
        .to.be.equal('Connexion to the database refused.');
    }
  });
});
