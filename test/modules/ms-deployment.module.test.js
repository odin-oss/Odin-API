import * as msdeployment from '../../src/modules/ms-deployment.module.js';
import { Environment } from '../../src/objects/Environment.js';
import { Interface } from '../../src/objects/Interface.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import fs from 'fs';
import https from 'https';
import CONFIG from '../../src/config/config.js';
import { Datacenter } from '../../src/objects/Datacenter.js';
chai.use(sinonChai);

describe('ms-deployment.module.exec_shutdown()', () => {
  let fakeDeploymentModule, saveCONFIG;
  beforeEach(() => {
    fakeDeploymentModule = sinon.stub();
    saveCONFIG = CONFIG;
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.ms_deployment_activated = saveCONFIG.ms_deployment_activated;
  });
  it('called with ms_deployment_activated on false and should say it is.', async () => {
    CONFIG.ms_deployment_activated = false;
    const result = await Promise.resolve(
      msdeployment.exec_shutdown(
        { hash: 'hash12' },
        { deployment_module: fakeDeploymentModule }
      )
    );
    chai.expect(result).to.be.equal('MS-Deployment have been disabled');
    chai.expect(fakeDeploymentModule).to.not.have.been.called;
  });
  it('called with good arguments and should execute shutdown.', async () => {
    CONFIG.ms_deployment_activated = true;
    fakeDeploymentModule.resolves(
      Promise.resolve({
        json: () => {
          return {
            result: 'Application stopped',
          };
        },
      })
    );
    const result = await Promise.resolve(
      msdeployment.exec_shutdown(
        {
          hash: 'hash12',
          datacenter: new Datacenter({
            id_datacenter: 1,
            provider: 'prov',
            label: 'testdc',
            city: 'paradise',
          }),
        },
        { deployment_module: fakeDeploymentModule }
      )
    );
    chai.expect(fakeDeploymentModule).to.have.been.calledOnceWithExactly({
      datacenter: new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      }),
      route: `/deploy/off`,
      method: 'put',
      body: {
        hash: 'hash12',
      },
    });
    chai.expect(result).to.be.deep.equal({
      result: 'Application stopped',
    });
  });
});
describe('ms-deployment.module.exec_start()', () => {
  let fakeDeploymentModule, saveCONFIG;
  beforeEach(() => {
    fakeDeploymentModule = sinon.stub();
    saveCONFIG = CONFIG;
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.ms_deployment_activated = saveCONFIG.ms_deployment_activated;
  });
  it('called with ms_deployment_activated on false and should say it is.', async () => {
    CONFIG.ms_deployment_activated = false;
    const result = await Promise.resolve(
      msdeployment.exec_start(
        { hash: 'hash12' },
        { deployment_module: fakeDeploymentModule }
      )
    );
    chai.expect(result).to.be.equal('MS-Deployment have been disabled');
    chai.expect(fakeDeploymentModule).to.not.have.been.called;
  });
  it('called with good arguments and should execute starting.', async () => {
    CONFIG.ms_deployment_activated = true;
    fakeDeploymentModule.resolves(
      Promise.resolve({
        json: () => {
          return {
            result: 'Application started',
          };
        },
      })
    );
    const result = await Promise.resolve(
      msdeployment.exec_start(
        {
          hash: 'hash12',
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
        },
        { deployment_module: fakeDeploymentModule }
      )
    );
    chai.expect(fakeDeploymentModule).to.have.been.calledOnceWithExactly({
      route: `/deploy/on`,
      datacenter: new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      }),
      method: 'put',
      body: {
        hash: 'hash12',
      },
    });
    chai.expect(result).to.be.deep.equal({
      result: 'Application started',
    });
  });
});
describe('ms-deployment.module.exec_deletion()', () => {
  let fakeDeploymentModule, saveCONFIG;
  beforeEach(() => {
    fakeDeploymentModule = sinon.stub();
    saveCONFIG = CONFIG;
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.ms_deployment_activated = saveCONFIG.ms_deployment_activated;
  });
  it('called with ms_deployment_activated on false and should say it is.', async () => {
    CONFIG.ms_deployment_activated = false;
    const result = await Promise.resolve(
      msdeployment.exec_deletion(
        { hash: 'hash12' },
        { deployment_module: fakeDeploymentModule }
      )
    );
    chai.expect(result).to.be.equal('MS-Deployment have been disabled');
    chai.expect(fakeDeploymentModule).to.not.have.been.called;
  });
  it('called with good arguments and should execute starting.', async () => {
    CONFIG.ms_deployment_activated = true;
    fakeDeploymentModule.resolves(
      Promise.resolve({
        json: () => {
          return {
            result: 'Application started',
          };
        },
      })
    );
    const result = await Promise.resolve(
      msdeployment.exec_deletion(
        {
          hash: 'hash12',
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
        },
        { deployment_module: fakeDeploymentModule }
      )
    );
    chai.expect(fakeDeploymentModule).to.have.been.calledOnceWithExactly({
      route: `/deploy/delete`,
      datacenter: new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      }),
      method: 'delete',
      body: {
        hash: 'hash12',
      },
    });
    chai.expect(result).to.be.deep.equal({
      result: 'Application started',
    });
  });
});
describe('ms-deployment.module.deployment_module()', () => {
  let fakeFetch, saveCONFIG, readFileSyncStub, agentStub;
  beforeEach(() => {
    readFileSyncStub = sinon.stub(fs, 'readFileSync').returns('fake-data');
    agentStub = sinon.stub(https, 'Agent').returns({ fakeAgent: true });
    fakeFetch = sinon.stub();
    saveCONFIG = CONFIG;
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.env = saveCONFIG.env;
    CONFIG.ms_deployment_activated = saveCONFIG.ms_deployment_activated;
    CONFIG.mtls_ms_deployment_port = saveCONFIG.mtls_ms_deployment_port;
    CONFIG.unsafe_ms_deployment_adress = saveCONFIG.unsafe_ms_deployment_adress;
    CONFIG.unsafe_ms_deployment_method = saveCONFIG.unsafe_ms_deployment_method;
    CONFIG.unsafe_ms_deployment_port = saveCONFIG.unsafe_ms_deployment_port;
  });
  it('called in local mode and should execute it well.', async () => {
    CONFIG.env = 'local';
    CONFIG.unsafe_ms_deployment_adress = 'localhost';
    CONFIG.unsafe_ms_deployment_method = 'http';
    CONFIG.unsafe_ms_deployment_port = '10002';
    fakeFetch.resolves(
      Promise.resolve({
        result: 'ok',
      })
    );
    const result = await Promise.resolve(
      msdeployment.default(
        {
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          route: '/deploy/on',
          method: 'post',
          body: {
            hash: 'hash12',
          },
        },
        { fetch: fakeFetch }
      )
    );
    chai.expect(result).to.be.deep.equal({
      result: 'ok',
    });
    chai
      .expect(fakeFetch)
      .to.have.been.calledOnceWithExactly(`http://localhost:10002/deploy/on`, {
        method: 'post',
        body: JSON.stringify({ hash: 'hash12' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  });
  it('called in prod mode and should execute it well.', async () => {
    CONFIG.env = 'prod';
    CONFIG.mtls_ms_deployment_port = '33333';
    fakeFetch.resolves(
      Promise.resolve({
        result: 'ok',
      })
    );
    const result = await Promise.resolve(
      msdeployment.default(
        {
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
          route: '/deploy/on',
          method: 'post',
          body: {
            hash: 'hash12',
          },
        },
        { fetch: fakeFetch }
      )
    );
    chai.expect(result).to.be.deep.equal({
      result: 'ok',
    });
    chai
      .expect(fakeFetch)
      .to.have.been.calledOnceWithExactly(
        `https://api.testdc.prov.crrs.cloud:33333/deploy/on`,
        {
          agent: { fakeAgent: true },
          method: 'post',
          body: JSON.stringify({ hash: 'hash12' }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  });
});
describe('ms-deployment.module.exec_smash_export()', () => {
  let fakeDeploymentModule, saveCONFIG;
  beforeEach(() => {
    fakeDeploymentModule = sinon.stub();
    saveCONFIG = CONFIG;
  });
  afterEach(() => {
    sinon.restore();
    CONFIG.ms_deployment_activated = saveCONFIG.ms_deployment_activated;
  });
  it('called with ms_deployment_activated on false and should say it is.', async () => {
    CONFIG.ms_deployment_activated = false;
    const result = await Promise.resolve(
      msdeployment.exec_smash_export(
        { hash: 'hash12' },
        { deployment_module: fakeDeploymentModule }
      )
    );
    chai.expect(result).to.be.equal('MS-Deployment have been disabled');
    chai.expect(fakeDeploymentModule).to.not.have.been.called;
  });
  it('called with good arguments and should execute Smash export.', async () => {
    CONFIG.ms_deployment_activated = true;
    fakeDeploymentModule.resolves(
      Promise.resolve({
        json: () => {
          return {
            result: 'Smash export created',
          };
        },
      })
    );
    const result = await Promise.resolve(
      msdeployment.exec_smash_export(
        {
          hash: 'hash12',
          app_deletion: false,
          upload_id: 1,
          label: 'monlabel',
          folder_path: '/home/b_lefebvre',
          storage_carrier_image:
            'registry.gitlab.com/caelus-team/application-cirrus/storage-carrier',
          storage_carrier_image_tag: 'test-14',
          smash_api_key: 'my_api_key',
          smash_region: 'eu-west-3',
          smash_teamid: 'id_smash_teamid',
          web_title: 'my_web_title',
          upload_description: 'upload description',
          export_language: 'fr',
          availability: '1',
          sender_name: 'noreply Odin by Caelus',
          sender_email: 'oreply-odin@getcaelus.cloud',
          receiver_email: 'benoit.lefebvre@getcaelus.cloud',
          datacenter: new Datacenter({
            id_datacenter: 1,
            label: 'testdc',
            provider: 'prov',
            city: 'paradise',
          }),
        },
        { deployment_module: fakeDeploymentModule }
      )
    );
    chai.expect(fakeDeploymentModule).to.have.been.calledOnceWithExactly({
      route: `/storage/export/smash`,
      method: 'post',
      datacenter: new Datacenter({
        id_datacenter: 1,
        label: 'testdc',
        provider: 'prov',
        city: 'paradise',
      }),
      body: {
        hash: 'hash12',
        upload_id: 1,
        app_deletion: false,
        label: 'monlabel',
        folder_path: '/home/b_lefebvre',
        storage_carrier_image:
          'registry.gitlab.com/caelus-team/application-cirrus/storage-carrier',
        storage_carrier_image_tag: 'test-14',
        smash_api_key: 'my_api_key',
        smash_region: 'eu-west-3',
        smash_teamid: 'id_smash_teamid',
        web_title: 'my_web_title',
        upload_description: 'upload description',
        export_language: 'fr',
        availability: '1',
        sender_name: 'noreply Odin by Caelus',
        sender_email: 'oreply-odin@getcaelus.cloud',
        receiver_email: 'benoit.lefebvre@getcaelus.cloud',
      },
    });
    chai.expect(result).to.be.deep.equal({
      result: 'Smash export created',
    });
  });
});
