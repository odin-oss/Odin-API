import * as storage_service from '../../../src/services/application/storage.service.js';
import {
  DBObjectNotFound,
  MissingArgumentError,
  StorageError,
  StorageAlreadyExists,
  SmashAPIError,
  ParameterMisformed,
} from '../../../src/utils/errors.service.js';
import moment from 'moment-timezone';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Application } from '../../../src/objects/Application.js';
import CONFIG from '../../../src/config/config.js';
import { Environment } from '../../../src/objects/Environment.js';
import { User } from '../../../src/objects/User.js';
import { Datacenter } from '../../../src/objects/Datacenter.js';
import { Interface } from '../../../src/objects/Interface.js';
import { Application_export } from '../../../src/objects/application/Application_export.js';
import { provider } from '@hapi/joi/lib/cache.js';
chai.use(sinonChai);

describe('storage.service.getStorage()', () => {
  let fakeGetStorage;

  beforeEach(() => {
    fakeGetStorage = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good args and should return the active storage.', async () => {
    // Mock successful storage retrieval
    const mockStorage = {
      id_export: 1,
      id_application: 1,
      expiration_date: '2025-09-17T09:01:03.000Z',
      id_enum_export_state: 1,
    };
    fakeGetStorage.resolves(Promise.resolve(mockStorage));

    const result = await storage_service.getStorage(
      {
        id_application: 1,
      },
      {
        get_storage: fakeGetStorage,
      }
    );

    chai.expect(result).to.deep.equal(mockStorage);
    chai.expect(fakeGetStorage).to.have.been.calledOnceWithExactly({
      id_application: 1,
    });
  });

  it('called with missing argument id_application and should reject with MissingArgument error.', async () => {
    try {
      await storage_service.getStorage(
        {},
        {
          get_storage: fakeGetStorage,
        }
      );
      chai.expect.fail(
        'Expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeGetStorage).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_application) are missing.');
    }
  });

  it('called with misformed id_application and should reject with ParameterMisformed error.', async () => {
    try {
      await storage_service.getStorage(
        {
          id_application: 'misformed',
        },
        {
          get_storage: fakeGetStorage,
        }
      );
      chai.expect.fail('Expected to throw ParameterMisformed, but it did not.');
    } catch (err) {
      chai.expect(fakeGetStorage).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_application parameter is misformed.');
    }
  });
});

