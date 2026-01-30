import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as category_builder from '../../src/builders/category.builder.js';
import { Category } from '../../src/objects/Category.js';
import { Environment } from '../../src/objects/Environment.js';
import db from '../../src/config/db.config.js';
import Sequelize from 'sequelize';
import { DBConnexionRefused } from '../../src/utils/errors.service.js';
chai.use(sinonChai);

describe('category.builder.list()', () => {
  let fakeFindAll;
  beforeEach(() => {
    fakeFindAll = sinon.stub(db.cirrus.ENVIRONMENT_HAS_CATEGORY, 'findAll');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called with good args and should get a list of Category.', async () => {
    fakeFindAll.resolves(
      Promise.resolve([
        {
          CATEGORY: {
            id_category: 3,
            google_material_icon: 'database',
            label: 'Base de données',
          },
          ENVIRONMENT: {
            id_environment: 1,
            label: 'NOSQL',
          },
        },
        {
          CATEGORY: {
            id_category: 3,
            google_material_icon: 'database',
            label: 'Base de données',
          },
          ENVIRONMENT: {
            id_environment: 2,
            label: 'MYSQL',
          },
        },
        {
          CATEGORY: {
            id_category: 1,
            google_material_icon: 'web',
            label: 'ReactJS',
          },
          ENVIRONMENT: {
            id_environment: 3,
            label: 'ReactJS 16',
          },
        },
      ])
    );
    const result = await category_builder.list();
    chai.expect(result).to.be.deep.equal([
      new Category({
        id_category: 3,
        label: 'Base de données',
        google_material_icon: 'database',
        environments: [
          new Environment({
            id_environment: 1,
            label: 'NOSQL',
            icon: 'ereteret',
            interfaces: [],
          }),
          new Environment({
            id_environment: 2,
            label: 'MYSQL',
            icon: 'ereteret',
            interfaces: [],
          }),
        ],
      }),
      new Category({
        id_category: 1,
        label: 'ReactJS',
        google_material_icon: 'web',
        environments: [
          new Environment({
            id_environment: 3,
            label: 'ReactJS 16',
            icon: 'ereteret',
            interfaces: [],
          }),
        ],
      }),
    ]);
    chai.expect(fakeFindAll).to.have.been.calledOnceWithExactly({
      include: [
        {
          model: db.cirrus.CATEGORY,
          required: true,
        },
        {
          model: db.cirrus.ENVIRONMENT,
          required: true,
        },
      ],
      order: [
        [{ model: db.cirrus.CATEGORY }, 'label', 'ASC'],
        [{ model: db.cirrus.ENVIRONMENT }, 'label', 'ASC'],
      ],
    });
  });
  it('called but findAll reject with Sequelize.ConnectionRefusedError.', async () => {
    try {
      fakeFindAll.resolves(
        Promise.reject(
          new Sequelize.ConnectionRefusedError(new Error('cannot connect'))
        )
      );
      await category_builder.list();
      chai.expect.fail(
        'chai.expected to throw DBConnexionRefused, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeFindAll).to.have.been.calledOnceWithExactly({
        include: [
          {
            model: db.cirrus.CATEGORY,
            required: true,
          },
          {
            model: db.cirrus.ENVIRONMENT,
            required: true,
          },
        ],
        order: [
          [{ model: db.cirrus.CATEGORY }, 'label', 'ASC'],
          [{ model: db.cirrus.ENVIRONMENT }, 'label', 'ASC'],
        ],
      });
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
      chai.expect(err.message).to.equal('Connexion to the database refused.');
    }
  });
});
