import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as environment_builder from '../../src/builders/environment.builder.js';
import { Environment } from '../../src/objects/Environment.js';
import { Interface } from '../../src/objects/Interface.js';
import db from '../../src/config/db.config.js';
import Sequelize from 'sequelize';
import {
  DBConnexionRefused,
  MissingArgumentError,
  ParameterMisformed,
} from '../../src/utils/errors.service.js';
chai.use(sinonChai);

describe('environment.builder.list()', () => {
  let fakeFindAll;
  beforeEach(() => {
    fakeFindAll = sinon.stub(db.cirrus.ENVIRONMENT_HAS_INTERFACE, 'findAll');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called and should return a list of Environment objects.', async () => {
    fakeFindAll.resolves([
      {
        INTERFACE: {
          IMAGE_TYPE: {
            id_type: 1,
            label: 'OS',
          },
          id_interface: 2,
          label: 'Alpine319',
          registry_link:
            'registry.gitlab.com/caelus-team/application-cirrus/applications/linux-alpine-3.19:recette',
          exec_command: '/bin/sh',
          service_command: 'sh /var/launch.sh',
          privileged: false,
          readiness_probe_initial_delay: 5,
          liveness_probe_initial_delay: 200,
          readiness_probe_period: 10,
          liveness_probe_period: 20,
        },
        id_environment: 1,
        label: 'ALPINE',
        ENVIRONMENT: {
          icon: 'ereteret',
        },
      },
      {
        INTERFACE: {
          IMAGE_TYPE: {
            id_type: 2,
            label: 'GUI',
          },
          id_interface: 46,
          label: 'SSHTerm',
          registry_link:
            'registry.gitlab.com/caelus-team/application-cirrus/applications/terminalssh:recette',
          exec_command: '/bin/bash',
          service_command: '',
          privileged: false,
          readiness_probe_initial_delay: 5,
          liveness_probe_initial_delay: 200,
          readiness_probe_period: 10,
          liveness_probe_period: 20,
        },
        id_environment: 1,
        label: 'ALPINE',
        ENVIRONMENT: {
          icon: 'ereteret',
        },
      },
    ]);
    const result = await environment_builder.list();
    chai.expect(result).to.deep.equal([
      new Environment({
        id_environment: 1,
        label: 'ALPINE',
        icon: 'ereteret',
        interfaces: [
          new Interface({
            id_interface: 2,
            label: 'Alpine319',
            registry_link:
              'registry.gitlab.com/caelus-team/application-cirrus/applications/linux-alpine-3.19:recette',
            exec_command: '/bin/sh',
            service_command: 'sh /var/launch.sh',
            privileged: false,
            readiness_probe_initial_delay: 5,
            liveness_probe_initial_delay: 200,
            readiness_probe_period: 10,
            liveness_probe_period: 20,
            id_type: 2,
            label_type_image: 'GUI',
            args: [],
            node_selectors: [],
            ports: [],
            envs: [],
          }),
          new Interface({
            id_interface: 46,
            label: 'SSHTerm',
            registry_link:
              'registry.gitlab.com/caelus-team/application-cirrus/applications/terminalssh:recette',
            exec_command: '/bin/bash',
            service_command: '',
            privileged: false,
            readiness_probe_initial_delay: 5,
            liveness_probe_initial_delay: 200,
            readiness_probe_period: 10,
            liveness_probe_period: 20,
            id_type: 1,
            label_type_image: 'OS',
            args: [],
            node_selectors: [],
            ports: [],
            envs: [],
          }),
        ],
      }),
    ]);
    chai.expect(fakeFindAll).to.have.been.calledOnceWithExactly({
      include: [
        {
          model: db.cirrus.ENVIRONMENT,
          required: true,
        },
        {
          model: db.cirrus.INTERFACE,
          required: true,
          include: [
            {
              model: db.cirrus.IMAGE_TYPE,
              required: true,
            },
          ],
        },
      ],
    });
  });
  it('called and should reject with DBConnexionRefused error.', async () => {
    try {
      fakeFindAll.resolves(
        Promise.reject(
          new Sequelize.ConnectionRefusedError(new Error('connexion refused'))
        )
      );
      await environment_builder.list();
      chai.expect.fail(
        'chai.expected to throw DBConnexionRefused, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindAll).to.have.been.calledOnceWithExactly({
        include: [
          {
            model: db.cirrus.ENVIRONMENT,
            required: true,
          },
          {
            model: db.cirrus.INTERFACE,
            required: true,
            include: [
              {
                model: db.cirrus.IMAGE_TYPE,
                required: true,
              },
            ],
          },
        ],
      });
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
      chai.expect(err.message).to.equal('Connexion to the database refused.');
    }
  });
});
describe('environment.builder.get()', () => {
  let fakeFindAll;
  beforeEach(() => {
    fakeFindAll = sinon.stub(db.cirrus.ENVIRONMENT_HAS_INTERFACE, 'findAll');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good argument and should return a detailled Environment object.', async () => {
    fakeFindAll.resolves(
      Promise.resolve([
        {
          id_environment: 1,
          label: 'ALPINE',
          ENVIRONMENT: {
            icon: 'ereteret',
          },
          INTERFACE: {
            id_interface: 1,
            label: 'Alpine318',
            registry_link:
              'registry.gitlab.com/caelus-team/application-cirrus/applications/linux-alpine-3.18:recette',
            exec_command: '/bin/sh',
            service_command: 'sh /var/launch.sh',
            privileged: false,
            readiness_probe_initial_delay: 5,
            liveness_probe_initial_delay: 200,
            readiness_probe_period: 10,
            liveness_probe_period: 20,
            IMAGE_TYPE: {
              id_type: 1,
              label: 'linux',
            },
            INTERFACE_HAS_ARGUMENTs: [
              {
                id_argument: 1,
                ARGUMENT: {
                  value: '-v',
                },
              },
            ],
            INTERFACE_HAS_NODE_SELECTORs: [
              {
                id_node_selector: 1,
                NODE_SELECTOR: {
                  key: 'crrs',
                  value: 'master',
                },
              },
            ],
            INTERFACE_HAS_PORTs: [
              {
                id_port_type: 10,
                port: 3000,
                label: 'SSH',
                PORT_TYPE: {
                  label: 'TERMINAL',
                },
              },
            ],
            INTERFACE_HAS_VARIABLEs: [
              {
                id_variable_environment: 12,
                VARIABLE_ENVIRONMENT: {
                  key: 'USER',
                  value: 'ulfi',
                },
              },
            ],
          },
        },
        {
          id_environment: 1,
          label: 'ALPINE',
          icon: 'ereteret',
          INTERFACE: {
            id_interface: 46,
            label: 'SSHTerm',
            registry_link:
              'registry.gitlab.com/caelus-team/application-cirrus/applications/terminalssh:recette',
            exec_command: '/bin/bash',
            service_command: '',
            privileged: false,
            readiness_probe_initial_delay: 5,
            liveness_probe_initial_delay: 200,
            readiness_probe_period: 10,
            liveness_probe_period: 20,
            IMAGE_TYPE: {
              id_type: 1,
              label: 'linux',
            },
            INTERFACE_HAS_ARGUMENTs: [],
            INTERFACE_HAS_NODE_SELECTORs: [],
            INTERFACE_HAS_PORTs: [],
            INTERFACE_HAS_VARIABLEs: [],
          },
        },
      ])
    );
    const result = await environment_builder.get({
      id_environment: 1,
    });
    chai.expect(result).to.deep.equal(
      new Environment({
        id_environment: 1,
        label: 'Alpine',
        icon: 'ereteret',
        interfaces: [
          new Interface({
            id_interface: 1,
            label: 'Alpine318',
            registry_link:
              'registry.gitlab.com/caelus-team/application-cirrus/applications/linux-alpine-3.18:recette',
            exec_command: '/bin/sh',
            service_command: 'sh /var/launch.sh',
            privileged: false,
            readiness_probe_initial_delay: 5,
            liveness_probe_initial_delay: 200,
            readiness_probe_period: 10,
            liveness_probe_period: 20,
            id_type: 1,
            label_type_image: 'linux',
            args: [
              {
                id_argument: 1,
                value: '-v',
              },
            ],
            envs: [
              {
                id_variable_environment: 12,
                key: 'USER',
                value: 'ulfi',
              },
            ],
            node_selectors: [
              {
                id_node_selector: 1,
                key: 'crrs',
                value: 'master',
              },
            ],
            ports: [
              {
                id_port_type: 10,
                port: 3000,
                label: 'SSH',
                port_type: 'TERMINAL',
              },
            ],
          }),
          new Interface({
            id_interface: 46,
            label: 'SSHTerm',
            registry_link:
              'registry.gitlab.com/caelus-team/application-cirrus/applications/terminalssh:recette',
            exec_command: '/bin/bash',
            service_command: '',
            privileged: false,
            readiness_probe_initial_delay: 5,
            liveness_probe_initial_delay: 200,
            readiness_probe_period: 10,
            liveness_probe_period: 20,
            id_type: 1,
            label_type_image: 'linux',
            args: [],
            envs: [],
            node_selectors: [],
            ports: [],
          }),
        ],
      })
    );
    chai.expect(fakeFindAll).to.have.been.calledOnceWithExactly({
      where: { id_environment: 1 },
      include: [
        {
          model: db.cirrus.ENVIRONMENT,
          required: true,
        },
        {
          model: db.cirrus.INTERFACE,
          required: true,
          include: [
            {
              model: db.cirrus.IMAGE_TYPE,
              required: true,
            },
            {
              model: db.cirrus.INTERFACE_HAS_ARGUMENT,
              include: [
                {
                  model: db.cirrus.ARGUMENT,
                  order: [['id_argument', 'DESC']],
                },
              ],
            },
            {
              model: db.cirrus.INTERFACE_HAS_NODE_SELECTOR,
              include: [
                {
                  model: db.cirrus.NODE_SELECTOR,
                },
              ],
            },
            {
              model: db.cirrus.INTERFACE_HAS_PORT,
              include: [
                {
                  model: db.cirrus.PORT_TYPE,
                },
              ],
            },
            {
              model: db.cirrus.INTERFACE_HAS_VARIABLE,
              include: [
                {
                  model: db.cirrus.VARIABLE_ENVIRONMENT,
                },
              ],
            },
          ],
        },
      ],
    });
  });
  it('called and should reject with DBConnexionRefused error.', async () => {
    try {
      fakeFindAll.resolves(
        Promise.reject(
          new Sequelize.ConnectionRefusedError(new Error('connexion refused'))
        )
      );
      await environment_builder.get({
        id_environment: 1,
      });
      chai.expect.fail(
        'chai.expected to throw DBConnexionRefused, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindAll).to.have.been.calledOnceWithExactly({
        where: { id_environment: 1 },
        include: [
          {
            model: db.cirrus.ENVIRONMENT,
            required: true,
          },
          {
            model: db.cirrus.INTERFACE,
            required: true,
            include: [
              {
                model: db.cirrus.IMAGE_TYPE,
                required: true,
              },
              {
                model: db.cirrus.INTERFACE_HAS_ARGUMENT,
                include: [
                  {
                    model: db.cirrus.ARGUMENT,
                    order: [['id_argument', 'DESC']],
                  },
                ],
              },
              {
                model: db.cirrus.INTERFACE_HAS_NODE_SELECTOR,
                include: [
                  {
                    model: db.cirrus.NODE_SELECTOR,
                  },
                ],
              },
              {
                model: db.cirrus.INTERFACE_HAS_PORT,
                include: [
                  {
                    model: db.cirrus.PORT_TYPE,
                  },
                ],
              },
              {
                model: db.cirrus.INTERFACE_HAS_VARIABLE,
                include: [
                  {
                    model: db.cirrus.VARIABLE_ENVIRONMENT,
                  },
                ],
              },
            ],
          },
        ],
      });
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
      chai.expect(err.message).to.equal('Connexion to the database refused.');
    }
  });
  it('called without id_environment and should reject with MissingArgumentError error.', async () => {
    try {
      await environment_builder.get({});
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindAll).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_environment) are missing.');
    }
  });
  it('called with a misformed id_environment and should reject with ParameterMisformed error.', async () => {
    try {
      await environment_builder.get({
        id_environment: 'misformed',
      });
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindAll).to.not.have.been.called;
      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_environment parameter is misformed.');
    }
  });
});
