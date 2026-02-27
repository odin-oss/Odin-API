import * as argument_controller from '../../src/controllers/argument.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { DBConnexionRefused } from '../../src/utils/errors.util.js';
import * as token_service from '../../src/utils/token.util.js';
import Argument from '../../src/objects/Argument.js';

chai.use(sinonChai);

describe('argument_controller.list()', () => {
  let fakeList, fakeReq, fakeRes;

  beforeEach(() => {
    fakeList = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      method: 'GET',
      originalUrl: '/argument/list',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should return list of arguments.', async () => {
    const mockArguments = [
      new Argument({
        id_argument: 1,
        value: '--version',
      }),
      new Argument({
        id_argument: 2,
        value: '--port=8080',
      }),
      new Argument({
        id_argument: 3,
        value: '--debug',
      }),
    ];

    fakeList.resolves(Promise.resolve(mockArguments));

    await argument_controller.list(fakeReq, fakeRes, {
      list: fakeList,
    });

    chai.expect(fakeList).to.have.been.calledOnceWithExactly();
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;

    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('List of arguments transmitted');
    chai.expect(jsonCall.data).to.be.an('array');
    chai.expect(jsonCall.data).to.have.lengthOf(3);
    chai.expect(jsonCall.data[0]).to.deep.equal({
      id_argument: 1,
      value: '--version',
    });
    chai.expect(jsonCall.data[1]).to.deep.equal({
      id_argument: 2,
      value: '--port=8080',
    });
    chai.expect(jsonCall.data[2]).to.deep.equal({
      id_argument: 3,
      value: '--debug',
    });
  });

  it('called and should return empty list when no arguments exist.', async () => {
    fakeList.resolves(Promise.resolve([]));

    await argument_controller.list(fakeReq, fakeRes, {
      list: fakeList,
    });

    chai.expect(fakeList).to.have.been.calledOnceWithExactly();
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;

    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('List of arguments transmitted');
    chai.expect(jsonCall.data).to.be.an('array');
    chai.expect(jsonCall.data).to.have.lengthOf(0);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeList.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await argument_controller.list(fakeReq, fakeRes, {
      list: fakeList,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('Connexion to the database refused.');
    chai.expect(jsonCall.error.type).to.equal('DBConnexionRefused');
  });

  it('called but should handle generic errors.', async () => {
    const genericError = new Error('Something went wrong');
    fakeList.rejects(genericError);

    await argument_controller.list(fakeReq, fakeRes, {
      list: fakeList,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnce;
    chai.expect(fakeRes.json).to.have.been.calledOnce;

    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });
});
