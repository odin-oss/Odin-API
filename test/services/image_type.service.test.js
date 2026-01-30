import * as image_type_service from '../../src/services/image_type.service.js';
import { ImageType } from '../../src/objects/Image_type.js';
import { DBConnexionRefused } from '../../src/utils/errors.service.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('image_type.service.list()', () => {
  let fakeImageTypeList;
  beforeEach(() => {
    fakeImageTypeList = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it('called and should return the list of ImageType.', async () => {
    fakeImageTypeList.resolves(
      Promise.resolve([
        new ImageType({ id_type: 1, label: 'linux' }),
        new ImageType({ id_type: 2, label: 'windows' }),
        new ImageType({ id_type: 3, label: 'macosx' }),
        new ImageType({ id_type: 4, label: 'kasm' }),
      ])
    );
    const result = await image_type_service.list({
      image_type_list: fakeImageTypeList,
    });
    chai.expect(fakeImageTypeList).to.have.been.calledOnce;
    chai
      .expect(result)
      .to.deep.equal([
        new ImageType({ id_type: 1, label: 'linux' }),
        new ImageType({ id_type: 2, label: 'windows' }),
        new ImageType({ id_type: 3, label: 'macosx' }),
        new ImageType({ id_type: 4, label: 'kasm' }),
      ]);
  });
  it('should throw the DBConnexionRefused error.', async () => {
    try {
      fakeImageTypeList.resolves(
        Promise.reject(
          new DBConnexionRefused('Connexion to the database refused.')
        )
      );
      await image_type_service.list({ image_type_list: fakeImageTypeList });
      chai.expect.fail(
        'chai.expected to throw DBConnexionRefused, but it did not.'
      );
    } catch (err) {
      chai.expect(fakeImageTypeList).to.have.been.calledOnce;
      chai.expect(err).to.be.instanceOf(DBConnexionRefused);
      chai.expect(err.message).to.equal('Connexion to the database refused.');
    }
  });
});