describe('storage.service.exportStorage()', () => {
  let fakeUserGet,
    fakeEnvironmentGet,
    fakeGetApplicationExport,
    fakeApplicationGet,
    fakeStorageCreate,
    fakeExecSmashExport,
    fakeServiceDeleteStorage,
    clock,
    fakeMoment;
  beforeEach(() => {
    fakeUserGet = sinon.stub();
    fakeEnvironmentGet = sinon.stub();
    fakeGetApplicationExport = sinon.stub();
    fakeApplicationGet = sinon.stub();
    fakeStorageCreate = sinon.stub();
    fakeExecSmashExport = sinon.stub();
    fakeServiceDeleteStorage = sinon.stub();
    const fixedTime = '1999-08-23T12:00:00Z';
    clock = sinon.useFakeTimers(new Date(fixedTime).getTime());
    fakeMoment = sinon.stub(moment, 'tz').callsFake(() => moment(fixedTime));
  });
  afterEach(() => {
    sinon.restore();
    clock.restore();
    fakeMoment.restore();
  });
  it('called with good args and should launch the Smash export.', async () => {
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: undefined,
        })
      )
    );
    fakeGetApplicationExport.resolves(
      Promise.resolve(
        new Application_export({
          id_export: null,
          init_date: null,
          id_application: null,
          expiration_date: null,
          id_provider: null,
          download_link: null,
          id_enum_export_state: null,
          status: null,
        })
      )
    );

    fakeEnvironmentGet.resolves(
      Promise.resolve(
        new Environment({
          id_environment: 1,
          icon: 'ereteret',
          label: 'ReactJS',
          interfaces: [
            new Interface({
              label: 'web-80',
              registry_link: 'image:tag',
              envs: [
                { id_variable_environment: 3, key: 'PUID', value: '1000' },
                { id_variable_environment: 4, key: 'PGID', value: '1000' },
                { id_variable_environment: 34, key: 'HSTORAGE', value: 'true' },
              ],
            }),
            new Interface({
              label: 'ssh-22',
              registry_link: 'image:tag',
              envs: [],
            }),
          ],
        })
      )
    );
    fakeApplicationGet.resolves(
      Promise.resolve(
        new Application({
          id_application: 1,
          custom_label: 'Wow ça marche',
          generated_label: 'ulfi-blacky-donkey',
          creation_date: moment.tz(CONFIG.timezone),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'louis-daphne-peheux',
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          id_user: 1,
          id_environment: 1,
          state_application: 'Off',
          state_changed_date: moment('2199-08-23T12:00:00Z').tz(
            CONFIG.timezone
          ),
          programming_shutdown_date: moment('2199-08-23T12:00:00Z')
            .tz(CONFIG.timezone)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            icon: 'ereteret',
            id_environment: 1,
            label: 'ReactJS',
          }),
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
        })
      )
    );
    fakeStorageCreate.resolves(
      Promise.resolve(
        new Application_export({
          id_export: 1,
          id_application: 1,
          expiration_date: '2025-09-17T09:01:03.000Z',
          id_enum_export_state: 1,
        })
      )
    );
    fakeExecSmashExport.resolves(Promise.resolve(true));
    const application_export = await storage_service.exportStorage(
      {
        id_application: 1,
        delete_existing_export: false,
        app_deletion: false,
      },
      {
        user_get: fakeUserGet,
        environment_get: fakeEnvironmentGet,
        application_get: fakeApplicationGet,
        get_application_export: fakeGetApplicationExport,
        storage_create: fakeStorageCreate,
        exec_smash_export: fakeExecSmashExport,
      }
    );

    chai.expect(application_export).to.deep.equal(
      new Application_export({
        id_export: 1,
        id_application: 1,
        expiration_date: '2025-09-17T09:01:03.000Z',
        id_enum_export_state: 1,
      })
    );
    chai.expect(fakeUserGet).to.have.been.calledOnceWithExactly({
      id_user: 1,
    });
    chai.expect(fakeEnvironmentGet).to.have.been.calledOnceWithExactly({
      id_environment: 1,
    });
    chai.expect(fakeApplicationGet).to.have.been.calledOnceWithExactly({
      id_application: 1,
    });
    chai.expect(fakeExecSmashExport).to.have.been.calledOnceWithExactly({
      hash: 'hash12',
      upload_id: '1',
      label: 'web-80', // This verifies that the interface label is correctly retrieved
      app_deletion: false,
      folder_path: '/home/b_lefebvre/',
      storage_carrier_image: CONFIG.smash_storage_carrier_image,
      storage_carrier_image_tag: CONFIG.smash_storage_carrier_image_tag,
      smash_api_key: CONFIG.smash_storage_carrier_api_key,
      smash_region: CONFIG.smash_storage_carrier_region,
      smash_teamid: CONFIG.smash_storage_carrier_teamid,
      web_title: 'Wow ça marche',
      upload_description:
        'Wow ça marche Odin environment export from 1999-08-23 14:00:00 ()',
      export_language: 'fr',
      availability: '30',
      sender_name: CONFIG.storage_carrier_sender_name,
      sender_email: CONFIG.storage_carrier_sender_email,
      receiver_email: 'benoit.lefebvre@getcaelus.cloud',
      datacenter: new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      }),
    });
  });

  // it('called with good args but no non-ssh interface and should use undefined label.', async () => {
  //   fakeUserGet.resolves(
  //     Promise.resolve(
  //       new User({
  //         id_user: 1,
  //         lastname: 'LEFEBVRE',
  //         firstname: 'Benoit',
  //         mail: 'benoit.lefebvre@getcaelus.cloud',
  //         role: 'PROFESSEUR',
  //         pwd: undefined,
  //       })
  //     )
  //   );
  //   fakeGetApplicationExport.resolves(
  //     Promise.resolve(
  //       new Application_export({
  //         id_export: null,
  //         init_date: null,
  //         id_application: null,
  //         expiration_date: null,
  //         id_provider: null,
  //         download_link: null,
  //         id_enum_export_state: null,
  //         status: null,
  //       })
  //     )
  //   );
  //   fakeEnvironmentGet.resolves(
  //     Promise.resolve(
  //       new Environment({
  //         id_environment: 1,
  //         icon: 'ereteret',
  //         label: 'ReactJS',
  //         interfaces: [
  //           new Interface({
  //             label: 'ssh-22',
  //             registry_link: 'image:tag',
  //             envs: []
  //           }
  //           ),
  //           new Interface({
  //             label: 'ssh-222',
  //             registry_link: 'image:tag',
  //             envs: []
  //           }
  //           ),
  //         ],
  //       })
  //     )
  //   );
  //   fakeApplicationGet.resolves(
  //     Promise.resolve(
  //       new Application({
  //         id_application: 1,
  //         custom_label: 'Wow ça marche',
  //         generated_label: 'ulfi-blacky-donkey',
  //         creation_date: moment.tz(CONFIG.timezone),
  //         hash: 'hash12',
  //         username: 'b_lefebvre',
  //         password: 'louis-daphne-peheux',
  //         datacenter: new Datacenter({
  //           id_datacenter: 1,
  //           label: 'testdc',
  //           provider: 'prov',
  //           city: 'paradise',
  //         }),
  //         id_user: 1,
  //         id_environment: 1,
  //         state_application: 'Off',
  //         state_changed_date: moment('2199-08-23T12:00:00Z').tz(
  //           CONFIG.timezone
  //         ),
  //         programming_shutdown_date: moment('2199-08-23T12:00:00Z')
  //           .tz(CONFIG.timezone)
  //           .add(CONFIG.expiration, 's'),
  //         environment: new Environment({
  //           icon: 'ereteret',
  //           id_environment: 1,
  //           label: 'ReactJS',
  //         }),
  //       })
  //     )
  //   );
  //   fakeStorageCreate.resolves(
  //     Promise.resolve(
  //       new Application_export({
  //         id_export: 1,
  //         id_application: 1,
  //         expiration_date: '2025-09-17T09:01:03.000Z',
  //         id_enum_export_state: 1,
  //       })
  //     )
  //   );
  //   fakeExecSmashExport.resolves(Promise.resolve(true));
  //   const application_export = await storage_service.exportStorage(
  //     {
  //       id_user: 1,
  //       id_application: 1,
  //       delete_existing_export: false,
  //     },
  //     {
  //       user_get: fakeUserGet,
  //       environment_get: fakeEnvironmentGet,
  //       application_get: fakeApplicationGet,
  //       get_application_export: fakeGetApplicationExport,
  //       storage_create: fakeStorageCreate,
  //       exec_smash_export: fakeExecSmashExport,
  //     }
  //   );

  //   chai.expect(application_export).to.deep.equal(
  //     new Application_export({
  //       id_export: 1,
  //       id_application: 1,
  //       expiration_date: '2025-09-17T09:01:03.000Z',
  //       id_enum_export_state: 1,
  //     })
  //   );
  //   chai.expect(fakeUserGet).to.have.been.calledOnceWithExactly({
  //     id_user: 1,
  //   });
  //   chai.expect(fakeEnvironmentGet).to.have.been.calledOnceWithExactly({
  //     id_environment: 1,
  //   });
  //   chai.expect(fakeApplicationGet).to.have.been.calledOnceWithExactly({
  //     id_application: 1,
  //   });
  //   chai.expect(fakeExecSmashExport).to.have.been.calledOnceWithExactly({
  //     hash: 'hash12',
  //     upload_id: '1',
  //     label: undefined, // This verifies that when no non-ssh interface is found, undefined is used
  //     folder_path: '/home/b_lefebvre/',
  //     storage_carrier_image: CONFIG.smash_storage_carrier_image,
  //     storage_carrier_image_tag: CONFIG.smash_storage_carrier_image_tag,
  //     smash_api_key: CONFIG.smash_storage_carrier_api_key,
  //     smash_region: CONFIG.smash_storage_carrier_region,
  //     smash_teamid: CONFIG.smash_storage_carrier_teamid,
  //     web_title: 'Wow ça marche',
  //     upload_description:
  //       'Wow ça marche Odin environment export from 1999-08-23 14:00:00 ()',
  //     export_language: 'fr',
  //     availability: '30',
  //     sender_name: CONFIG.storage_carrier_sender_name,
  //     sender_email: CONFIG.storage_carrier_sender_email,
  //     receiver_email: 'benoit.lefebvre@getcaelus.cloud',
  //   });
  // });
  it('called with missing argument id_application and should reject with MissingArgument error.', async () => {
    try {
      await storage_service.exportStorage(
        {
          id_user: 1,
          delete_existing_export: false,
        },
        {
          user_get: fakeUserGet,
          environment_get: fakeEnvironmentGet,
          application_get: fakeApplicationGet,
          storage_create: fakeStorageCreate,
          exec_smash_export: fakeExecSmashExport,
        }
      );
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.not.have.been.called;
      chai.expect(fakeEnvironmentGet).to.not.have.been.called;
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeStorageCreate).to.not.have.been.called;
      chai.expect(fakeExecSmashExport).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_application) are missing.');
    }
  });
  it('called with misformed app_deletion and should reject with ParameterMisformed error.', async () => {
    try {
      await storage_service.exportStorage(
        {
          id_user: 'misformed',
          id_application: 1,
          delete_existing_export: false,
          app_deletion: 'misformed',
        },
        {
          user_get: fakeUserGet,
          environment_get: fakeEnvironmentGet,
          application_get: fakeApplicationGet,
          storage_create: fakeStorageCreate,
          exec_smash_export: fakeExecSmashExport,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.not.have.been.called;
      chai.expect(fakeEnvironmentGet).to.not.have.been.called;
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeStorageCreate).to.not.have.been.called;
      chai.expect(fakeExecSmashExport).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.app_deletion parameter is not a boolean.');
    }
  });
  it('called with misformed id_application and should reject with ParameterMisformed error.', async () => {
    try {
      await storage_service.exportStorage(
        {
          id_user: 1,
          id_application: 'misformed',
          delete_existing_export: false,
        },
        {
          user_get: fakeUserGet,
          environment_get: fakeEnvironmentGet,
          application_get: fakeApplicationGet,
          storage_create: fakeStorageCreate,
          exec_smash_export: fakeExecSmashExport,
        }
      );
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeUserGet).to.not.have.been.called;
      chai.expect(fakeEnvironmentGet).to.not.have.been.called;
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeStorageCreate).to.not.have.been.called;
      chai.expect(fakeExecSmashExport).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_application parameter is misformed.');
    }
  });
  it('called with good args but the application is currently running', async () => {
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: undefined,
        })
      )
    );
    fakeGetApplicationExport.resolves(
      Promise.resolve(
        new Application_export({
          id_export: null,
          init_date: null,
          id_application: null,
          expiration_date: null,
          id_provider: null,
          download_link: null,
          id_enum_export_state: null,
          status: null,
        })
      )
    );

    fakeApplicationGet.resolves(
      Promise.resolve(
        new Application({
          id_application: 1,
          custom_label: 'Wow ça marche',
          generated_label: 'ulfi-blacky-donkey',
          creation_date: moment.tz(CONFIG.timezone),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'louis-daphne-peheux',
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          id_user: 1,
          id_environment: 1,
          state_application: 'Ready',
          state_changed_date: moment('2199-08-23T12:00:00Z').tz(
            CONFIG.timezone
          ),
          programming_shutdown_date: moment('2199-08-23T12:00:00Z')
            .tz(CONFIG.timezone)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            icon: 'ereteret',
            id_environment: 1,
            label: 'ReactJS',
          }),
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
        })
      )
    );
    try {
      await storage_service.exportStorage(
        {
          id_user: 1,
          id_application: 1,
          delete_existing_export: false,
        },
        {
          user_get: fakeUserGet,
          environment_get: fakeEnvironmentGet,
          get_application_export: fakeGetApplicationExport,
          application_get: fakeApplicationGet,
          storage_create: fakeStorageCreate,
          exec_smash_export: fakeExecSmashExport,
        }
      );
      chai.expect.fail('Expected StorageError error to be thrown');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(StorageError);
      chai
        .expect(err.message)
        .to.equal('The application must be shutdown first.');
    }
  });
  it('called with good args but exec_smash_export fails and logs the error.', async () => {
    // Mock user_get, environment_get, and application_get to resolve successfully
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: undefined,
        })
      )
    );
    fakeGetApplicationExport.resolves(
      Promise.resolve(
        new Application_export({
          id_export: null,
          init_date: null,
          id_application: null,
          expiration_date: null,
          id_provider: null,
          download_link: null,
          id_enum_export_state: null,
          status: null,
        })
      )
    );

    fakeEnvironmentGet.resolves(
      Promise.resolve(
        new Environment({
          id_environment: 1,
          icon: 'ereteret',
          label: 'ReactJS',
          interfaces: [
            new Interface({
              label: 'web-80',
              registry_link: 'image:tag',
              envs: [
                { id_variable_environment: 3, key: 'PUID', value: '1000' },
                { id_variable_environment: 4, key: 'PGID', value: '1000' },
                { id_variable_environment: 34, key: 'HSTORAGE', value: 'true' },
              ],
            }),
            new Interface({
              label: 'ssh-22',
              registry_link: 'image:tag',
              envs: [],
            }),
          ],
        })
      )
    );

    fakeApplicationGet.resolves(
      Promise.resolve(
        new Application({
          id_application: 1,
          custom_label: 'Wow ça marche',
          generated_label: 'ulfi-blacky-donkey',
          creation_date: moment.tz(CONFIG.timezone),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'louis-daphne-peheux',
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          id_user: 1,
          id_environment: 1,
          state_application: 'Off',
          state_changed_date: moment('2199-08-23T12:00:00Z').tz(
            CONFIG.timezone
          ),
          programming_shutdown_date: moment('2199-08-23T12:00:00Z')
            .tz(CONFIG.timezone)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            icon: 'ereteret',
            id_environment: 1,
            label: 'ReactJS',
          }),
        })
      )
    );

    // Mock storage_create to resolve successfully
    fakeStorageCreate.resolves(
      Promise.resolve(
        new Application_export({
          id_export: 1,
          id_application: 1,
          expiration_date: '2025-09-17T09:01:03.000Z',
          id_enum_export_state: 1,
        })
      )
    );

    // Mock exec_smash_export to reject with an error
    const testError = new Error('Smash export failed');
    fakeExecSmashExport.rejects(testError);

    // Mock console.error to verify it is called
    const consoleErrorStub = sinon.stub(console, 'error');

    // Call the function
    const application_export = await storage_service.exportStorage(
      {
        id_user: 1,
        id_application: 1,
        delete_existing_export: false,
      },
      {
        user_get: fakeUserGet,
        environment_get: fakeEnvironmentGet,
        get_application_export: fakeGetApplicationExport,
        application_get: fakeApplicationGet,
        storage_create: fakeStorageCreate,
        exec_smash_export: fakeExecSmashExport,
      }
    );
    chai
      .expect(consoleErrorStub)
      .to.have.been.calledOnceWithExactly(
        'Error executing smash export:',
        testError
      );

    chai.expect(application_export).to.deep.equal(
      new Application_export({
        id_export: 1,
        id_application: 1,
        expiration_date: '2025-09-17T09:01:03.000Z',
        id_enum_export_state: 1,
      })
    );
    consoleErrorStub.restore();
  });

  it('called with misformed delete_existing_export and should reject with ParameterMisformed error.', async () => {
    try {
      await storage_service.exportStorage(
        {
          id_user: 1,
          id_application: 1,
          delete_existing_export: 'not-a-boolean',
        },
        {
          user_get: fakeUserGet,
          environment_get: fakeEnvironmentGet,
          application_get: fakeApplicationGet,
          storage_create: fakeStorageCreate,
          exec_smash_export: fakeExecSmashExport,
        }
      );
      chai.expect.fail('Expected to throw ParameterMisformed, but it did not.');
    } catch (err) {
      chai.expect(fakeUserGet).to.not.have.been.called;
      chai.expect(fakeEnvironmentGet).to.not.have.been.called;
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeStorageCreate).to.not.have.been.called;
      chai.expect(fakeExecSmashExport).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal(
          'The props.delete_existing_export parameter is not a boolean.'
        );
    }
  });

  it('called with good args and delete_existing_export=true when status is Available and should delete previous export.', async () => {
    // Mock user_get, environment_get, and application_get to resolve successfully
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: undefined,
        })
      )
    );

    // Mock existing export with Available status
    fakeGetApplicationExport.resolves(
      Promise.resolve(
        new Application_export({
          id_export: 1,
          init_date: '2025-09-17T09:01:03.000Z',
          id_application: 1,
          expiration_date: '2025-09-17T09:01:03.000Z',
          id_provider: 1,
          download_link: 'https://example.com/download',
          id_enum_export_state: 1,
          status: 'Available',
        })
      )
    );

    fakeEnvironmentGet.resolves(
      Promise.resolve(
        new Environment({
          id_environment: 1,
          icon: 'ereteret',
          label: 'ReactJS',
          interfaces: [
            new Interface({
              label: 'web-80',
              registry_link: 'image:tag',
              envs: [
                { id_variable_environment: 3, key: 'PUID', value: '1000' },
                { id_variable_environment: 4, key: 'PGID', value: '1000' },
                { id_variable_environment: 34, key: 'HSTORAGE', value: 'true' },
              ],
            }),
            new Interface({
              label: 'ssh-22',
              registry_link: 'image:tag',
              envs: [],
            }),
          ],
        })
      )
    );

    fakeApplicationGet.resolves(
      Promise.resolve(
        new Application({
          id_application: 1,
          custom_label: 'Wow ça marche',
          generated_label: 'ulfi-blacky-donkey',
          creation_date: moment.tz(CONFIG.timezone),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'louis-daphne-peheux',
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          id_user: 1,
          id_environment: 1,
          state_application: 'Off',
          state_changed_date: moment('2199-08-23T12:00:00Z').tz(
            CONFIG.timezone
          ),
          programming_shutdown_date: moment('2199-08-23T12:00:00Z')
            .tz(CONFIG.timezone)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            icon: 'ereteret',
            id_environment: 1,
            label: 'ReactJS',
          }),
        })
      )
    );

    // Mock storage_create to resolve successfully
    fakeStorageCreate.resolves(
      Promise.resolve(
        new Application_export({
          id_export: 2, // New export
          id_application: 1,
          expiration_date: '2025-09-17T09:01:03.000Z',
          id_enum_export_state: 1,
        })
      )
    );

    fakeExecSmashExport.resolves(Promise.resolve(true));

    fakeServiceDeleteStorage.resolves(Promise.resolve(true));

    // Call the function with delete_existing_export=true
    const application_export = await storage_service.exportStorage(
      {
        id_user: 1,
        id_application: 1,
        delete_existing_export: true,
      },
      {
        user_get: fakeUserGet,
        environment_get: fakeEnvironmentGet,
        get_application_export: fakeGetApplicationExport,
        application_get: fakeApplicationGet,
        storage_create: fakeStorageCreate,
        exec_smash_export: fakeExecSmashExport,
        service_delete_storage: fakeServiceDeleteStorage,
      }
    );

    // Verify previous export was deleted and new one created
    chai.expect(application_export.previous_export_deleted).to.be.true;
    chai.expect(application_export.id_export).to.equal(2); // New export ID
  });

  it('called with good args but export is in progress (Launched) and should reject with StorageAlreadyExists.', async () => {
    // Mock user_get, environment_get, and application_get to resolve successfully
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: undefined,
        })
      )
    );
    fakeApplicationGet.resolves(
      Promise.resolve(
        new Application({
          id_application: 1,
          custom_label: 'Wow ça marche',
          generated_label: 'ulfi-blacky-donkey',
          creation_date: moment.tz(CONFIG.timezone),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'louis-daphne-peheux',
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          id_user: 1,
          id_environment: 1,
          state_application: 'Off',
          state_changed_date: moment('2199-08-23T12:00:00Z').tz(
            CONFIG.timezone
          ),
          programming_shutdown_date: moment('2199-08-23T12:00:00Z')
            .tz(CONFIG.timezone)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            icon: 'ereteret',
            id_environment: 1,
            label: 'ReactJS',
          }),
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
        })
      )
    );
    // Mock existing export with Launched status
    fakeGetApplicationExport.resolves(
      Promise.resolve(
        new Application_export({
          id_export: 1,
          init_date: '2025-09-17T09:01:03.000Z',
          id_application: 1,
          expiration_date: '2025-09-17T09:01:03.000Z',
          id_provider: 1,
          download_link: 'https://example.com/download',
          id_enum_export_state: 1,
          status: 'Launched',
        })
      )
    );

    try {
      await storage_service.exportStorage(
        {
          id_user: 1,
          id_application: 1,
          delete_existing_export: false,
        },
        {
          user_get: fakeUserGet,
          environment_get: fakeEnvironmentGet,
          get_application_export: fakeGetApplicationExport,
          application_get: fakeApplicationGet,
          storage_create: fakeStorageCreate,
          exec_smash_export: fakeExecSmashExport,
        }
      );
      chai.expect.fail('Expected StorageAlreadyExists error to be thrown');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(StorageAlreadyExists);
      chai
        .expect(err.message)
        .to.equal('Storage already exists for this application.');
    }
  });

  it('called with good args but export is in progress (Exporting) and should reject with StorageAlreadyExists.', async () => {
    // Mock user_get, environment_get, and application_get to resolve successfully
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: undefined,
        })
      )
    );

    fakeApplicationGet.resolves(
      Promise.resolve(
        new Application({
          id_application: 1,
          custom_label: 'Wow ça marche',
          generated_label: 'ulfi-blacky-donkey',
          creation_date: moment.tz(CONFIG.timezone),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'louis-daphne-peheux',
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          id_user: 1,
          id_environment: 1,
          state_application: 'Off',
          state_changed_date: moment('2199-08-23T12:00:00Z').tz(
            CONFIG.timezone
          ),
          programming_shutdown_date: moment('2199-08-23T12:00:00Z')
            .tz(CONFIG.timezone)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            icon: 'ereteret',
            id_environment: 1,
            label: 'ReactJS',
          }),
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
        })
      )
    );

    // Mock existing export with Exporting status
    fakeGetApplicationExport.resolves(
      Promise.resolve(
        new Application_export({
          id_export: 1,
          init_date: '2025-09-17T09:01:03.000Z',
          id_application: 1,
          expiration_date: '2025-09-17T09:01:03.000Z',
          id_provider: 1,
          download_link: 'https://example.com/download',
          id_enum_export_state: 1,
          status: 'Exporting',
        })
      )
    );

    try {
      await storage_service.exportStorage(
        {
          id_user: 1,
          id_application: 1,
          delete_existing_export: true,
        },
        {
          user_get: fakeUserGet,
          environment_get: fakeEnvironmentGet,
          get_application_export: fakeGetApplicationExport,
          application_get: fakeApplicationGet,
          storage_create: fakeStorageCreate,
          exec_smash_export: fakeExecSmashExport,
        }
      );
      chai.expect.fail('Expected StorageAlreadyExists error to be thrown');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(StorageAlreadyExists);
      chai
        .expect(err.message)
        .to.equal(
          'An Export is already in progress. Current status: Exporting'
        );
    }
  });
  it('called with good args but an active SmashExport Exists', async () => {
    fakeUserGet.resolves(
      Promise.resolve(
        new User({
          id_user: 1,
          lastname: 'LEFEBVRE',
          firstname: 'Benoit',
          mail: 'benoit.lefebvre@getcaelus.cloud',
          role: 'PROFESSEUR',
          pwd: undefined,
        })
      )
    );
    fakeGetApplicationExport.resolves(
      Promise.resolve(
        new Application_export({
          id_export: 1,
          init_date: '2025-09-17T09:01:03.000Z',
          id_application: 1,
          expiration_date: '2025-09-17T09:01:03.000Z',
          id_provider: 1,
          download_link: 'https://example.com/download',
          id_enum_export_state: 1,
          status: 'Available',
        })
      )
    );
    fakeEnvironmentGet.resolves(
      Promise.resolve(
        new Environment({
          id_environment: 1,
          icon: 'ereteret',
          label: 'ReactJS',
          interfaces: [
            new Interface({
              label: 'ReactJS',
              envs: [
                { id_variable_environment: 3, key: 'PUID', value: '1000' },
                { id_variable_environment: 4, key: 'PGID', value: '1000' },
                { id_variable_environment: 34, key: 'HSTORAGE', value: 'true' },
              ],
            }),
          ],
        })
      )
    );
    fakeApplicationGet.resolves(
      Promise.resolve(
        new Application({
          id_application: 1,
          custom_label: 'Wow ça marche',
          generated_label: 'ulfi-blacky-donkey',
          creation_date: moment.tz(CONFIG.timezone),
          hash: 'hash12',
          username: 'b_lefebvre',
          password: 'louis-daphne-peheux',
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          id_user: 1,
          id_environment: 1,
          state_application: 'Off',
          state_changed_date: moment('2199-08-23T12:00:00Z').tz(
            CONFIG.timezone
          ),
          programming_shutdown_date: moment('2199-08-23T12:00:00Z')
            .tz(CONFIG.timezone)
            .add(CONFIG.expiration, 's'),
          environment: new Environment({
            icon: 'ereteret',
            id_environment: 1,
            label: 'ReactJS',
          }),
        })
      )
    );
    try {
      await storage_service.exportStorage(
        {
          id_user: 1,
          id_application: 1,
          delete_existing_export: false,
        },
        {
          user_get: fakeUserGet,
          environment_get: fakeEnvironmentGet,
          application_get: fakeApplicationGet,
          get_application_export: fakeGetApplicationExport,
          storage_create: fakeStorageCreate,
          exec_smash_export: fakeExecSmashExport,
        }
      );
      chai.expect.fail('Expected StorageAlreadyExists error to be thrown');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(StorageAlreadyExists);
      chai
        .expect(err.message)
        .to.equal('Storage already exists for this application.');
      chai.expect(fakeUserGet).to.have.been.calledOnceWithExactly({
        id_user: 1,
      });
      chai.expect(fakeApplicationGet).to.have.been.calledOnceWithExactly({
        id_application: 1,
      });
      chai.expect(fakeGetApplicationExport).to.have.been.calledOnceWithExactly({
        id_application: 1,
      });
      chai.expect(fakeEnvironmentGet).to.not.have.been.called;
      chai.expect(fakeStorageCreate).to.not.have.been.called;
      chai.expect(fakeExecSmashExport).to.not.have.been.called;
    }
  });
});

