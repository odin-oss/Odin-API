import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { UserRole } from '../../src/objects/UserRole.js';
chai.use(sinonChai);

describe('<object> UserRole', () => {
  it('creates and checks value of UserRole object.', () => {
    const ur = new UserRole({
      id_role: 3,
      label: 'ADMINISTRATEUR',
    });
    chai.expect(ur.id_role).to.be.equal(3);
    chai.expect(ur.label).to.be.equal('ADMINISTRATEUR');
  });
  it('creates, updates and checks value of Category object.', () => {
    const ur = new UserRole({
      id_role: 3,
      label: 'ADMINISTRATEUR',
    });
    ur.id_role = 2;
    ur.label = 'ETUDIANT';

    chai.expect(ur.id_role).to.be.equal(2);
    chai.expect(ur.label).to.be.equal('ETUDIANT');
  });
  it('creates and checks value of toJSON and public_format object.', () => {
    const ur = new UserRole({
      id_role: 3,
      label: 'PROFESSEUR',
    });
    chai.expect(ur.id_role).to.be.equal(3);
    chai.expect(ur.label).to.be.equal('PROFESSEUR');
    chai.expect(ur.toJSON()).to.deep.equal({
      id_role: 3,
      label: 'PROFESSEUR',
    });
    chai.expect(ur.public_format()).to.deep.equal({
      id_role: 3,
      label: 'PROFESSEUR',
    });
  });
});
