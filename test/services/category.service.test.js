import * as category_service from '../../src/services/category.service.js';
import { Category } from '../../src/objects/Category.js';
import { DBConnexionRefused } from '../../src/utils/errors.service.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Environment } from '../../src/objects/Environment.js';
chai.use(sinonChai);

describe('category.service.list()', () => {
  let fakeCategoryList;
  beforeEach(() => {
    fakeCategoryList = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called and should return the list of Category.', async () => {
    fakeCategoryList.resolves(
      Promise.resolve([
        new Category({
          id_category: 1,
          label: 'Développement web',
          environments: [
            new Environment({
              id_environment: 4,
              icon: 'ereteret',
              label: 'NodeJS',
              interfaces: [],
            }),
            new Environment({
              id_environment: 1,
              label: 'ReactJS',
              icon: 'ereteret',
              interfaces: [],
            }),
          ],
        }),
        new Category({
          id_category: 2,
          label: 'Jeux vidéos',
          environments: [
            new Environment({
              id_environment: 3,
              icon: 'ereteret',
              label: 'GTA V',
              interfaces: [],
            }),
            new Environment({
              id_environment: 2,
              icon: 'ereteret',
              label: 'It Takes Two',
              interfaces: [],
            }),
          ],
        }),
      ])
    );
    const result = await category_service.list({
      category_list: fakeCategoryList,
    });
    chai.expect(result).to.deep.equal([
      new Category({
        id_category: 1,
        label: 'Développement web',
        environments: [
          new Environment({
            id_environment: 4,
            icon: 'ereteret',
            label: 'NodeJS',
            interfaces: [],
          }),
          new Environment({
            id_environment: 1,
            icon: 'ereteret',
            label: 'ReactJS',
            interfaces: [],
          }),
        ],
      }),
      new Category({
        id_category: 2,
        label: 'Jeux vidéos',
        environments: [
          new Environment({
            id_environment: 3,
            icon: 'ereteret',
            label: 'GTA V',
            interfaces: [],
          }),
          new Environment({
            id_environment: 2,
            icon: 'ereteret',
            label: 'It Takes Two',
            interfaces: [],
          }),
        ],
      }),
    ]);
    chai.expect(fakeCategoryList).to.have.been.calledOnce;
  });
  it('should throw the DBConnexionRefused error.', async () => {
    try {
      fakeCategoryList.resolves(
        Promise.reject(
          new DBConnexionRefused('Connexion to the database refused.')
        )
      );
      await category_service.list({ category_list: fakeCategoryList });
      chai.expect.fail(
        'chai.expected to throw DBConnexionRefused, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeCategoryList).to.have.been.calledOnce;
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
      chai.expect(err.message).to.equal('Connexion to the database refused.');
    }
  });
});
