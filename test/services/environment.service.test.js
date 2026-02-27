import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as environment_service from '../../src/services/environment.service.js';

chai.use(sinonChai);

describe('environment.service.list()', () => {
  it('should list all environments successfully', async () => {
    const mockEnvironments = [
      {
        id_environment: 1,
        label: 'Environment 1',
        icon: 'icon1',
        interfaces: [],
      },
      {
        id_environment: 2,
        label: 'Environment 2',
        icon: 'icon2',
        interfaces: [],
      },
    ];
    const mockList = sinon.stub().resolves(mockEnvironments);

    const result = await environment_service.list({
      environment_list: mockList,
    });

    chai.expect(result).to.deep.equal(mockEnvironments);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should return empty array when no environments exist', async () => {
    const mockList = sinon.stub().resolves([]);

    const result = await environment_service.list({
      environment_list: mockList,
    });

    chai.expect(result).to.deep.equal([]);
    chai.expect(mockList.calledOnce).to.be.true;
  });

  it('should propagate error when builder throws', async () => {
    const mockError = new Error('Database error');
    const mockList = sinon.stub().rejects(mockError);

    try {
      await environment_service.list({ environment_list: mockList });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err.message).to.equal('Database error');
    }
  });
});

describe('environment.service.get()', () => {
  it('should get environment by id successfully', async () => {
    const mockEnvironment = {
      id_environment: 1,
      label: 'Environment 1',
      icon: 'icon1',
      interfaces: [{ id_interface: 1 }],
    };
    const mockGet = sinon.stub().resolves(mockEnvironment);

    const result = await environment_service.get(
      { id_environment: 1 },
      { environment_get: mockGet }
    );

    chai.expect(result).to.deep.equal(mockEnvironment);
    chai.expect(mockGet.calledOnce).to.be.true;
  });

  it('should throw error when id_environment is not positive', async () => {
    try {
      await environment_service.get({ id_environment: -1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_environment is zero', async () => {
    try {
      await environment_service.get({ id_environment: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_environment is missing', async () => {
    try {
      await environment_service.get({});
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('environment.service.create()', () => {
  it('should create environment successfully', async () => {
    const mockNewEnvironment = {
      id_environment: 1,
      label: 'New Environment',
      icon: 'new_icon',
    };
    const mockCreate = sinon.stub().resolves(mockNewEnvironment);

    const result = await environment_service.create(
      {
        label: 'New Environment',
        icon: 'new_icon',
      },
      { create: mockCreate }
    );

    chai.expect(result).to.deep.equal(mockNewEnvironment);
    chai.expect(mockCreate.calledOnce).to.be.true;
  });

  it('should throw error when label is less than 2 characters', async () => {
    try {
      await environment_service.create({
        label: 'a',
        icon: 'icon',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when icon is less than 2 characters', async () => {
    try {
      await environment_service.create({
        label: 'Environment',
        icon: 'i',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('environment.service.attach_interface()', () => {
  it('should attach interface to environment successfully', async () => {
    const mockUpdated = {
      id_environment: 1,
      label: 'Environment',
      interfaces: [{ id_interface: 1, label: 'Interface 1' }],
    };
    const mockAttach = sinon.stub().resolves(mockUpdated);

    const result = await environment_service.attach_interface(
      {
        label: 'Interface 1',
        id_environment: 1,
        id_interface: 1,
      },
      { attach_interface: mockAttach }
    );

    chai.expect(result).to.deep.equal(mockUpdated);
    chai.expect(mockAttach.calledOnce).to.be.true;
  });

  it('should throw error when label is less than 2 characters', async () => {
    try {
      await environment_service.attach_interface({
        label: 'a',
        id_environment: 1,
        id_interface: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_environment is not positive', async () => {
    try {
      await environment_service.attach_interface({
        label: 'Interface',
        id_environment: 0,
        id_interface: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_interface is not positive', async () => {
    try {
      await environment_service.attach_interface({
        label: 'Interface',
        id_environment: 1,
        id_interface: -1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('environment.service.detach_interface()', () => {
  it('should detach interface from environment successfully', async () => {
    const mockUpdated = {
      id_environment: 1,
      label: 'Environment',
      interfaces: [],
    };
    const mockDetach = sinon.stub().resolves(mockUpdated);

    const result = await environment_service.detach_interface(
      {
        id_environment: 1,
        id_interface: 1,
      },
      { detach_interface: mockDetach }
    );

    chai.expect(result).to.deep.equal(mockUpdated);
    chai.expect(mockDetach.calledOnce).to.be.true;
  });

  it('should throw error when id_environment is not positive', async () => {
    try {
      await environment_service.detach_interface({
        id_environment: -1,
        id_interface: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_interface is not positive', async () => {
    try {
      await environment_service.detach_interface({
        id_environment: 1,
        id_interface: 0,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('environment.service.update()', () => {
  it('should update environment successfully', async () => {
    const mockUpdated = {
      id_environment: 1,
      label: 'Updated Environment',
      icon: 'updated_icon',
    };
    const mockUpdate = sinon.stub().resolves(mockUpdated);

    const result = await environment_service.update(
      {
        label: 'Updated Environment',
        icon: 'updated_icon',
        id_environment: 1,
      },
      { update: mockUpdate }
    );

    chai.expect(result).to.deep.equal(mockUpdated);
    chai.expect(mockUpdate.calledOnce).to.be.true;
  });

  it('should throw error when label is less than 2 characters', async () => {
    try {
      await environment_service.update({
        label: 'a',
        icon: 'icon',
        id_environment: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_environment is not positive', async () => {
    try {
      await environment_service.update({
        label: 'Environment',
        icon: 'icon',
        id_environment: 0,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('environment.service.update_interface()', () => {
  it('should update interface label in environment successfully', async () => {
    const mockUpdated = {
      id_environment: 1,
      interfaces: [{ id_interface: 1, label: 'Updated Label' }],
    };
    const mockUpdate = sinon.stub().resolves(mockUpdated);

    const result = await environment_service.update_interface(
      {
        label: 'Updated Label',
        id_interface: 1,
        id_environment: 1,
      },
      { update_interface: mockUpdate }
    );

    chai.expect(result).to.deep.equal(mockUpdated);
    chai.expect(mockUpdate.calledOnce).to.be.true;
  });

  it('should throw error when label is less than 2 characters', async () => {
    try {
      await environment_service.update_interface({
        label: 'a',
        id_interface: 1,
        id_environment: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_interface is not positive', async () => {
    try {
      await environment_service.update_interface({
        label: 'Interface',
        id_interface: 0,
        id_environment: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('environment.service.del()', () => {
  it('should delete environment successfully', async () => {
    const mockDeleted = {
      id_environment: 1,
      label: 'Deleted Environment',
    };
    const mockDelete = sinon.stub().resolves(mockDeleted);

    const result = await environment_service.del(
      { id_environment: 1 },
      { del: mockDelete }
    );

    chai.expect(result).to.deep.equal(mockDeleted);
    chai.expect(mockDelete.calledOnce).to.be.true;
  });

  it('should throw error when id_environment is not positive', async () => {
    try {
      await environment_service.del({ id_environment: -1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_environment is zero', async () => {
    try {
      await environment_service.del({ id_environment: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
