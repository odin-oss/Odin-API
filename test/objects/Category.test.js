import * as chai from 'chai';
import { Category } from '../../src/objects/Category.js';
import { Environment } from '../../src/objects/Environment.js';

describe('Category object', () => {
  it('creates with valid properties', () => {
    const category = new Category({
      id_category: 1,
      label: 'Development Tools',
      google_material_icon: 'code',
      environments: [],
    });

    chai.expect(category.id_category).to.equal(1);
    chai.expect(category.label).to.equal('Development Tools');
    chai.expect(category.google_material_icon).to.equal('code');
    chai.expect(category.environments).to.be.an('array');
  });

  it('throws on non-positive id_category', () => {
    chai
      .expect(() => {
        new Category({
          id_category: 0,
          label: 'Test',
          google_material_icon: 'icon',
        });
      })
      .to.throw();
  });

  it('throws on empty label', () => {
    chai
      .expect(() => {
        new Category({
          id_category: 1,
          label: '',
          google_material_icon: 'icon',
        });
      })
      .to.throw();
  });

  it('serializes with environments array', () => {
    const env = new Environment({
      id_environment: 5,
      label: 'Production',
      icon: 'cloud',
    });

    const category = new Category({
      id_category: 2,
      label: 'Analytics',
      google_material_icon: 'analytics',
      environments: [env],
    });

    const json = category.toJSON();
    chai.expect(json.id_category).to.equal(2);
    chai.expect(json.label).to.equal('Analytics');
    chai.expect(json.environments).to.be.an('array');
    chai.expect(json.environments).to.have.lengthOf(1);
  });

  it('serializes with public_format', () => {
    const category = new Category({
      id_category: 3,
      label: 'Databases',
      google_material_icon: 'storage',
      environments: [],
    });

    const format = category.public_format();
    chai.expect(format.id_category).to.equal(3);
    chai.expect(format.google_material_icon).to.equal('storage');
    chai.expect(format.environments).to.be.an('array');
  });
});