describe('storage.service.deleteStorage()', () => {
  let fakeExportGet,
    fakeApplicationGet,
    fakeExecSmashDeletion,
    fakeStorageRevokation,
    fakeStorageError;

  beforeEach(() => {
    fakeExportGet = sinon.stub();
    fakeApplicationGet = sinon.stub();
    fakeExecSmashDeletion = sinon.stub();
    fakeStorageRevokation = sinon.stub();
    fakeStorageError = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good args and should successfully delete the storage.', async () => {
    // Mock successful responses
    const mockExport = {
      id_export: 1,
      id_application: 1,
      id_provider: 'provider123',
    };

    const mockApplication = {
      id_application: 1,
    };

    const mockDeletionResponse = {
      transfer: {
        status: 'Deleting',
      },
    };

    fakeExportGet.resolves(Promise.resolve(mockExport));
    fakeApplicationGet.resolves(Promise.resolve(mockApplication));
    fakeExecSmashDeletion.resolves(Promise.resolve(mockDeletionResponse));
    fakeStorageRevokation.resolves(Promise.resolve(true));

    const result = await storage_service.deleteStorage(
      {
        id_user: 1,
        id_export: 1,
        id_application: 1,
      },
      {
        export_get: fakeExportGet,
        application_get: fakeApplicationGet,
        exec_smash_deletion: fakeExecSmashDeletion,
        storage_revokation: fakeStorageRevokation,
        storage_error: fakeStorageError,
      }
    );

    chai.expect(result).to.equal(true);
    chai.expect(fakeExportGet).to.have.been.calledOnceWithExactly({
      id_export: 1,
    });
    chai.expect(fakeApplicationGet).to.have.been.calledOnceWithExactly({
      id_application: 1,
    });
    chai.expect(fakeExecSmashDeletion).to.have.been.calledOnceWithExactly({
      transfer_id: 'provider123',
    });
    chai.expect(fakeStorageRevokation).to.have.been.calledOnceWithExactly({
      id_export: 1,
    });
  });

  it('called with missing arguments and should reject with MissingArgument error.', async () => {
    try {
      await storage_service.deleteStorage(
        {
          id_user: 1,
          id_export: 1,
        },
        {
          export_get: fakeExportGet,
          application_get: fakeApplicationGet,
          exec_smash_deletion: fakeExecSmashDeletion,
          storage_revokation: fakeStorageRevokation,
          storage_error: fakeStorageError,
        }
      );
      chai.expect.fail(
        'Expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeExportGet).to.not.have.been.called;
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeExecSmashDeletion).to.not.have.been.called;
      chai.expect(fakeStorageRevokation).to.not.have.been.called;
      chai.expect(fakeStorageError).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_application) are missing.');
    }
  });

  it('called with misformed id_export and should reject with ParameterMisformed error.', async () => {
    try {
      await storage_service.deleteStorage(
        {
          id_user: 1,
          id_export: 'misformed',
          id_application: 1,
        },
        {
          export_get: fakeExportGet,
          application_get: fakeApplicationGet,
          exec_smash_deletion: fakeExecSmashDeletion,
          storage_revokation: fakeStorageRevokation,
          storage_error: fakeStorageError,
        }
      );
      chai.expect.fail('Expected to throw ParameterMisformed, but it did not.');
    } catch (err) {
      chai.expect(fakeExportGet).to.not.have.been.called;
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeExecSmashDeletion).to.not.have.been.called;
      chai.expect(fakeStorageRevokation).to.not.have.been.called;
      chai.expect(fakeStorageError).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_export parameter is misformed.');
    }
  });

  it('called with misformed id_application and should reject with ParameterMisformed error.', async () => {
    try {
      await storage_service.deleteStorage(
        {
          id_user: 1,
          id_export: 1,
          id_application: 'misformed',
        },
        {
          export_get: fakeExportGet,
          application_get: fakeApplicationGet,
          exec_smash_deletion: fakeExecSmashDeletion,
          storage_revokation: fakeStorageRevokation,
          storage_error: fakeStorageError,
        }
      );
      chai.expect.fail('Expected to throw ParameterMisformed, but it did not.');
    } catch (err) {
      chai.expect(fakeExportGet).to.not.have.been.called;
      chai.expect(fakeApplicationGet).to.not.have.been.called;
      chai.expect(fakeExecSmashDeletion).to.not.have.been.called;
      chai.expect(fakeStorageRevokation).to.not.have.been.called;
      chai.expect(fakeStorageError).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_application parameter is misformed.');
    }
  });

  it('called with mismatched application id and should reject with ParameterMisformed error.', async () => {
    // Mock responses where application id doesn't match
    const mockExport = {
      id_export: 1,
      id_application: 2, // Different from the one in props
    };

    const mockApplication = {
      id_application: 2,
    };

    fakeExportGet.resolves(Promise.resolve(mockExport));
    fakeApplicationGet.resolves(Promise.resolve(mockApplication));

    try {
      await storage_service.deleteStorage(
        {
          id_user: 1,
          id_export: 1,
          id_application: 1, // Different from the one in export
        },
        {
          export_get: fakeExportGet,
          application_get: fakeApplicationGet,
          exec_smash_deletion: fakeExecSmashDeletion,
          storage_revokation: fakeStorageRevokation,
          storage_error: fakeStorageError,
        }
      );
      chai.expect.fail('Expected to throw ParameterMisformed, but it did not.');
    } catch (err) {
      chai.expect(fakeExportGet).to.have.been.calledOnceWithExactly({
        id_export: 1,
      });
      chai.expect(fakeApplicationGet).to.have.been.calledOnceWithExactly({
        id_application: 2,
      });
      chai.expect(fakeExecSmashDeletion).to.not.have.been.called;
      chai.expect(fakeStorageRevokation).to.not.have.been.called;
      chai.expect(fakeStorageError).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal(
          'The props.id_application parameter does not match the export id.'
        );
    }
  });

  it('called with good args but Smash API returns 404 and should set error state.', async () => {
    // Mock responses
    const mockExport = {
      id_export: 1,
      id_application: 1,
      id_provider: 'provider123',
    };

    const mockApplication = {
      id_application: 1,
    };

    const mockDeletionResponse = {
      code: 403,
      error: 'Forbidden to remove transfer on state Deleted',
    };

    fakeExportGet.resolves(Promise.resolve(mockExport));
    fakeApplicationGet.resolves(Promise.resolve(mockApplication));
    fakeExecSmashDeletion.resolves(Promise.resolve(mockDeletionResponse));
    fakeStorageError.resolves(Promise.resolve(true));

    try {
      await storage_service.deleteStorage(
        {
          id_user: 1,
          id_export: 1,
          id_application: 1,
        },
        {
          export_get: fakeExportGet,
          application_get: fakeApplicationGet,
          exec_smash_deletion: fakeExecSmashDeletion,
          storage_revokation: fakeStorageRevokation,
          storage_error: fakeStorageError,
        }
      );
      chai.expect.fail('Expected to throw SmashAPIError, but it did not.');
    } catch (err) {
      chai.expect(fakeExportGet).to.have.been.calledOnceWithExactly({
        id_export: 1,
      });
      chai.expect(fakeApplicationGet).to.have.been.calledOnceWithExactly({
        id_application: 1,
      });
      chai.expect(fakeExecSmashDeletion).to.have.been.calledOnceWithExactly({
        transfer_id: 'provider123',
      });
      chai.expect(fakeStorageError).to.have.been.calledOnceWithExactly({
        id_export: 1,
      });
      chai.expect(fakeStorageRevokation).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(SmashAPIError);
      chai
        .expect(err.message)
        .to.equal(
          'Smash code: 403, Forbidden to remove transfer on state Deleted'
        );
      chai.expect(err.code).to.equal(500);
    }
  });
  it('called with good args but Smash API returns 403 and should set error state.', async () => {
    // Mock responses
    const mockExport = {
      id_export: 1,
      id_application: 1,
      id_provider: 'provider123',
    };

    const mockApplication = {
      id_application: 1,
    };

    const mockDeletionResponse = {
      code: 404,
      error: 'Transfer provider123 not found',
    };

    fakeExportGet.resolves(Promise.resolve(mockExport));
    fakeApplicationGet.resolves(Promise.resolve(mockApplication));
    fakeExecSmashDeletion.resolves(Promise.resolve(mockDeletionResponse));
    fakeStorageError.resolves(Promise.resolve(true));

    try {
      await storage_service.deleteStorage(
        {
          id_user: 1,
          id_export: 1,
          id_application: 1,
        },
        {
          export_get: fakeExportGet,
          application_get: fakeApplicationGet,
          exec_smash_deletion: fakeExecSmashDeletion,
          storage_revokation: fakeStorageRevokation,
          storage_error: fakeStorageError,
        }
      );
      chai.expect.fail('Expected to throw SmashAPIError, but it did not.');
    } catch (err) {
      chai.expect(fakeExportGet).to.have.been.calledOnceWithExactly({
        id_export: 1,
      });
      chai.expect(fakeApplicationGet).to.have.been.calledOnceWithExactly({
        id_application: 1,
      });
      chai.expect(fakeExecSmashDeletion).to.have.been.calledOnceWithExactly({
        transfer_id: 'provider123',
      });
      chai.expect(fakeStorageError).to.have.been.calledOnceWithExactly({
        id_export: 1,
      });
      chai.expect(fakeStorageRevokation).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(SmashAPIError);
      chai
        .expect(err.message)
        .to.equal('Smash code: 404, Transfer provider123 not found');
      chai.expect(err.code).to.equal(500);
    }
  });
  it('called with good args but Smash API returns 500 and should set error state.', async () => {
    // Mock responses
    const mockExport = {
      id_export: 1,
      id_application: 1,
      id_provider: 'provider123',
    };

    const mockApplication = {
      id_application: 1,
    };

    const mockDeletionResponse = {
      code: 500,
      error: 'Internal Server Error',
    };

    fakeExportGet.resolves(Promise.resolve(mockExport));
    fakeApplicationGet.resolves(Promise.resolve(mockApplication));
    fakeExecSmashDeletion.resolves(Promise.resolve(mockDeletionResponse));
    fakeStorageError.resolves(Promise.resolve(true));

    try {
      await storage_service.deleteStorage(
        {
          id_user: 1,
          id_export: 1,
          id_application: 1,
        },
        {
          export_get: fakeExportGet,
          application_get: fakeApplicationGet,
          exec_smash_deletion: fakeExecSmashDeletion,
          storage_revokation: fakeStorageRevokation,
          storage_error: fakeStorageError,
        }
      );
      chai.expect.fail('Expected to throw SmashAPIError, but it did not.');
    } catch (err) {
      chai.expect(fakeExportGet).to.have.been.calledOnceWithExactly({
        id_export: 1,
      });
      chai.expect(fakeApplicationGet).to.have.been.calledOnceWithExactly({
        id_application: 1,
      });
      chai.expect(fakeExecSmashDeletion).to.have.been.calledOnceWithExactly({
        transfer_id: 'provider123',
      });
      chai.expect(fakeStorageError).to.have.been.calledOnceWithExactly({
        id_export: 1,
      });
      chai.expect(fakeStorageRevokation).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(SmashAPIError);
      chai
        .expect(err.message)
        .to.equal('Smash code: 500, Internal Server Error');
      chai.expect(err.code).to.equal(500);
    }
  });
  it('called with good args but Smash API returns 401 and should set error state.', async () => {
    // Mock responses
    const mockExport = {
      id_export: 1,
      id_application: 1,
      id_provider: 'provider123',
    };

    const mockApplication = {
      id_application: 1,
    };

    const mockDeletionResponse = {
      code: 401,
      message: 'Unauthorized',
    };

    fakeExportGet.resolves(Promise.resolve(mockExport));
    fakeApplicationGet.resolves(Promise.resolve(mockApplication));
    fakeExecSmashDeletion.resolves(Promise.resolve(mockDeletionResponse));
    fakeStorageError.resolves(Promise.resolve(true));

    try {
      await storage_service.deleteStorage(
        {
          id_user: 1,
          id_export: 1,
          id_application: 1,
        },
        {
          export_get: fakeExportGet,
          application_get: fakeApplicationGet,
          exec_smash_deletion: fakeExecSmashDeletion,
          storage_revokation: fakeStorageRevokation,
          storage_error: fakeStorageError,
        }
      );
      chai.expect.fail('Expected to throw SmashAPIError, but it did not.');
    } catch (err) {
      chai.expect(fakeExportGet).to.have.been.calledOnceWithExactly({
        id_export: 1,
      });
      chai.expect(fakeApplicationGet).to.have.been.calledOnceWithExactly({
        id_application: 1,
      });
      chai.expect(fakeExecSmashDeletion).to.have.been.calledOnceWithExactly({
        transfer_id: 'provider123',
      });
      chai.expect(fakeStorageRevokation).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(SmashAPIError);
      chai.expect(err.message).to.equal('Smash code: 401, Unauthorized');
      chai.expect(err.code).to.equal(500);
    }
  });
  it('called with good args but Smash API returns Unknown error and should set error state.', async () => {
    // Mock responses
    const mockExport = {
      id_export: 1,
      id_application: 1,
      id_provider: 'provider123',
    };

    const mockApplication = {
      id_application: 1,
    };

    const mockDeletionResponse = {
      code: 443,
      message: 'Dunno',
    };

    fakeExportGet.resolves(Promise.resolve(mockExport));
    fakeApplicationGet.resolves(Promise.resolve(mockApplication));
    fakeExecSmashDeletion.resolves(Promise.resolve(mockDeletionResponse));
    fakeStorageError.resolves(Promise.resolve(true));

    try {
      await storage_service.deleteStorage(
        {
          id_user: 1,
          id_export: 1,
          id_application: 1,
        },
        {
          export_get: fakeExportGet,
          application_get: fakeApplicationGet,
          exec_smash_deletion: fakeExecSmashDeletion,
          storage_revokation: fakeStorageRevokation,
          storage_error: fakeStorageError,
        }
      );
      chai.expect.fail('Expected to throw SmashAPIError, but it did not.');
    } catch (err) {
      chai.expect(fakeExportGet).to.have.been.calledOnceWithExactly({
        id_export: 1,
      });
      chai.expect(fakeApplicationGet).to.have.been.calledOnceWithExactly({
        id_application: 1,
      });
      chai.expect(fakeExecSmashDeletion).to.have.been.calledOnceWithExactly({
        transfer_id: 'provider123',
      });
      chai.expect(fakeStorageRevokation).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(SmashAPIError);
      chai
        .expect(err.message)
        .to.equal('Smash code: 500, Something went wrong contacting SmashAPI');
      chai.expect(err.code).to.equal(500);
    }
  });
});
