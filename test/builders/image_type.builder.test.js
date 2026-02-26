import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import dbManager from '../../src/config/db.config.js';
import * as image_type_builder from '../../src/builders/image_type.builder.js';
import { ImageType } from '../../src/objects/Image_type.js';

chai.use(sinonChai);

describe('image_type.builder.list()', () => {
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

  it('should retrieve all image types and return ImageType instances', async () => {
    findAllStub.resolves([
      { id_type: 1, label: 'docker' },
      { id_type: 2, label: 'kubernetes' },
    ]);

    const result = await image_type_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array').with.lengthOf(2);
    chai.expect(result[0]).to.be.instanceOf(ImageType);
    chai.expect(result[1]).to.be.instanceOf(ImageType);
  });

  it('should correctly map database results to ImageType properties', async () => {
    findAllStub.resolves([
      { id_type: 1, label: 'docker' },
    ]);

    const result = await image_type_builder.list();

    chai.expect(result[0].id_type).to.equal(1);
    chai.expect(result[0].label).to.equal('docker');
  });

  it('should return empty array when no image types exist', async () => {
    findAllStub.resolves([]);

    const result = await image_type_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array').with.lengthOf(0);
  });

  it('should handle multiple image types with different properties', async () => {
    findAllStub.resolves([
      { id_type: 1, label: 'docker' },
      { id_type: 2, label: 'virtualbox' },
      { id_type: 3, label: 'vmware' },
    ]);

    const result = await image_type_builder.list();

    chai.expect(result).to.have.lengthOf(3);
    chai.expect(result[0].id_type).to.equal(1);
    chai.expect(result[0].label).to.equal('docker');
    chai.expect(result[1].id_type).to.equal(2);
    chai.expect(result[1].label).to.equal('virtualbox');
    chai.expect(result[2].id_type).to.equal(3);
    chai.expect(result[2].label).to.equal('vmware');
  });

  it('should handle database connection errors', async () => {
    findAllStub.rejects(new Error('Database connection failed'));

    try {
      await image_type_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle null response from database', async () => {
    findAllStub.resolves(null);

    try {
      await image_type_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should call findAll exactly once', async () => {
    findAllStub.resolves([
      { id_type: 1, label: 'docker' },
    ]);

    await image_type_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
  });

  it('should preserve ImageType data integrity through mapping', async () => {
    const mockData = [
      { id_type: 5, label: 'containerruntime' },
    ];
    findAllStub.resolves(mockData);

    const result = await image_type_builder.list();

    chai.expect(result[0].toJSON()).to.deep.equal({
      id_type: 5,
      label: 'containerruntime',
    });
  });

  it('should handle database timeout errors', async () => {
    findAllStub.rejects(new Error('Query timeout'));

    try {
      await image_type_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
      chai.expect(err.message).to.include('Query timeout');
    }
  });

  it('should handle large datasets with multiple image types', async () => {
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      id_type: i + 1,
      label: `type-${i + 1}`,
    }));
    findAllStub.resolves(largeDataset);

    const result = await image_type_builder.list();

    chai.expect(result).to.have.lengthOf(100);
    chai.expect(result[0].id_type).to.equal(1);
    chai.expect(result[99].id_type).to.equal(100);
    result.forEach((item) => {
      chai.expect(item).to.be.instanceOf(ImageType);
    });
  });
});
