import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as session_service from '../../src/services/session.service.js';
import { UserIsNeitherProfOrAdmin } from '../../src/utils/errors.util.js';
import { Application } from '../../src/objects/Application.js';
import { User } from '../../src/objects/User.js';
import { Environment } from '../../src/objects/Environment.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
import moment from 'moment-timezone';

chai.use(sinonChai);

describe('session.service.create()', () => {
  it('should create session with users and applications successfully', async () => {
    // Create proper class instances required by Session constructor
    const mockDatacenter = new Datacenter({
      id_datacenter: 1,
      label: 'DC1',
      provider: 'AWS',
      city: 'Paris',
    });

    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'Environment 1',
      icon: 'icon1',
      interfaces: [],
    });

    // Create a proper Application instance
    const mockApplication = new Application({
      id_application: 1,
      id_user: 1,
      label: 'Test App',
      state_application: 'Launched',
      state_changed_date: moment(),
      argument: [],
      argument_deployed: [],
      storage: null,
      datacenter: mockDatacenter,
      environment: mockEnvironment,
    });

    // Create proper User instances
    const mockUser = new User({
      id_user: 1,
      mail: 'user@example.com',
      role: 'STUDENT',
    });

    const mockProfessor = new User({
      id_user: 2,
      mail: 'prof@example.com',
      role: 'TEACHER',
    });

    // Mock session must have all required Session properties as instances
    const mockSessionData = {
      id_session: 1,
      label: 'Test Session',
      begin_date: moment(),
      end_date: moment().add(1, 'day'),
      applications: [],
      users: [],
      professors: [],
      datacenter: mockDatacenter,
      environment: mockEnvironment,
    };

    const mockSessionCreate = sinon.stub().resolves(mockSessionData);
    const mockApplicationCreate = sinon.stub().resolves(mockApplication);
    const mockSessionAttributeProfessor = sinon.stub().resolves({
      user: mockProfessor,
    });
    const mockSessionAttributeUserApp = sinon.stub().resolves({
      user: mockUser,
      id_application: 1,
    });

    const result = await session_service.create(
      {
        id_environment: 1,
        id_datacenter: 1,
        label_session: 'Test Session',
        label_application: 'Test App',
        begin_date: moment(),
        end_date: moment().add(1, 'day'),
        users: [1],
        professors: [2],
      },
      {
        application_create: mockApplicationCreate,
        session_create: mockSessionCreate,
        session_attribute_professor: mockSessionAttributeProfessor,
        session_attribute_user_and_application: mockSessionAttributeUserApp,
      }
    );

    chai.expect(mockSessionCreate.calledOnce).to.be.true;
    chai.expect(mockApplicationCreate.calledOnce).to.be.true;
  });

  it('should throw error when begin_date is invalid', async () => {
    try {
      await session_service.create({
        id_environment: 1,
        id_datacenter: 1,
        label_session: 'Test Session',
        label_application: 'Test App',
        begin_date: 'invalid-date',
        end_date: moment().add(1, 'day'),
        users: [],
        professors: [],
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when end_date is invalid', async () => {
    try {
      await session_service.create({
        id_environment: 1,
        id_datacenter: 1,
        label_session: 'Test Session',
        label_application: 'Test App',
        begin_date: moment(),
        end_date: 'invalid-date',
        users: [],
        professors: [],
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_environment is not positive', async () => {
    try {
      await session_service.create({
        id_environment: 0,
        id_datacenter: 1,
        label_session: 'Test Session',
        label_application: 'Test App',
        begin_date: moment(),
        end_date: moment().add(1, 'day'),
        users: [],
        professors: [],
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_datacenter is not positive', async () => {
    try {
      await session_service.create({
        id_environment: 1,
        id_datacenter: -1,
        label_session: 'Test Session',
        label_application: 'Test App',
        begin_date: moment(),
        end_date: moment().add(1, 'day'),
        users: [],
        professors: [],
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('session.service.list()', () => {
  it('should list sessions for an admin user successfully', async () => {
    const mockUser = { id_user: 1, role: 'ADMINISTRATOR' };
    const mockSessions = [
      {
        id_session: 1,
        label: 'Session 1',
        users: [{ id_user: 2 }],
        professors: [{ id_user: 3 }],
      },
    ];
    const mockUsers = [
      { id_user: 2, mail: 'user@example.com', role: 'STUDENT' },
      { id_user: 3, mail: 'prof@example.com', role: 'TEACHER' },
    ];

    const mockUserGet = sinon.stub().resolves(mockUser);
    const mockSessionList = sinon.stub().resolves(mockSessions);
    const mockUserList = sinon.stub().resolves(mockUsers);

    const result = await session_service.list(
      { id_user: 1 },
      {
        user_get: mockUserGet,
        session_list: mockSessionList,
        user_list: mockUserList,
      }
    );

    chai.expect(mockUserGet.calledOnce).to.be.true;
    chai.expect(mockSessionList.calledOnce).to.be.true;
  });

  it('should list sessions for a professor user successfully', async () => {
    const mockUser = { id_user: 1, role: 'TEACHER' };
    const mockSessions = [
      {
        id_session: 1,
        label: 'Session 1',
        users: [],
        professors: [{ id_user: 1 }],
      },
    ];

    const mockUserGet = sinon.stub().resolves(mockUser);
    const mockSessionList = sinon.stub().resolves(mockSessions);
    const mockUserList = sinon.stub().resolves([]);

    const result = await session_service.list(
      { id_user: 1 },
      {
        user_get: mockUserGet,
        session_list: mockSessionList,
        user_list: mockUserList,
      }
    );

    chai.expect(mockUserGet.calledOnce).to.be.true;
  });

  it('should throw UserIsNeitherProfOrAdmin when user is STUDENT', async () => {
    const mockUser = { id_user: 1, role: 'STUDENT' };
    const mockUserGet = sinon.stub().resolves(mockUser);

    try {
      await session_service.list(
        { id_user: 1 },
        {
          user_get: mockUserGet,
          session_list: sinon.stub(),
          user_list: sinon.stub(),
        }
      );
      chai.expect.fail('Should have thrown UserIsNeitherProfOrAdmin');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(UserIsNeitherProfOrAdmin);
    }
  });

  it('should throw error when id_user is not positive', async () => {
    try {
      await session_service.list({ id_user: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_user is missing', async () => {
    try {
      await session_service.list({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should return empty array when admin has no sessions', async () => {
    const mockUser = { id_user: 1, role: 'ADMINISTRATOR' };
    const mockUserGet = sinon.stub().resolves(mockUser);
    const mockSessionList = sinon.stub().resolves([]);

    const result = await session_service.list(
      { id_user: 1 },
      {
        user_get: mockUserGet,
        session_list: mockSessionList,
        user_list: sinon.stub().resolves([]),
      }
    );

    chai.expect(result).to.deep.equal([]);
  });
});

describe('session.service.get()', () => {
  it('should get session for admin user successfully', async () => {
    const mockUser = { id_user: 1, role: 'ADMINISTRATOR' };
    const mockSession = {
      id_session: 1,
      label: 'Session 1',
      users: [{ id_user: 2 }],
      professors: [{ id_user: 3 }],
      applications: [{ id_application: 1 }],
    };
    const mockUsers = [
      { id_user: 2, mail: 'user@example.com' },
      { id_user: 3, mail: 'prof@example.com' },
    ];
    const mockApplication = {
      id_application: 1,
      label: 'App 1',
      datacenter: { id_datacenter: 1 },
    };

    const mockUserGet = sinon.stub().resolves(mockUser);
    const mockSessionGetAdmin = sinon.stub().resolves(mockSession);
    const mockUserList = sinon.stub().resolves(mockUsers);
    const mockApplicationGet = sinon.stub().resolves(mockApplication);

    const result = await session_service.get(
      { id_user: 1, id_session: 1 },
      {
        user_get: mockUserGet,
        session_get_on_administrator: mockSessionGetAdmin,
        session_get_on_teacher: sinon.stub(),
        user_list: mockUserList,
        application_get: mockApplicationGet,
      }
    );

    chai.expect(mockUserGet.calledOnce).to.be.true;
    chai.expect(mockSessionGetAdmin.calledOnce).to.be.true;
  });

  it('should throw UserIsNeitherProfOrAdmin when user is STUDENT', async () => {
    const mockUser = { id_user: 1, role: 'STUDENT' };
    const mockUserGet = sinon.stub().resolves(mockUser);

    try {
      await session_service.get(
        { id_user: 1, id_session: 1 },
        {
          user_get: mockUserGet,
          session_get_on_administrator: sinon.stub(),
          session_get_on_teacher: sinon.stub(),
          user_list: sinon.stub(),
          application_get: sinon.stub(),
        }
      );
      chai.expect.fail('Should have thrown UserIsNeitherProfOrAdmin');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(UserIsNeitherProfOrAdmin);
    }
  });

  it('should throw error when id_user is not positive', async () => {
    try {
      await session_service.get({ id_user: 0, id_session: 1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_session is not positive', async () => {
    try {
      await session_service.get({ id_user: 1, id_session: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
