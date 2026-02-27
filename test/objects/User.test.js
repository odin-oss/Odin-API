import * as chai from 'chai';
import { User } from '../../src/objects/User.js';

describe('User object', () => {
  it('creates with valid properties', () => {
    const user = new User({
      id_user: 1,
      lastname: 'Doe',
      firstname: 'Jane',
      mail: 'jane.doe@example.com',
      role: 'ETUDIANT',
      pwd: 'password123',
    });

    chai.expect(user.id_user).to.equal(1);
    chai.expect(user.lastname).to.equal('Doe');
    chai.expect(user.firstname).to.equal('Jane');
    chai.expect(user.mail).to.equal('jane.doe@example.com');
    chai.expect(user.role).to.equal('ETUDIANT');
  });

  it('throws on invalid email', () => {
    chai
      .expect(() => {
        new User({ mail: 'not-an-email' });
      })
      .to.throw();
  });

  it('throws on invalid role', () => {
    chai
      .expect(() => {
        new User({ role: 'INVALID' });
      })
      .to.throw();
  });

  it('serializes with public_format', () => {
    const user = new User({
      id_user: 5,
      lastname: 'Doe',
      firstname: 'John',
      mail: 'john.doe@example.com',
      role: 'PROFESSEUR',
    });

    chai.expect(user.public_format()).to.deep.equal({
      id_user: 5,
      lastname: 'Doe',
      firstname: 'John',
      mail: 'john.doe@example.com',
      role: 'PROFESSEUR',
    });
  });

  it('serializes with toJSON', () => {
    const user = new User({
      id_user: 10,
      lastname: 'Smith',
      firstname: 'Alice',
      mail: 'alice.smith@example.com',
      role: 'ADMINISTRATEUR',
      pwd: 'secret123',
    });

    const json = user.toJSON();
    chai.expect(json.id_user).to.equal(10);
    chai.expect(json.lastname).to.equal('Smith');
    chai.expect(json.firstname).to.equal('Alice');
    chai.expect(json.mail).to.equal('alice.smith@example.com');
    chai.expect(json.role).to.equal('ADMINISTRATEUR');
  });
});
