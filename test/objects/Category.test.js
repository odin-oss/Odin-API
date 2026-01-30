import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { Environment } from '../../src/objects/Environment.js';
import { Category } from '../../src/objects/Category.js';
chai.use(sinonChai);

describe('<object> Category', () => {
  it('creates and checks value of Category object.', () => {
    const category = new Category({
      id_category: 3,
      label: 'Bases de données',
      environments: [
        new Environment({
          id_environment: 1,
          label: 'envi',
          icon: 'ereteret',
          interfaces: [],
        }),
      ],
      google_material_icon: 'shield',
    });
    chai.expect(category.id_category).to.be.equal(3);
    chai.expect(category.label).to.be.equal('Bases de données');
    chai.expect(category.environments).to.deep.equal([
      new Environment({
        id_environment: 1,
        label: 'envi',
        icon: 'ereteret',
        interfaces: [],
      }),
    ]);
    chai.expect(category.google_material_icon).to.deep.equal('shield');
  });
  it('creates, updates and checks value of Category object.', () => {
    const category = new Category({
      id_category: 3,
      label: 'Bases de données',
      environments: [
        new Environment({
          id_environment: 1,
          label: 'envi',
          icon: 'ereteret',
          interfaces: [],
        }),
      ],
      google_material_icon: 'shield',
    });
    chai.expect(category.id_category).to.be.equal(3);
    chai.expect(category.label).to.be.equal('Bases de données');
    chai.expect(category.environments).to.deep.equal([
      new Environment({
        id_environment: 1,
        label: 'envi',
        icon: 'ereteret',
        interfaces: [],
      }),
    ]);
    chai.expect(category.google_material_icon).to.deep.equal('shield');
    category.id_category = 2;
    category.label = 'test';
    category.environments = [
      new Environment({
        id_environment: 5,
        label: 'nope',
        icon: 'ereteret',
        interfaces: [],
      }),
    ];
    category.google_material_icon = 'sunny';
    chai.expect(category.id_category).to.be.equal(2);
    chai.expect(category.label).to.be.equal('test');
    chai.expect(category.environments).to.deep.equal([
      new Environment({
        id_environment: 5,
        label: 'nope',
        icon: 'ereteret',
        interfaces: [],
      }),
    ]);
    chai.expect(category.google_material_icon).to.deep.equal('sunny');
  });
  it('creates and checks value of toJSON and public_format object.', () => {
    const category = new Category({
      id_category: 3,
      label: 'Bases de données',
      environments: [
        new Environment({
          id_environment: 1,
          label: 'envi',
          icon: 'ereteret',
          interfaces: [],
        }),
      ],
      google_material_icon: 'shield',
    });
    chai.expect(category.id_category).to.be.equal(3);
    chai.expect(category.label).to.be.equal('Bases de données');
    chai.expect(category.environments).to.deep.equal([
      new Environment({
        id_environment: 1,
        label: 'envi',
        icon: 'ereteret',
        interfaces: [],
      }),
    ]);
    chai.expect(category.google_material_icon).to.deep.equal('shield');
    chai.expect(category.toJSON()).to.deep.equal({
      id_category: 3,
      label: 'Bases de données',
      google_material_icon: 'shield',
      environments: [
        {
          id_environment: 1,
          label: 'envi',
          interfaces: [],
          icon: 'ereteret',
        },
      ],
    });
    chai.expect(category.public_format()).to.deep.equal({
      id_category: 3,
      label: 'Bases de données',
      google_material_icon: 'shield',
      environments: [
        {
          id_environment: 1,
          label: 'envi',
          interfaces: [],
          icon: 'ereteret',
        },
      ],
    });
  });
});
