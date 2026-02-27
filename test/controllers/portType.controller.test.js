import * as portType_controller from '../../src/controllers/portType.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.util.js';
import { DBConnexionRefused } from '../../src/utils/errors.util.js';
import PortType from '../../src/objects/Port_type.js';

chai.use(sinonChai);

describe('portType_controller.list()', () => {
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
      originalUrl: '/portType/list',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called and should return list of port types.', async () => {
    const mockPortTypes = [
      new PortType({
        id_port_type: 1,
        label: 'HTTP',
      }),
      new PortType({
        id_port_type: 2,
        label: 'HTTPS',
      }),
      new PortType({
        id_port_type: 3,
        label: 'TCP',
      }),
    ];

    fakeList.resolves(Promise.resolve(mockPortTypes));

    await portType_controller.list(fakeReq, fakeRes, {
      list: fakeList,
    });

    chai.expect(fakeList).to.have.been.calledOnceWithExactly();
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai
      .expect(jsonCall.message)
      .to.equal('List of port Type type transmitted.');
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeList.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await portType_controller.list(fakeReq, fakeRes, {
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
