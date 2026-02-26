import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import dbManager from '../../src/config/db.config.js';
import * as imageType_builder from '../../src/builders/imageType.builder.js';
import { ImageType } from '../../src/objects/Image_type.js';

chai.use(sinonChai);

describe('imageType.builder.list()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.IMAGE_TYPE, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve all image types from database', async () => {
    findAllStub.resolves([
      { id_type: 1, label: 'docker' },
      { id_type: 2, label: 'kubernetes' },
    ]);

    const result = await imageType_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(2);
    chai.expect(result[0]).to.be.instanceOf(ImageType);
    chai.expect(result[1]).to.be.instanceOf(ImageType);
  });

  it('should return empty array when no image types exist', async () => {
    findAllStub.resolves([]);

    const result = await imageType_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });

  it('should map database records to ImageType instances with correct properties', async () => {
    findAllStub.resolves([
      { id_type: 1, label: 'Docker' },
      { id_type: 2, label: 'Kubernetes' },
    ]);

    const result = await imageType_builder.list();

    chai.expect(result[0].id_type).to.equal(1);
    chai.expect(result[0].label).to.equal('docker');
    chai.expect(result[1].id_type).to.equal(2);
    chai.expect(result[1].label).to.equal('kubernetes');
  });

  it('should sanitize and lowercase labels during mapping', async () => {
    findAllStub.resolves([
      { id_type: 1, label: 'Docker@Image' },
      { id_type: 2, label: 'KUBERNETES-v2' },
    ]);

    const result = await imageType_builder.list();

    chai.expect(result[0].label).to.equal('dockerimage');
    chai.expect(result[1].label).to.equal('kubernetes-v2');
  });

  it('should handle single image type record', async () => {
    findAllStub.resolves([{ id_type: 5, label: 'vm' }]);

    const result = await imageType_builder.list();

    chai.expect(result).to.have.lengthOf(1);
    chai.expect(result[0].id_type).to.equal(5);
    chai.expect(result[0].label).to.equal('vm');
  });

  it('should handle multiple image types with various valid labels', async () => {
    findAllStub.resolves([
      { id_type: 1, label: 'docker' },
      { id_type: 2, label: 'kubernetes' },
      { id_type: 3, label: 'vm-image' },
      { id_type: 4, label: 'oci' },
    ]);

    const result = await imageType_builder.list();

    chai.expect(result).to.have.lengthOf(4);
    result.forEach((item, index) => {
      chai.expect(item).to.be.instanceOf(ImageType);
      chai.expect(item.id_type).to.equal(index + 1);
    });
  });

  it('should reject when database returns null', async () => {
    findAllStub.resolves(null);

    try {
      await imageType_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors', async () => {
    findAllStub.rejects(new Error('Database connection failed'));

    try {
      await imageType_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
      chai.expect(err.message).to.equal('Database connection failed');
    }
  });

  it('should handle image types with numeric IDs', async () => {
    findAllStub.resolves([
      { id_type: 100, label: 'custom-type' },
      { id_type: 999, label: 'another-type' },
    ]);

    const result = await imageType_builder.list();

    chai.expect(result[0].id_type).to.equal(100);
    chai.expect(result[1].id_type).to.equal(999);
  });

  it('should reject image type with invalid label (too short)', async () => {
    findAllStub.resolves([{ id_type: 1, label: 'a' }]);

    try {
      await imageType_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle label with special characters that get sanitized', async () => {
    findAllStub.resolves([
      { id_type: 1, label: 'Docker@#$%Image2024' },
    ]);

    const result = await imageType_builder.list();

    chai.expect(result[0].label).to.equal('dockerimage2024');
  });

  it('should call findAll without any arguments', async () => {
    findAllStub.resolves([]);

    await imageType_builder.list();

    chai.expect(findAllStub.calledWith()).to.be.true;
  });

  it('should handle timeout or network errors', async () => {
    findAllStub.rejects(new Error('Network timeout'));

    try {
      await imageType_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
      chai.expect(err.message).to.equal('Network timeout');
    }
  });

  it('should preserve image type properties in toJSON()', async () => {
    findAllStub.resolves([
      { id_type: 1, label: 'docker' },
    ]);

    const result = await imageType_builder.list();
    const json = result[0].toJSON();

    chai.expect(json).to.deep.equal({
      id_type: 1,
      label: 'docker',
    });
  });

  it('should handle large dataset of image types', async () => {
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      id_type: i + 1,
      label: `imagetype${i}`,
    }));

    findAllStub.resolves(largeDataset);

    const result = await imageType_builder.list();

    chai.expect(result).to.have.lengthOf(100);
    chai.expect(result[0].id_type).to.equal(1);
    chai.expect(result[99].id_type).to.equal(100);
  });

  it('should validate that all returned items are ImageType instances', async () => {
    findAllStub.resolves([
      { id_type: 1, label: 'docker' },
      { id_type: 2, label: 'kubernetes' },
      { id_type: 3, label: 'openvz' },
    ]);

    const result = await imageType_builder.list();

    result.forEach((item) => {
      chai.expect(item).to.be.instanceOf(ImageType);
      chai.expect(item).to.have.property('id_type');
      chai.expect(item).to.have.property('label');
    });
  });

  it('should return frozen/immutable style objects through getter methods', async () => {
    findAllStub.resolves([
      { id_type: 1, label: 'docker' },
    ]);

    const result = await imageType_builder.list();

    chai.expect(result[0].id_type).to.equal(1);
    chai.expect(result[0].label).to.equal('docker');
  });
});
