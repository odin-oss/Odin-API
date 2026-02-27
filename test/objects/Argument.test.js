import * as chai from 'chai';
import Argument from '../../src/objects/Argument.js';

describe('Argument object', () => {
  it('creates with valid properties', () => {
    const argument = new Argument({
      id_argument: 1,
      value: '--verbose',
    });

    chai.expect(argument.id_argument).to.equal(1);
    chai.expect(argument.value).to.equal('--verbose');
  });

  it('creates without id_argument', () => {
    const argument = new Argument({
      value: '--debug',
    });

    chai.expect(argument.id_argument).to.be.undefined;
    chai.expect(argument.value).to.equal('--debug');
  });

  it('coerces id_argument to number', () => {
    const argument = new Argument({
      id_argument: '42',
      value: 'test',
    });

    chai.expect(argument.id_argument).to.equal(42);
    chai.expect(typeof argument.id_argument).to.equal('number');
  });

  it('throws on non-positive id_argument', () => {
    chai
      .expect(() => {
        new Argument({ id_argument: -1 });
      })
      .to.throw();
  });

  it('serializes with toJSON', () => {
    const argument = new Argument({
      id_argument: 5,
      value: '--config=prod',
    });

    const json = argument.toJSON();
    chai.expect(json.id_argument).to.equal(5);
    chai.expect(json.value).to.equal('--config=prod');
  });
});
