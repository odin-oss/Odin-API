import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import dbManager from '../../src/config/db.config.js';
import * as category_builder from '../../src/builders/category.builder.js';
import { Category } from '../../src/objects/Category.js';
import { Environment } from '../../src/objects/Environment.js';
import {
  DBObjectAlreadyExists,
  DBObjectNotFound,
} from '../../src/utils/errors.util.js';

chai.use(sinonChai);

describe('category.builder.list()', () => {
  let findAllStub;
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.CATEGORY, 'findAll');
    findOneStub = sinon.stub(
      dbManager.models.ENVIRONMENT_HAS_CATEGORY,
      'findAll'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return all categories with all=true parameter', async () => {
    findAllStub.resolves([
      {
        dataValues: {
          id_category: 1,
          label: 'Category 1',
          google_material_icon: 'icon1',
        },
        ENVIRONMENT_HAS_CATEGORies: [
          {
            id_environment: 1,
            id_category: 1,
            ENVIRONMENT: {
              id_environment: 1,
              label: 'Prod',
              icon: 'icon-prod',
            },
          },
        ],
      },
    ]);

    const result = await category_builder.list({ all: true });

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result[0]).to.be.instanceOf(Category);
    chai.expect(result[0].id_category).to.equal(1);
    chai.expect(result[0].label).to.equal('Category 1');
  });

  it('should return categories with environments when all=false (default)', async () => {
    findOneStub.resolves([
      {
        CATEGORY: {
          dataValues: {
            id_category: 1,
            label: 'Category 1',
            google_material_icon: 'icon1',
          },
        },
        ENVIRONMENT: {
          dataValues: {
            id_environment: 1,
            label: 'Prod',
            icon: 'icon-prod',
          },
        },
      },
    ]);

    const result = await category_builder.list({ all: false });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result[0]).to.be.instanceOf(Category);
  });

  it('should return empty array when no categories exist', async () => {
    findOneStub.resolves([]);

    const result = await category_builder.list({ all: false });

    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });

  it('should handle database errors in list', async () => {
    findAllStub.rejects(new Error('Database connection failed'));

    try {
      await category_builder.list({ all: true });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should merge multiple environments into same category', async () => {
    findOneStub.resolves([
      {
        CATEGORY: {
          dataValues: {
            id_category: 1,
            label: 'Category 1',
            google_material_icon: 'icon1',
          },
        },
        ENVIRONMENT: {
          dataValues: {
            id_environment: 1,
            label: 'Prod',
            icon: 'icon-prod',
          },
        },
      }
    ]);

    const result = await category_builder.list({ all: false });

    chai.expect(result).to.have.lengthOf(1);
    chai.expect(result[0].environments).to.have.lengthOf(1);
  });
});

