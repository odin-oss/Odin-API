import * as interface_builder from '../../src/builders/interface.builder.js';
import db from '../../src/config/db.config.js';
import {
  DBObjectNotFound,
  MissingArgumentError,
  ParameterMisformed,
} from '../../src/utils/errors.service.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Interface } from '../../src/objects/Interface.js';
chai.use(sinonChai);

describe('interface.builder.get()', () => {
  let fakeFindOne;
  beforeEach(() => {
    fakeFindOne = sinon.stub(db.cirrus.INTERFACE, 'findOne');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with id_interface and should send back an Interface Object.', async () => {
    fakeFindOne.resolves({
      id_interface: 5,
      label: 'Blender',
      registry_link:
        'registry.gitlab.com/caelus-team/application-cirrus/applications/blender:recette',
      exec_command: '/bin/bash',
      service_command: '/init',
      privileged: false,
      readiness_probe_initial_delay: 5,
      liveness_probe_initial_delay: 200,
      readiness_probe_period: 10,
      liveness_probe_period: 20,
      IMAGE_TYPE: {
        id_type: 4,
        label: 'kasm',
      },
      INTERFACE_HAS_ARGUMENTs: [
        {
          id_argument: 7,
          ARGUMENT: {
            value: '/bin/sh -c tail -f /dev/null',
          },
        },
      ],
      INTERFACE_HAS_NODE_SELECTORs: [
        {
          id_node_selector: 1,
          NODE_SELECTOR: {
            key: 'node-role.kubernetes.io/crrs',
            value: 'default',
          },
        },
        {
          id_node_selector: 2,
          NODE_SELECTOR: {
            key: 'node-role.kubernetes.io/crrs',
            value: 'kasm',
          },
        },
      ],
      INTERFACE_HAS_PORTs: [
        {
          id_port_type: 1,
          port: 3000,
          label: 'App',
          PORT_TYPE: {
            label: 'GUI',
          },
        },
      ],
      INTERFACE_HAS_VARIABLEs: [
        {
          id_variable_environment: 3,
          VARIABLE_ENVIRONMENT: {
            key: 'PUID',
            value: '1000',
          },
        },
        {
          id_variable_environment: 4,
          VARIABLE_ENVIRONMENT: {
            key: 'PGID',
            value: '1000',
          },
        },
        {
          id_variable_environment: 35,
          VARIABLE_ENVIRONMENT: {
            key: 'TZ',
            value: 'Europe/Paris',
          },
        },
        {
          id_variable_environment: 36,
          VARIABLE_ENVIRONMENT: {
            key: 'SUBFOLDER',
            value: '/',
          },
        },
      ],
    });

    const result = await interface_builder.get({
      id_interface: 5,
    });
    chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
      where: { id_interface: 5 },
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
    });
    chai.expect(result).to.deep.equal(
      new Interface({
        id_interface: 5,
        label: 'Blender',
        registry_link:
          'registry.gitlab.com/caelus-team/application-cirrus/applications/blender:recette',
        exec_command: '/bin/bash',
        service_command: '/init',
        privileged: false,
        readiness_probe_initial_delay: 5,
        liveness_probe_initial_delay: 200,
        readiness_probe_period: 10,
        liveness_probe_period: 20,
        id_type: 4,
        label_type_image: 'kasm',
        args: [{ id_argument: 7, value: '/bin/sh -c tail -f /dev/null' }],
        envs: [
          { id_variable_environment: 3, key: 'PUID', value: '1000' },
          { id_variable_environment: 4, key: 'PGID', value: '1000' },
          { id_variable_environment: 35, key: 'TZ', value: 'Europe/Paris' },
          { id_variable_environment: 36, key: 'SUBFOLDER', value: '/' },
        ],
        node_selectors: [
          {
            id_node_selector: 1,
            key: 'node-role.kubernetes.io/crrs',
            value: 'default',
          },
          {
            id_node_selector: 2,
            key: 'node-role.kubernetes.io/crrs',
            value: 'kasm',
          },
        ],
        ports: [
          { id_port_type: 1, port: 3000, label: 'App', port_type: 'GUI' },
        ],
      })
    );
  });
  it('called with not existing id_interface and should send back a DBObjectNotFound.', async () => {
    try {
      fakeFindOne.resolves(null);

      await interface_builder.get({
        id_interface: 300,
      });
      chai.expect.fail(
        'chai.expected to throw DBObjectNotFound, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.have.been.called;
      chai.expect(fakeFindOne).to.have.been.calledOnceWithExactly({
        where: { id_interface: 300 },
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
      });
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
      chai.expect(err.message).to.equal('The interface could not be found.');
    }
  });
  it('called with no id_interface and should send back a MissingArgumentError.', async () => {
    try {
      await interface_builder.get({});
      chai.expect.fail(
        'chai.expected to throw MissingArgumentError, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;

      chai.expect(err).to.be.instanceOf(MissingArgumentError);
      chai
        .expect(err.message)
        .to.equal('One or multiple arguments (id_interface) are missing.');
    }
  });
  it('called with misformed id_interface and should send back a ParameterMisformed.', async () => {
    try {
      await interface_builder.get({ id_interface: 'misformed' });
      chai.expect.fail(
        'chai.expected to throw ParameterMisformed, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindOne).to.not.have.been.called;

      chai.expect(err).to.be.instanceOf(ParameterMisformed);
      chai
        .expect(err.message)
        .to.equal('The props.id_interface parameter is misformed.');
    }
  });
});
