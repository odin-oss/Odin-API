import Sequelize from 'sequelize';
import * as image_type_builder from '../../src/builders/image_type.builder.js';
import { ImageType } from '../../src/objects/Image_type.js';
import { DBConnexionRefused } from '../../src/utils/errors.service.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import db from '../../src/config/db.config.js';
chai.use(sinonChai);

describe('image_type.builder.list()', () => {
  let fakeFindAll;
  beforeEach(() => {
    fakeFindAll = sinon.stub(db.cirrus.IMAGE_TYPE, 'findAll');
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called and should return a list of Type_Image.', async () => {
    fakeFindAll.resolves([
      { id_type: 1, label: 'linux' },
      { id_type: 2, label: 'windows' },
      { id_type: 3, label: 'macosx' },
      { id_type: 4, label: 'kasm' },
    ]);
    const result = await image_type_builder.list();

    chai
      .expect(result)
      .to.be.deep.equal([
        new ImageType({ id_type: 1, label: 'linux' }),
        new ImageType({ id_type: 2, label: 'windows' }),
        new ImageType({ id_type: 3, label: 'macosx' }),
        new ImageType({ id_type: 4, label: 'kasm' }),
      ]);
    chai.expect(fakeFindAll).to.have.been.calledOnce;
  });
  it('called on empty database and should return an empty list of Type_Image.', async () => {
    fakeFindAll.resolves([]);
    const result = await image_type_builder.list();

    chai.expect(result).to.be.deep.equal([]);
    chai.expect(fakeFindAll).to.have.been.calledOnce;
  });
  it('called on not connected database and should reject with DBConnexionRefused error.', async () => {
    try {
      fakeFindAll.resolves(
        Promise.reject(
          new Sequelize.ConnectionRefusedError(
            'Error during connexion to the database.'
          )
        )
      );
      await image_type_builder.list();
      chai.expect.fail(
        'chai.expected to throw DBConnexionRefused, but it did not.'
      );
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
      chai
        .expect(err.message)
        .to.be.equal('Connexion to the database refused.');
    }
  });
});
