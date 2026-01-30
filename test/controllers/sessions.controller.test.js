import * as session_controller from '../../src/controllers/sessions.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { User } from '../../src/objects/User.js';
import { Session } from '../../src/objects/Session.js';
import moment from 'moment-timezone';
import * as token_service from '../../src/utils/token.service.js';
import { Environment } from '../../src/objects/Environment.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
import { Application } from '../../src/objects/Application.js';
import {
  ProfessorIsNotAttributed,
  UserIsNeitherProfOrAdmin,
} from '../../src/utils/errors.service.js';
chai.use(sinonChai);

describe('session_controller.create()', () => {
  let fakeSessionCreate, fakeReq, fakeRes;
  beforeEach(() => {
    fakeSessionCreate = sinon.stub();
    fakeReq = {
      method: 'POST',
      originalUrl: '/session/',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good arguments and should send the new Session informations.', async () => {
    const begin_date = moment.tz('Europe/Paris');
    const end_date = moment.tz('Europe/Paris').add(2, 'hour');
    const expected_session = new Session({
      id_session: 5,
      label: 'Session de travail',
      begin_date: begin_date,
      end_date: end_date,
      environment: new Environment({
        id_environment: 2,
        label: 'Linux Alpine 3.19',
        icon: 'ereteret',
        interfaces: [],
      }),
      applications: [
        new Application({
          id_application: 8,
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          creation_date: begin_date,
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: null,
          id_environment: 2,
          state_application: 'Ready',
          state_changed_date: begin_date,
          programming_shutdown_date: end_date,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [],
          }),
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
        }),
      ],
      users: [
        new User({
          id_user: 2,
          lastname: 'VETU',
          firstname: 'Paul-Emile',
          mail: 'peheux@vetu.fr',
          role: null,
        }),
      ],
      professors: [
        new User({
          id_user: 3,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit@lefebvre.fr',
          role: null,
        }),
      ],
      datacenter: new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      }),
    });
    fakeSessionCreate.resolves(Promise.resolve(expected_session));
    fakeReq.body = {
      label_session: 'Session de travail',
      label_application: 'Application de travail super géniale',
      id_environment: 2,
      id_datacenter: 1,
      begin_date: begin_date.format(),
      end_date: end_date.format(),
      professors: '[2]',
      users: '[3]',
    };
    await session_controller.create(fakeReq, fakeRes, {
      session_create: fakeSessionCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: expected_session.public_format(),
    });
    chai.expect(fakeRes.status.calledOnceWith(200)).to.be.true;
  });
  it('called with misformed id_environment.', async () => {
    const begin_date = moment.tz('Europe/Paris');
    const end_date = moment.tz('Europe/Paris').add(2, 'hour');
    fakeReq.body = {
      label_session: 'Session de travail',
      label_application: 'Application de travail super géniale',
      id_environment: 'misformed',
      id_datacenter: 1,
      begin_date: begin_date.format(),
      end_date: end_date.format(),
      professors: '[2]',
      users: '[3]',
    };
    await session_controller.create(fakeReq, fakeRes, {
      session_create: fakeSessionCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'ParameterMisformed',
        message: 'The req.body.id_environment parameter is misformed.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(400)).to.be.true;
  });
  it('called with misformed id_datacenter.', async () => {
    const begin_date = moment.tz('Europe/Paris');
    const end_date = moment.tz('Europe/Paris').add(2, 'hour');
    fakeReq.body = {
      label_session: 'Session de travail',
      label_application: 'Application de travail super géniale',
      id_environment: 1,
      id_datacenter: 'misformed',
      begin_date: begin_date.format(),
      end_date: end_date.format(),
      professors: '[2]',
      users: '[3]',
    };
    await session_controller.create(fakeReq, fakeRes, {
      session_create: fakeSessionCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'ParameterMisformed',
        message: 'The req.body.id_datacenter parameter is misformed.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(400)).to.be.true;
  });
  it('called with misformed professors.', async () => {
    const begin_date = moment.tz('Europe/Paris');
    const end_date = moment.tz('Europe/Paris').add(2, 'hour');
    fakeReq.body = {
      label_session: 'Session de travail',
      label_application: 'Application de travail super géniale',
      id_environment: 1,
      id_datacenter: 1,
      begin_date: begin_date.format(),
      end_date: end_date.format(),
      professors: 'zef',
      users: '[3]',
    };
    await session_controller.create(fakeReq, fakeRes, {
      session_create: fakeSessionCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'SyntaxError',
        message: 'Unexpected token \'z\', "zef" is not valid JSON',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(400)).to.be.true;
  });
  it('called with misformed professors.', async () => {
    const begin_date = moment.tz('Europe/Paris');
    const end_date = moment.tz('Europe/Paris').add(2, 'hour');
    fakeReq.body = {
      label_session: 'Session de travail',
      label_application: 'Application de travail super géniale',
      id_environment: 1,
      id_datacenter: 1,
      begin_date: begin_date.format(),
      end_date: end_date.format(),
      professors: '["test"]',
      users: '[3]',
    };
    await session_controller.create(fakeReq, fakeRes, {
      session_create: fakeSessionCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'ParameterMisformed',
        message: 'The req.body.professors parameter is misformed.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(400)).to.be.true;
  });
  it('called with misformed users.', async () => {
    const begin_date = moment.tz('Europe/Paris');
    const end_date = moment.tz('Europe/Paris').add(2, 'hour');
    fakeReq.body = {
      label_session: 'Session de travail',
      label_application: 'Application de travail super géniale',
      id_environment: 1,
      id_datacenter: 1,
      begin_date: begin_date.format(),
      end_date: end_date.format(),
      professors: '[2]',
      users: '["test"]',
    };
    await session_controller.create(fakeReq, fakeRes, {
      session_create: fakeSessionCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'ParameterMisformed',
        message: 'The req.body.users parameter is misformed.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(400)).to.be.true;
  });
  it('called with misformed begin_date.', async () => {
    const begin_date = 'unrzgp';
    const end_date = moment.tz('Europe/Paris').add(2, 'hour');
    fakeReq.body = {
      label_session: 'Session de travail',
      label_application: 'Application de travail super géniale',
      id_environment: 1,
      id_datacenter: 1,
      begin_date: begin_date,
      end_date: end_date.format(),
      professors: '[2]',
      users: '[3]',
    };
    await session_controller.create(fakeReq, fakeRes, {
      session_create: fakeSessionCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'ParameterMisformed',
        message: 'The req.body.begin_date parameter is misformed.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(400)).to.be.true;
  });
  it('called with misformed end_date.', async () => {
    const begin_date = moment.tz('Europe/Paris');
    const end_date = 'gerge';
    fakeReq.body = {
      label_session: 'Session de travail',
      label_application: 'Application de travail super géniale',
      id_environment: 1,
      id_datacenter: 1,
      begin_date: begin_date.format(),
      end_date: end_date,
      professors: '[2]',
      users: '[3]',
    };
    await session_controller.create(fakeReq, fakeRes, {
      session_create: fakeSessionCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'ParameterMisformed',
        message: 'The req.body.end_date parameter is misformed.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(400)).to.be.true;
  });
  it('called with misformed label_session.', async () => {
    const begin_date = moment.tz('Europe/Paris');
    const end_date = moment.tz('Europe/Paris');
    fakeReq.body = {
      label_session: 3,
      label_application: 'Application de travail super géniale',
      id_environment: 1,
      id_datacenter: 1,
      begin_date: begin_date.format(),
      end_date: end_date.format(),
      professors: '[2]',
      users: '[3]',
    };
    await session_controller.create(fakeReq, fakeRes, {
      session_create: fakeSessionCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'ParameterMisformed',
        message: 'The req.body.label_session parameter is misformed.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(400)).to.be.true;
  });
  it('called with misformed label_application.', async () => {
    const begin_date = moment.tz('Europe/Paris');
    const end_date = moment.tz('Europe/Paris');
    fakeReq.body = {
      label_session: 'Session',
      label_application: 2,
      id_environment: 1,
      id_datacenter: 1,
      begin_date: begin_date.format(),
      end_date: end_date.format(),
      professors: '[2]',
      users: '[3]',
    };
    await session_controller.create(fakeReq, fakeRes, {
      session_create: fakeSessionCreate,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'ParameterMisformed',
        message: 'The req.body.label_application parameter is misformed.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(400)).to.be.true;
  });
});
describe('session_controller.list()', () => {
  let fakeSessionList, fakeReq, fakeRes;
  beforeEach(() => {
    const token = token_service.generateToken({ id_user: 1 });
    fakeSessionList = sinon.stub();
    fakeReq = {
      method: 'GET',
      originalUrl: '/session/list',
      headers: {
        authorization: 'Bearer ' + token,
      },
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good arguments and should return a list of Sessions.', async () => {
    const begin_date = moment.tz('Europe/Paris');
    const end_date = moment.tz('Europe/Paris').add(2, 'hour');
    const expected_session = new Session({
      id_session: 5,
      label: 'Session de travail',
      begin_date: begin_date,
      end_date: end_date,
      environment: new Environment({
        id_environment: 2,
        label: 'Linux Alpine 3.19',
        icon: 'ereteret',
        interfaces: [],
      }),
      applications: [
        new Application({
          id_application: 8,
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          creation_date: begin_date,
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: null,
          id_environment: 2,
          state_application: 'Ready',
          state_changed_date: begin_date,
          programming_shutdown_date: end_date,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [],
          }),
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
        }),
      ],
      users: [
        new User({
          id_user: 2,
          lastname: 'VETU',
          firstname: 'Paul-Emile',
          mail: 'peheux@vetu.fr',
          role: null,
        }),
      ],
      professors: [
        new User({
          id_user: 3,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit@lefebvre.fr',
          role: null,
        }),
      ],
      datacenter: new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      }),
    });
    fakeSessionList.resolves(Promise.resolve([expected_session]));
    await session_controller.list(fakeReq, fakeRes, {
      session_list: fakeSessionList,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: [expected_session.public_format()],
    });
    chai.expect(fakeRes.status.calledOnceWith(200)).to.be.true;
  });
  it('called with an ETUDIANT token and should reject with UserIsNeitherProfOrAdmin error', async () => {
    fakeSessionList.resolves(
      Promise.reject(
        new UserIsNeitherProfOrAdmin(
          'User must be either PROFESSEUR or ADMINISTRATEUR.'
        )
      )
    );
    await session_controller.list(fakeReq, fakeRes, {
      session_list: fakeSessionList,
    });
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'UserIsNeitherProfOrAdmin',
        message: 'User must be either PROFESSEUR or ADMINISTRATEUR.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(403)).to.be.true;
  });
});
describe('session_controller.get()', () => {
  let fakeSessionGet, fakeReq, fakeRes;
  beforeEach(() => {
    const token = token_service.generateToken({ id_user: 1 });
    fakeSessionGet = sinon.stub();
    fakeReq = {
      method: 'GET',
      originalUrl: '/session/',
      headers: {
        authorization: 'Bearer ' + token,
      },
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with proper id_session and should transmit the Session', async () => {
    fakeReq.query = {
      id_session: 2,
    };
    const begin_date = moment.tz('Europe/Paris');
    const end_date = moment.tz('Europe/Paris').add(2, 'hour');
    const expected_session = new Session({
      id_session: 5,
      label: 'Session de travail',
      begin_date: begin_date,
      end_date: end_date,
      environment: new Environment({
        id_environment: 2,
        label: 'Linux Alpine 3.19',
        icon: 'ereteret',
        interfaces: [],
      }),
      applications: [
        new Application({
          id_application: 8,
          custom_label: 'Application de travail super géniale',
          generated_label: 'shrek-fiona-donkey',
          creation_date: begin_date,
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'shrek-donkey-fiona',
          id_user: null,
          id_environment: 2,
          state_application: 'Ready',
          state_changed_date: begin_date,
          programming_shutdown_date: end_date,
          environment: new Environment({
            id_environment: 2,
            label: 'Linux Alpine 3.19',
            icon: 'ereteret',
            interfaces: [],
          }),
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
        }),
      ],
      users: [
        new User({
          id_user: 2,
          lastname: 'VETU',
          firstname: 'Paul-Emile',
          mail: 'peheux@vetu.fr',
          role: null,
        }),
      ],
      professors: [
        new User({
          id_user: 3,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit@lefebvre.fr',
          role: null,
        }),
      ],
      datacenter: new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      }),
    });
    fakeSessionGet.resolves(Promise.resolve(expected_session));
    await Promise.resolve(
      session_controller.get(fakeReq, fakeRes, {
        session_get: fakeSessionGet,
      })
    );
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: expected_session.public_format(),
    });
    chai.expect(fakeRes.status.calledOnceWith(200)).to.be.true;
  });
  it('called with proper id_session and should transmit the Session', async () => {
    fakeReq.query = {
      id_session: 2,
    };

    fakeSessionGet.resolves(
      Promise.reject(new ProfessorIsNotAttributed('Prof is not attributed'))
    );
    await Promise.resolve(
      session_controller.get(fakeReq, fakeRes, {
        session_get: fakeSessionGet,
      })
    );
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'ProfessorIsNotAttributed',
        message: 'Prof is not attributed',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(403)).to.be.true;
  });
  it('called with proper id_session and should transmit the Session', async () => {
    fakeReq.query = {
      id_session: 'misformed',
    };
    await Promise.resolve(
      session_controller.get(fakeReq, fakeRes, {
        session_get: fakeSessionGet,
      })
    );
    chai.expect(fakeRes.json).to.have.been.calledOnceWithExactly({
      result: {
        error: 'ParameterMisformed',
        message: 'The req.query.id_session parameter is misformed.',
      },
    });
    chai.expect(fakeRes.status.calledOnceWith(400)).to.be.true;
  });
});
