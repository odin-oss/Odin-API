import * as chai from 'chai';
import { UserRole } from '../../src/objects/UserRole.js';

describe('UserRole object', () => {
  it('creates with valid properties', () => {
    const role = new UserRole({ id_role: 1, label: 'admin' });

    chai.expect(role.id_role).to.equal(1);
    chai.expect(role.label).to.equal('admin');
  });

  it('throws on non-positive id_role', () => {
    chai
      .expect(() => {
        new UserRole({ id_role: 0, label: 'user' });
      })
      .to.throw();
  });

  it('serializes to JSON', () => {
    const role = new UserRole({ id_role: 2, label: 'editor' });

    chai.expect(role.toJSON()).to.deep.equal({
      id_role: 2,
      label: 'editor',
    });
  });
});
