import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONFIG from '../../src/config/config.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../src/utils/errors.service.js';
import * as password_service from '../../src/utils/password.service.js';
import { RandomDictionary } from '../../src/objects/RandomDictionary.js';
chai.use(sinonChai);

describe('password.service.generate_label()', () => {
  let fakeDictionary;
  beforeEach(() => {
    fakeDictionary = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good argument and should return a new label.', async () => {
    fakeDictionary.resolves(
      Promise.resolve(
        new RandomDictionary({ words: ['ulfi', 'blacky', 'doug'] })
      )
    );
    const label = await password_service.generate_label(
      {
        count: 3,
      },
      {
        dictionary_list: fakeDictionary,
      }
    );
    chai
      .expect(
        label
          .replaceAll('blacky', '')
          .replaceAll('ulfi', '')
          .replaceAll('doug', '')
      )
      .to.be.equal('--');
    chai.expect(fakeDictionary).to.have.been.called;
  });
  it('called with undefined count and should reject with MissingArgumentError.', async () => {
    try {
      await password_service.generate_label(
        {
          count: undefined,
        },
        {
          dictionary_list: fakeDictionary,
        }
      );
      chai.fail('Chai should get a MissingArgumentError but it did not.');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.be.equal('One or multiple arguments (count) are missing.');
      chai.expect(fakeDictionary).to.not.have.been.called;
    }
  });
  it('called with misformed count and should reject with ParameterMisformed error.', async () => {
    try {
      await password_service.generate_label(
        {
          count: 'mistofmr',
        },
        {
          dictionary_list: fakeDictionary,
        }
      );
      chai.fail('Chai should get a ParameterMisformed but it did not.');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.be.equal('The props.count parameter is misformed.');
      chai.expect(fakeDictionary).to.not.have.been.called;
    }
  });
});
describe('password.service.generate_unique_label()', () => {
  let fakeGenerate, fakeLabelExists;
  beforeEach(() => {
    fakeGenerate = sinon.stub();
    fakeLabelExists = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good argument and should return a new label.', async () => {
    fakeLabelExists.resolves(Promise.resolve(false));
    fakeGenerate.resolves(Promise.resolve('ulfi-blacky-doug'));
    const label = await password_service.generate_unique_label(
      {
        count: 3,
      },
      {
        generate_label: fakeGenerate,
        nameExists: fakeLabelExists,
      }
    );
    chai.expect(label).to.be.equal('ulfi-blacky-doug');
    chai.expect(fakeGenerate).to.have.been.calledOnceWithExactly({ count: 3 });
    chai
      .expect(fakeLabelExists)
      .to.have.been.calledOnceWithExactly({ name: 'ulfi-blacky-doug' });
  });
  it('called with undefined count and should reject with MissingArgumentError.', async () => {
    try {
      await password_service.generate_unique_label(
        {
          count: undefined,
        },
        {
          generate_label: fakeGenerate,
          nameExists: fakeLabelExists,
        }
      );
      chai.fail('Chai should get a MissingArgumentError but it did not.');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.be.equal('One or multiple arguments (count) are missing.');
      chai.expect(fakeGenerate).to.not.have.been.called;
      chai.expect(fakeLabelExists).to.not.have.been.called;
    }
  });
  it('called with misformed count and should reject with ParameterMisformed error.', async () => {
    try {
      await password_service.generate_unique_label(
        {
          count: 'mistofmr',
        },
        {
          generate_label: fakeGenerate,
          nameExists: fakeLabelExists,
        }
      );
      chai.fail('Chai should get a ParameterMisformed but it did not.');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.be.equal('The props.count parameter is misformed.');
      chai.expect(fakeGenerate).to.not.have.been.called;
      chai.expect(fakeLabelExists).to.not.have.been.called;
    }
  });
});
describe('password.service.generate_unique_hash()', () => {
  let fakeHashExists;
  const regex = /^[a-zA-Z0-9]{6}$/;
  beforeEach(() => {
    fakeHashExists = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should return a unique hash.', async () => {
    fakeHashExists.resolves(Promise.resolve(false));
    const hash = await password_service.generate_unique_hash({
      hashExists: fakeHashExists,
    });
    chai.expect(regex.test(hash)).to.be.true;
  });
});
