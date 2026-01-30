import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import { ImageType } from '../../src/objects/Image_type.js';
chai.use(sinonChai);

describe('<object> ImageType', () => {
  it('creates, updates and checks value of ImageType object.', () => {
    const type = new ImageType({
      id_type: 2,
      label: 'image',
    });
    chai.expect(type.id_type).to.be.equal(2);
    chai.expect(type.label).to.be.equal('image');
    type.id_type = 3;
    type.label = 'type';
    chai.expect(type.id_type).to.be.equal(3);
    chai.expect(type.label).to.be.equal('type');
    chai.expect(type.toJSON()).to.deep.equal({
      id_type: 3,
      label: 'type',
    });
  });
});
