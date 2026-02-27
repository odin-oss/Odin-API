import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as cronModule from '../../src/modules/cron.module.js';

chai.use(sinonChai);
const { expect } = chai;

describe('cron.module', () => {
  describe('launch_scheduled_applications()', () => {
    it('should launch all scheduled applications and return count', async () => {
      const mockApp1 = { hash: 'ABCDEF', label: 'App 1' };
      const mockApp2 = { hash: 'GHIJKL', label: 'App 2' };
      const mockApplications = [mockApp1, mockApp2];

      const getScheduledApplicationsStub = sinon
        .stub()
        .resolves(mockApplications);
      const createStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      const result = await cronModule.launch_scheduled_applications({
        getScheduledApplications: getScheduledApplicationsStub,
        create: createStub,
        update_state: updateStateStub,
      });

      expect(result).to.equal(2);
      expect(getScheduledApplicationsStub.calledOnce).to.be.true;
      expect(createStub.calledTwice).to.be.true;
      expect(updateStateStub.calledTwice).to.be.true;
    });

    it('should handle empty applications list', async () => {
      const getScheduledApplicationsStub = sinon.stub().resolves([]);
      const createStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      const result = await cronModule.launch_scheduled_applications({
        getScheduledApplications: getScheduledApplicationsStub,
        create: createStub,
        update_state: updateStateStub,
      });

      expect(result).to.equal(0);
      expect(createStub.called).to.be.false;
      expect(updateStateStub.called).to.be.false;
    });

    it('should throw error when getScheduledApplications fails', async () => {
      const error = new Error('Database error');
      const getScheduledApplicationsStub = sinon.stub().rejects(error);
      const createStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      try {
        await cronModule.launch_scheduled_applications({
          getScheduledApplications: getScheduledApplicationsStub,
          create: createStub,
          update_state: updateStateStub,
        });
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Database error');
      }
    });

    it('should apply "Getting ready" state to each application', async () => {
      const mockApp = { hash: 'ABCDEF' };
      const getScheduledApplicationsStub = sinon.stub().resolves([mockApp]);
      const createStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      await cronModule.launch_scheduled_applications({
        getScheduledApplications: getScheduledApplicationsStub,
        create: createStub,
        update_state: updateStateStub,
      });

      expect(updateStateStub.calledWith(sinon.match.has(
        'state_application',
        'Getting ready'
      ))).to.be.true;
    });
  });

  describe('launch_stop_applications()', () => {
    it('should stop all applications that need to be stopped', async () => {
      const mockApp1 = { hash: 'ABCDEF', datacenter: 'AWS' };
      const mockApp2 = { hash: 'GHIJKL', datacenter: 'Azure' };
      const mockApplications = [mockApp1, mockApp2];

      const getApplicationToShutdownStub = sinon
        .stub()
        .resolves(mockApplications);
      const execShutdownStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      const result = await cronModule.launch_stop_applications({
        getApplicationToShutdown: getApplicationToShutdownStub,
        exec_shutdown: execShutdownStub,
        update_state: updateStateStub,
      });

      expect(result).to.equal(2);
      expect(execShutdownStub.calledTwice).to.be.true;
      expect(updateStateStub.calledTwice).to.be.true;
    });

    it('should update application state to "Off" after shutdown', async () => {
      const mockApp = { hash: 'ABCDEF', datacenter: 'AWS' };
      const getApplicationToShutdownStub = sinon.stub().resolves([mockApp]);
      const execShutdownStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      await cronModule.launch_stop_applications({
        getApplicationToShutdown: getApplicationToShutdownStub,
        exec_shutdown: execShutdownStub,
        update_state: updateStateStub,
      });

      expect(updateStateStub.calledWith(sinon.match.has(
        'state_application',
        'Off'
      ))).to.be.true;
    });

    it('should handle empty applications list', async () => {
      const getApplicationToShutdownStub = sinon.stub().resolves([]);
      const execShutdownStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      const result = await cronModule.launch_stop_applications({
        getApplicationToShutdown: getApplicationToShutdownStub,
        exec_shutdown: execShutdownStub,
        update_state: updateStateStub,
      });

      expect(result).to.equal(0);
    });

    it('should execute shutdown with correct hash and datacenter', async () => {
      const mockApp = { hash: 'ABCDEF', datacenter: 'AWS' };
      const getApplicationToShutdownStub = sinon.stub().resolves([mockApp]);
      const execShutdownStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      await cronModule.launch_stop_applications({
        getApplicationToShutdown: getApplicationToShutdownStub,
        exec_shutdown: execShutdownStub,
        update_state: updateStateStub,
      });

      expect(execShutdownStub.calledWith(sinon.match({
        hash: 'ABCDEF',
        datacenter: 'AWS',
      }))).to.be.true;
    });
  });

  describe('launch_stop_sessions()', () => {
    it('should stop all sessions that need to be stopped', async () => {
      const mockSession1 = { hash: 'ABCDEF', datacenter: 'AWS' };
      const mockSession2 = { hash: 'GHIJKL', datacenter: 'Azure' };
      const mockSessions = [mockSession1, mockSession2];

      const getSessionToShutdownStub = sinon.stub().resolves(mockSessions);
      const execShutdownStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      const result = await cronModule.launch_stop_sessions({
        getSessionToShutdown: getSessionToShutdownStub,
        exec_shutdown: execShutdownStub,
        update_state: updateStateStub,
      });

      expect(result).to.equal(2);
      expect(execShutdownStub.calledTwice).to.be.true;
      expect(updateStateStub.calledTwice).to.be.true;
    });

    it('should update session state to "EndedSession"', async () => {
      const mockSession = { hash: 'ABCDEF', datacenter: 'AWS' };
      const getSessionToShutdownStub = sinon.stub().resolves([mockSession]);
      const execShutdownStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      await cronModule.launch_stop_sessions({
        getSessionToShutdown: getSessionToShutdownStub,
        exec_shutdown: execShutdownStub,
        update_state: updateStateStub,
      });

      expect(updateStateStub.calledWith(sinon.match.has(
        'state_application',
        'EndedSession'
      ))).to.be.true;
    });

    it('should handle empty sessions list', async () => {
      const getSessionToShutdownStub = sinon.stub().resolves([]);
      const execShutdownStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      const result = await cronModule.launch_stop_sessions({
        getSessionToShutdown: getSessionToShutdownStub,
        exec_shutdown: execShutdownStub,
        update_state: updateStateStub,
      });

      expect(result).to.equal(0);
    });

    it('should throw error when getSessionToShutdown fails', async () => {
      const error = new Error('Database error');
      const getSessionToShutdownStub = sinon.stub().rejects(error);
      const execShutdownStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      try {
        await cronModule.launch_stop_sessions({
          getSessionToShutdown: getSessionToShutdownStub,
          exec_shutdown: execShutdownStub,
          update_state: updateStateStub,
        });
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Database error');
      }
    });
  });

  describe('launch_delete_apps()', () => {
    it('should delete all apps that need to be deleted', async () => {
      const mockApp1 = { hash: 'ABCDEF', datacenter: 'AWS' };
      const mockApp2 = { hash: 'GHIJKL', datacenter: 'Azure' };
      const mockApps = [mockApp1, mockApp2];

      const getApplicationToDeleteStub = sinon.stub().resolves(mockApps);
      const execDeletionStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      const result = await cronModule.launch_delete_apps({
        getApplicationToDelete: getApplicationToDeleteStub,
        exec_deletion: execDeletionStub,
        update_state: updateStateStub,
      });

      expect(result).to.equal(2);
      expect(execDeletionStub.calledTwice).to.be.true;
      expect(updateStateStub.calledTwice).to.be.true;
    });

    it('should update app state to "Deleted"', async () => {
      const mockApp = { hash: 'ABCDEF', datacenter: 'AWS' };
      const getApplicationToDeleteStub = sinon.stub().resolves([mockApp]);
      const execDeletionStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      await cronModule.launch_delete_apps({
        getApplicationToDelete: getApplicationToDeleteStub,
        exec_deletion: execDeletionStub,
        update_state: updateStateStub,
      });

      expect(updateStateStub.calledWith(sinon.match.has(
        'state_application',
        'Deleted'
      ))).to.be.true;
    });

    it('should execute deletion with correct hash and datacenter', async () => {
      const mockApp = { hash: 'ABCDEF', datacenter: 'AWS' };
      const getApplicationToDeleteStub = sinon.stub().resolves([mockApp]);
      const execDeletionStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      await cronModule.launch_delete_apps({
        getApplicationToDelete: getApplicationToDeleteStub,
        exec_deletion: execDeletionStub,
        update_state: updateStateStub,
      });

      expect(execDeletionStub.calledWith(sinon.match({
        hash: 'ABCDEF',
        datacenter: 'AWS',
      }))).to.be.true;
    });

    it('should handle empty apps list', async () => {
      const getApplicationToDeleteStub = sinon.stub().resolves([]);
      const execDeletionStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      const result = await cronModule.launch_delete_apps({
        getApplicationToDelete: getApplicationToDeleteStub,
        exec_deletion: execDeletionStub,
        update_state: updateStateStub,
      });

      expect(result).to.equal(0);
    });

    it('should throw error when getApplicationToDelete fails', async () => {
      const error = new Error('Database error');
      const getApplicationToDeleteStub = sinon.stub().rejects(error);
      const execDeletionStub = sinon.stub().resolves({});
      const updateStateStub = sinon.stub().resolves({});

      try {
        await cronModule.launch_delete_apps({
          getApplicationToDelete: getApplicationToDeleteStub,
          exec_deletion: execDeletionStub,
          update_state: updateStateStub,
        });
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Database error');
      }
    });
  });
});
