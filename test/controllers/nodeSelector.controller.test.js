import * as nodeSelector_controller from '../../src/controllers/nodeSelector.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.util.js';
import { DBConnexionRefused } from '../../src/utils/errors.util.js';
import NodeSelector from '../../src/objects/NodeSelector.js';

chai.use(sinonChai);

describe('nodeSelector_controller.list()', () => {
  let fakeList, fakeReq, fakeRes;

  beforeEach(() => {
    fakeList = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {},
      method: 'GET',
      originalUrl: '/nodeSelector/list',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called and should return list of node selectors.', async () => {
    const mockNodeSelectors = [
      new NodeSelector({
        id_node_selector: 1,
        key: 'kubernetes.io/hostname',
        value: 'node-1',
      }),
      new NodeSelector({
        id_node_selector: 2,
        key: 'node.kubernetes.io/instance-type',
        value: 'gpu-instance',
      }),
    ];

    fakeList.resolves(Promise.resolve(mockNodeSelectors));

    await nodeSelector_controller.list(fakeReq, fakeRes, {
      list: fakeList,
    });

    chai.expect(fakeList).to.have.been.calledOnceWithExactly();
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai
      .expect(jsonCall.message)
      .to.equal('List of nodes selectors transmitted.');
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeList.rejects(
      new DBConnexionRefused('Connexion to the database refused.'),
    );

    await nodeSelector_controller.list(fakeReq, fakeRes, {
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
});
