import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as applications_service from '../../src/services/applications.service.js';
import { MissingArgumentError } from '../../src/utils/errors.util.js';

chai.use(sinonChai);

describe('applications.service.get()', () => {
  it('should get application by id successfully', async () => {
    const mockApplication = {
      id_application: 1,
      id_user: 1,
      id_environment: 1,
      label: 'App 1',
      hash: 'abc123',
      datacenter: { id_datacenter: 1 },
    };
    const mockEnvironment = { id_environment: 1, label: 'Env 1' };
    const mockDatacenter = { id_datacenter: 1, label: 'DC1' };
    const mockHistory = { id_application: 1, records: [] };

    const mockApplicationGet = sinon.stub().resolves(mockApplication);
    const mockEnvironmentGet = sinon.stub().resolves(mockEnvironment);
    const mockDatacenterGet = sinon.stub().resolves(mockDatacenter);
    const mockHistoryGet = sinon.stub().resolves(mockHistory);

    const result = await applications_service.get(
      { id_application: 1 },
      {
        application_get: mockApplicationGet,
        environment_get: mockEnvironmentGet,
        datacenter_get: mockDatacenterGet,
        history_get_last_record: mockHistoryGet,
      }
    );

    chai.expect(mockApplicationGet.calledOnce).to.be.true;
    chai.expect(mockEnvironmentGet.calledOnce).to.be.true;
    chai.expect(mockDatacenterGet.calledOnce).to.be.true;
    chai.expect(mockHistoryGet.calledOnce).to.be.true;
  });

  it('should get application by key successfully', async () => {
    const mockApplication = {
      id_application: 1,
      key: 'unique-key-123',
      id_environment: 1,
      id_user: 1,
      datacenter: { id_datacenter: 1 },
    };
    const mockEnvironment = { id_environment: 1 };
    const mockDatacenter = { id_datacenter: 1 };
    const mockHistory = { id_application: 1, records: [] };

    const mockApplicationGet = sinon.stub().resolves(mockApplication);
    const mockEnvironmentGet = sinon.stub().resolves(mockEnvironment);
    const mockDatacenterGet = sinon.stub().resolves(mockDatacenter);
    const mockHistoryGet = sinon.stub().resolves(mockHistory);

    const result = await applications_service.get(
      { key: 'unique-key-123' },
      {
        application_get: mockApplicationGet,
        environment_get: mockEnvironmentGet,
        datacenter_get: mockDatacenterGet,
        history_get_last_record: mockHistoryGet,
      }
    );

    chai.expect(mockApplicationGet.calledOnce).to.be.true;
  });

  it('should throw MissingArgumentError when neither id_application nor key is provided', async () => {
    try {
      await applications_service.get({});
      chai.expect.fail('Should have thrown MissingArgumentError');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
    }
  });

  it('should throw error when id_application is not positive', async () => {
    try {
      await applications_service.get({ id_application: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_application is negative', async () => {
    try {
      await applications_service.get({ id_application: -1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('applications.service.list()', () => {
  it('should list applications for a user successfully', async () => {
    const mockApplications = [
      {
        id_application: 1,
        id_user: 1,
        id_environment: 1,
        label: 'App 1',
        datacenter: { id_datacenter: 1 },
      },
      {
        id_application: 2,
        id_user: 1,
        id_environment: 1,
        label: 'App 2',
        datacenter: { id_datacenter: 1 },
      },
    ];
    const mockDatacenters = [{ id_datacenter: 1, label: 'DC1' }];
    const mockEnvironments = [{ id_environment: 1, label: 'Env1' }];
    const mockHistories = [
      { id_application: 1, records: [] },
      { id_application: 2, records: [] },
    ];

    const mockApplicationList = sinon.stub().resolves(mockApplications);
    const mockEnvironmentGet = sinon.stub().resolves(mockEnvironments[0]);
    const mockDatacenterList = sinon.stub().resolves(mockDatacenters);
    const mockHistoryGet = sinon
      .stub()
      .onFirstCall()
      .resolves(mockHistories[0])
      .onSecondCall()
      .resolves(mockHistories[1]);

    const result = await applications_service.list(
      { id_user: 1 },
      {
        application_list: mockApplicationList,
        environment_get: mockEnvironmentGet,
        datacenter_list: mockDatacenterList,
        history_get_last_record: mockHistoryGet,
      }
    );

    chai.expect(mockApplicationList.calledOnce).to.be.true;
    chai.expect(mockDatacenterList.calledOnce).to.be.true;
    chai.expect(mockEnvironmentGet.callCount).to.be.greaterThan(0);
  });

  it('should return empty array when user has no applications', async () => {
    const mockApplicationList = sinon.stub().resolves([]);
    const mockDatacenterList = sinon.stub().resolves([]);

    const result = await applications_service.list(
      { id_user: 1 },
      {
        application_list: mockApplicationList,
        environment_get: sinon.stub(),
        datacenter_list: mockDatacenterList,
        history_get_last_record: sinon.stub(),
      }
    );

    chai.expect(result).to.deep.equal([]);
  });

  it('should throw error when id_user is not positive', async () => {
    try {
      await applications_service.list({ id_user: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_user is missing', async () => {
    try {
      await applications_service.list({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('applications.service.update_state()', () => {
  it('should update application state to Ready successfully', async () => {
    const mockApplication = {
      id_application: 1,
      state_application: 'Off',
      hash: 'abc123',
      datacenter: { id_datacenter: 1 },
      id_environment: 1,
    };
    const mockUpdatedApplication = {
      ...mockApplication,
      state_application: 'Ready',
    };
    const mockDatacenter = { id_datacenter: 1, label: 'DC1' };
    const mockEnvironment = { id_environment: 1, label: 'Env1' };

    const mockApplicationGet = sinon
      .stub()
      .onFirstCall()
      .resolves(mockApplication)
      .onSecondCall()
      .resolves(mockUpdatedApplication);
    const mockDatacenterGet = sinon.stub().resolves(mockDatacenter);
    const mockApplicationUpdate = sinon.stub().resolves();
    const mockEnvironmentGet = sinon.stub().resolves(mockEnvironment);
    const mockExecStart = sinon.stub().resolves();

    const result = await applications_service.update_state(
      {
        id_application: 1,
        state_application: 'Ready',
      },
      {
        application_get: mockApplicationGet,
        datacenter_get: mockDatacenterGet,
        application_update: mockApplicationUpdate,
        exec_start: mockExecStart,
        exec_shutdown: sinon.stub(),
        environment_get: mockEnvironmentGet,
      }
    );

    chai.expect(mockApplicationUpdate.calledOnce).to.be.true;
    chai.expect(mockExecStart.calledOnce).to.be.true;
  });

  it('should update application state to Off successfully', async () => {
    const mockApplication = {
      id_application: 1,
      state_application: 'Ready',
      hash: 'abc123',
      datacenter: { id_datacenter: 1 },
    };
    const mockUpdatedApplication = {
      ...mockApplication,
      state_application: 'Off',
    };
    const mockDatacenter = { id_datacenter: 1 };

    const mockApplicationGet = sinon
      .stub()
      .onFirstCall()
      .resolves(mockApplication)
      .onSecondCall()
      .resolves(mockUpdatedApplication);
    const mockDatacenterGet = sinon.stub().resolves(mockDatacenter);
    const mockApplicationUpdate = sinon.stub().resolves();
    const mockExecShutdown = sinon.stub().resolves();

    const result = await applications_service.update_state(
      {
        id_application: 1,
        state_application: 'Off',
      },
      {
        application_get: mockApplicationGet,
        datacenter_get: mockDatacenterGet,
        application_update: mockApplicationUpdate,
        exec_start: sinon.stub(),
        exec_shutdown: mockExecShutdown,
        environment_get: sinon.stub(),
      }
    );

    chai.expect(mockApplicationUpdate.calledOnce).to.be.true;
    chai.expect(mockExecShutdown.calledOnce).to.be.true;
  });

  it('should throw error when state_application is invalid', async () => {
    try {
      await applications_service.update_state({
        id_application: 1,
        state_application: 'InvalidState',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_application is not positive', async () => {
    try {
      await applications_service.update_state({
        id_application: 0,
        state_application: 'Ready',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
