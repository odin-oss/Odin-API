import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { User } from '../../src/objects/User.js';
chai.use(sinonChai);

describe('<object> User', () => {
  it('creates and checks values of User test', () => {
    const user = new User({
      id_user: 3,
      lastname: 'LEFEBVRE',
      firstname: 'Ulfi',
      mail: 'ulfi.lefebvre@getcaelus.cloud',
      role: 'PROFESSEUR',
      pwd: 'whatthehellisthat',
    });
    chai.expect(user.id_user).to.be.eql(3);
    chai.expect(user.lastname).to.be.eql('LEFEBVRE');
    chai.expect(user.firstname).to.be.eql('Ulfi');
    chai.expect(user.mail).to.be.eql('ulfi.lefebvre@getcaelus.cloud');
    chai.expect(user.role).to.be.eql('PROFESSEUR');
    chai.expect(user.pwd).to.be.eql('whatthehellisthat');
    chai.expect(user.toJSON()).to.deep.eql({
      id_user: 3,
      lastname: 'LEFEBVRE',
      firstname: 'Ulfi',
      mail: 'ulfi.lefebvre@getcaelus.cloud',
      role: 'PROFESSEUR',
    });
    chai.expect(user.public_format()).to.deep.eql({
      id_user: 3,
      lastname: 'LEFEBVRE',
      firstname: 'Ulfi',
      mail: 'ulfi.lefebvre@getcaelus.cloud',
      role: 'PROFESSEUR',
    });
  });
  it('creates, updates and checks values of User test', () => {
    const user = new User({
      id_user: 3,
      lastname: 'LEFEBVRE',
      firstname: 'Ulfi',
      mail: 'ulfi.lefebvre@getcaelus.cloud',
      role: 'PROFESSEUR',
      pwd: 'whatthehellisthat',
    });
    user.id_user = 4;
    user.lastname = 'VIEILLARD';
    user.firstname = 'Louis';
    user.mail = 'louis.vieillard@getcaelus.cloud';
    user.role = 'ETUDIANT';
    user.pwd = 'keepdreaming';

    chai.expect(user.id_user).to.be.eql(4);
    chai.expect(user.lastname).to.be.eql('VIEILLARD');
    chai.expect(user.firstname).to.be.eql('Louis');
    chai.expect(user.mail).to.be.eql('louis.vieillard@getcaelus.cloud');
    chai.expect(user.role).to.be.eql('ETUDIANT');
    chai.expect(user.pwd).to.be.eql('keepdreaming');
  });
});