describe('category.builder.create()', () => {
  let createStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    createStub = sinon.stub(dbManager.models.CATEGORY, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create a category with valid data', async () => {
    createStub.resolves({
      id_category: 1,
      label: 'New Category',
      google_material_icon: 'icon-new',
    });

    const result = await category_builder.create({
      label: 'New Category',
      google_material_icon: 'icon-new',
    });

    chai.expect(createStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Category);
    chai.expect(result.label).to.equal('New Category');
  });

  it('should throw error when label is too short', async () => {
    try {
      await category_builder.create({
        label: 'A',
        google_material_icon: 'icon-new',
      });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when icon is too short', async () => {
    try {
      await category_builder.create({
        label: 'Valid Label',
        google_material_icon: 'I',
      });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors', async () => {
    createStub.rejects(new Error('Database connection failed'));

    try {
      await category_builder.create({
        label: 'New Category',
        google_material_icon: 'icon-new',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('category.builder.get()', () => {
  let findOneStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findOneStub = sinon.stub(dbManager.models.CATEGORY, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should get a category by id', async () => {
    findOneStub.resolves({
      dataValues: {
        id_category: 1,
        label: 'Category 1',
        google_material_icon: 'icon1',
      },
      ENVIRONMENT_HAS_CATEGORies: [
        {
          ENVIRONMENT: {
            dataValues: {
              id_environment: 1,
              label: 'Prod',
              icon: 'icon-prod',
            },
          },
        },
      ],
    });

    const result = await category_builder.get({ id_category: 1 });

    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Category);
    chai.expect(result.id_category).to.equal(1);
    chai.expect(result.label).to.equal('Category 1');
  });

  it('should return null when category not found', async () => {
    findOneStub.resolves(null);

    try {
      await category_builder.get({ id_category: 999 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate id_category is positive integer', async () => {
    try {
      await category_builder.get({ id_category: -1 });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors', async () => {
    findOneStub.rejects(new Error('Database connection failed'));

    try {
      await category_builder.get({ id_category: 1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should include all environments for category', async () => {
    findOneStub.resolves({
      dataValues: {
        id_category: 1,
        label: 'Category 1',
        google_material_icon: 'icon1',
      },
      ENVIRONMENT_HAS_CATEGORies: [
        {
          ENVIRONMENT: {
            dataValues: {
              id_environment: 1,
              label: 'Prod',
              icon: 'icon-prod',
            },
          },
        },
        {
          ENVIRONMENT: {
            dataValues: {
              id_environment: 2,
              label: 'Dev',
              icon: 'icon-dev',
            },
          },
        },
      ],
    });

    const result = await category_builder.get({ id_category: 1 });

    chai.expect(result.environments).to.have.lengthOf(2);
    chai.expect(result.environments[0]).to.be.instanceOf(Environment);
  });
});

describe('category.builder.attach_environment()', () => {
  let findByPkStub;
  let findOneStub;
  let createStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findByPkStub = sinon.stub(dbManager.models.CATEGORY, 'findByPk');
    findOneStub = sinon.stub(
      dbManager.models.ENVIRONMENT_HAS_CATEGORY,
      'findOne'
    );
    createStub = sinon.stub(
      dbManager.models.ENVIRONMENT_HAS_CATEGORY,
      'create'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should attach environment to category', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_CATEGORies: [],
    });
    findOneStub.resolves(null);
    createStub.resolves({ id_category: 1, id_environment: 1 });

    const mockGetFn = sinon.stub().resolves(
      new Category({
        id_category: 1,
        label: 'Category 1',
        google_material_icon: 'icon1',
        environments: [
          new Environment({
            id_environment: 1,
            label: 'Prod',
            icon: 'icon-prod',
          }),
        ],
      })
    );

    const result = await category_builder.attach_environment(
      { id_category: 1, id_environment: 1 },
      { get: mockGetFn }
    );

    chai.expect(findByPkStub.calledOnce).to.be.true;
    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(createStub.calledOnce).to.be.true;
    chai.expect(mockGetFn.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Category);
  });

  it('should throw error when category not found', async () => {
    findByPkStub.resolves(null);

    try {
      await category_builder.attach_environment(
        { id_category: 999, id_environment: 1 },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown DBObjectNotFound error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });

  it('should throw error when environment already attached', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_CATEGORies: [],
    });
    findOneStub.resolves({ id_category: 1, id_environment: 1 });

    try {
      await category_builder.attach_environment(
        { id_category: 1, id_environment: 1 },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown DBObjectAlreadyExists error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectAlreadyExists);
    }
  });

  it('should validate id_category is positive integer', async () => {
    try {
      await category_builder.attach_environment(
        { id_category: -1, id_environment: 1 },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate id_environment is positive integer', async () => {
    try {
      await category_builder.attach_environment(
        { id_category: 1, id_environment: -1 },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should call get function with correct params', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_CATEGORies: [],
    });
    findOneStub.resolves(null);
    createStub.resolves({ id_category: 1, id_environment: 1 });

    const mockGetFn = sinon.stub().resolves(
      new Category({
        id_category: 1,
        label: 'Category 1',
        google_material_icon: 'icon1',
        environments: [],
      })
    );

    await category_builder.attach_environment(
      { id_category: 1, id_environment: 1 },
      { get: mockGetFn }
    );

    chai.expect(mockGetFn.calledWith({ id_category: 1, id_environment: 1 }))
      .to.be.true;
  });
});

describe('category.builder.detach_environment()', () => {
  let findByPkStub;
  let findOneStub;
  let destroyStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findByPkStub = sinon.stub(dbManager.models.CATEGORY, 'findByPk');
    findOneStub = sinon.stub(
      dbManager.models.ENVIRONMENT_HAS_CATEGORY,
      'findOne'
    );
    destroyStub = sinon.stub(
      dbManager.models.ENVIRONMENT_HAS_CATEGORY,
      'destroy'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should detach environment from category', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_CATEGORies: [],
    });
    findOneStub.resolves({ id_category: 1, id_environment: 1 });
    destroyStub.resolves(1);

    const mockGetFn = sinon.stub().resolves(
      new Category({
        id_category: 1,
        label: 'Category 1',
        google_material_icon: 'icon1',
        environments: [],
      })
    );

    const result = await category_builder.detach_environment(
      { id_category: 1, id_environment: 1 },
      { get: mockGetFn }
    );

    chai.expect(findByPkStub.calledOnce).to.be.true;
    chai.expect(findOneStub.calledOnce).to.be.true;
    chai.expect(destroyStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Category);
  });

  it('should throw error when category not found', async () => {
    findByPkStub.resolves(null);

    try {
      await category_builder.detach_environment(
        { id_category: 999, id_environment: 1 },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown DBObjectNotFound error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });

  it('should throw error when environment is not attached', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_CATEGORies: [],
    });
    findOneStub.resolves(null);

    try {
      await category_builder.detach_environment(
        { id_category: 1, id_environment: 999 },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown DBObjectAlreadyExists error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectAlreadyExists);
    }
  });

  it('should call get function with correct params', async () => {
    findByPkStub.resolves({
      ENVIRONMENT_HAS_CATEGORies: [],
    });
    findOneStub.resolves({ id_category: 1, id_environment: 1 });
    destroyStub.resolves(1);

    const mockGetFn = sinon.stub().resolves(
      new Category({
        id_category: 1,
        label: 'Category 1',
        google_material_icon: 'icon1',
        environments: [],
      })
    );

    await category_builder.detach_environment(
      { id_category: 1, id_environment: 1 },
      { get: mockGetFn }
    );

    chai.expect(mockGetFn.calledWith({ id_category: 1, id_environment: 1 }))
      .to.be.true;
  });
});

describe('category.builder.update()', () => {
  let updateStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    updateStub = sinon.stub(dbManager.models.CATEGORY, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update category label and icon', async () => {
    updateStub.resolves([1, [{ id_category: 1 }]]);

    const mockGetFn = sinon.stub().resolves(
      new Category({
        id_category: 1,
        label: 'Updated Category',
        google_material_icon: 'updated-icon',
        environments: [],
      })
    );

    const result = await category_builder.update(
      {
        id_category: 1,
        label: 'Updated Category',
        google_material_icon: 'updated-icon',
      },
      { get: mockGetFn }
    );

    chai.expect(updateStub.calledOnce).to.be.true;
    chai.expect(mockGetFn.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Category);
  });

  it('should validate id_category is positive integer', async () => {
    try {
      await category_builder.update(
        {
          id_category: -1,
          label: 'Updated Category',
          google_material_icon: 'updated-icon',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate label is minimum 2 characters', async () => {
    try {
      await category_builder.update(
        {
          id_category: 1,
          label: 'A',
          google_material_icon: 'updated-icon',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should validate icon is minimum 2 characters', async () => {
    try {
      await category_builder.update(
        {
          id_category: 1,
          label: 'Updated Category',
          google_material_icon: 'I',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors', async () => {
    updateStub.rejects(new Error('Database connection failed'));

    try {
      await category_builder.update(
        {
          id_category: 1,
          label: 'Updated Category',
          google_material_icon: 'updated-icon',
        },
        { get: sinon.stub() }
      );
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should call get function with original props', async () => {
    updateStub.resolves([1, [{ id_category: 1 }]]);

    const mockGetFn = sinon.stub().resolves(
      new Category({
        id_category: 1,
        label: 'Updated Category',
        google_material_icon: 'updated-icon',
        environments: [],
      })
    );

    const props = {
      id_category: 1,
      label: 'Updated Category',
      google_material_icon: 'updated-icon',
    };

    await category_builder.update(props, { get: mockGetFn });

    chai.expect(mockGetFn.calledWith(props)).to.be.true;
  });
});

describe('category.builder.del()', () => {
  let findByPkStub;
  let destroyStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findByPkStub = sinon.stub(dbManager.models.CATEGORY, 'findByPk');
    destroyStub = sinon.stub(dbManager.models.CATEGORY, 'destroy');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should delete a category', async () => {
    findByPkStub.resolves({
      dataValues: {
        id_category: 1,
        label: 'Category to Delete',
        google_material_icon: 'icon1',
      },
      ENVIRONMENT_HAS_CATEGORies: [
        {
          ENVIRONMENT: {
            dataValues: {
              id_environment: 1,
              label: 'Prod',
              icon: 'icon-prod',
            },
          },
        },
      ],
    });
    destroyStub.resolves(1);

    const result = await category_builder.del({ id_category: 1 });

    chai.expect(findByPkStub.calledOnce).to.be.true;
    chai.expect(destroyStub.calledOnce).to.be.true;
    chai.expect(result).to.be.instanceOf(Category);
    chai.expect(result.id_category).to.equal(1);
  });

  it('should throw error when category not found', async () => {
    findByPkStub.resolves(null);

    try {
      await category_builder.del({ id_category: 999 });
      chai.expect.fail('Should have thrown DBObjectNotFound error');
    } catch (err) {
      chai.expect(err).to.be.instanceOf(DBObjectNotFound);
    }
  });

  it('should validate id_category is positive integer', async () => {
    try {
      await category_builder.del({ id_category: -1 });
      chai.expect.fail('Should have thrown validation error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should handle database errors', async () => {
    findByPkStub.rejects(new Error('Database connection failed'));

    try {
      await category_builder.del({ id_category: 1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should include all environments when deleting', async () => {
    findByPkStub.resolves({
      dataValues: {
        id_category: 1,
        label: 'Category to Delete',
        google_material_icon: 'icon1',
      },
      ENVIRONMENT_HAS_CATEGORies: [
        {
          ENVIRONMENT: {
            dataValues: {
              id_environment: 1,
              label: 'Prod',
              icon: 'icon-prod',
            },
          },
        },
        {
          ENVIRONMENT: {
            dataValues: {
              id_environment: 2,
              label: 'Dev',
              icon: 'icon-dev',
            },
          },
        },
      ],
    });
    destroyStub.resolves(1);

    const result = await category_builder.del({ id_category: 1 });

    chai.expect(result.environments).to.have.lengthOf(2);
  });
});
