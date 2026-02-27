import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as category_service from '../../src/services/category.service.js';

chai.use(sinonChai);

describe('category.service.list()', () => {
  it('should list categories with default parameter (all=false)', async () => {
    const mockCategories = [
      { id_category: 1, label: 'Category 1', google_material_icon: 'icon1' },
      { id_category: 2, label: 'Category 2', google_material_icon: 'icon2' },
    ];
    const mockCategoryList = sinon.stub().resolves(mockCategories);

    const result = await category_service.list(
      {},
      { category_list: mockCategoryList }
    );

    chai.expect(result).to.deep.equal(mockCategories);
    chai.expect(mockCategoryList.calledOnce).to.be.true;
  });

  it('should list all categories when all=true', async () => {
    const mockCategories = [
      { id_category: 1, label: 'Category 1', google_material_icon: 'icon1' },
      { id_category: 2, label: 'Category 2', google_material_icon: 'icon2' },
      {
        id_category: 3,
        label: 'Hidden Category',
        google_material_icon: 'icon3',
      },
    ];
    const mockCategoryList = sinon.stub().resolves(mockCategories);

    const result = await category_service.list(
      { all: true },
      { category_list: mockCategoryList }
    );

    chai.expect(result).to.deep.equal(mockCategories);
    chai.expect(mockCategoryList.calledOnce).to.be.true;
  });

  it('should return empty array when no categories exist', async () => {
    const mockCategoryList = sinon.stub().resolves([]);

    const result = await category_service.list(
      { all: false },
      { category_list: mockCategoryList }
    );

    chai.expect(result).to.deep.equal([]);
    chai.expect(mockCategoryList.calledOnce).to.be.true;
  });

  it('should propagate error when builder throws', async () => {
    const mockError = new Error('Database error');
    const mockCategoryList = sinon.stub().rejects(mockError);

    try {
      await category_service.list({}, { category_list: mockCategoryList });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err.message).to.equal('Database error');
    }
  });
});

describe('category.service.create()', () => {
  it('should create category successfully', async () => {
    const mockNewCategory = {
      id_category: 1,
      label: 'New Category',
      google_material_icon: 'stars',
    };
    const mockCategoryCreate = sinon.stub().resolves(mockNewCategory);

    const result = await category_service.create(
      {
        label: 'New Category',
        google_material_icon: 'stars',
      },
      { category_create: mockCategoryCreate }
    );

    chai.expect(result).to.deep.equal(mockNewCategory);
    chai.expect(mockCategoryCreate.calledOnce).to.be.true;
  });

  it('should throw error when label is less than 2 characters', async () => {
    try {
      await category_service.create({
        label: 'a',
        google_material_icon: 'stars',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when google_material_icon is less than 2 characters', async () => {
    try {
      await category_service.create({
        label: 'New Category',
        google_material_icon: 'a',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when label is missing', async () => {
    try {
      await category_service.create({
        google_material_icon: 'stars',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when google_material_icon is missing', async () => {
    try {
      await category_service.create({
        label: 'New Category',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('category.service.detach_environment()', () => {
  it('should detach environment from category successfully', async () => {
    const mockUpdatedCategory = {
      id_category: 1,
      label: 'Category 1',
    };
    const mockDetach = sinon.stub().resolves(mockUpdatedCategory);

    const result = await category_service.detach_environment(
      {
        id_category: 1,
        id_environment: 1,
      },
      { detach_environment: mockDetach }
    );

    chai.expect(result).to.deep.equal(mockUpdatedCategory);
    chai.expect(mockDetach.calledOnce).to.be.true;
  });

  it('should throw error when id_category is not positive', async () => {
    try {
      await category_service.detach_environment({
        id_category: -1,
        id_environment: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_environment is not positive', async () => {
    try {
      await category_service.detach_environment({
        id_category: 1,
        id_environment: 0,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('category.service.attach_environment()', () => {
  it('should attach environment to category successfully', async () => {
    const mockUpdatedCategory = {
      id_category: 1,
      label: 'Category 1',
      environments: [{ id_environment: 1 }],
    };
    const mockAttach = sinon.stub().resolves(mockUpdatedCategory);

    const result = await category_service.attach_environment(
      {
        id_category: 1,
        id_environment: 1,
      },
      { attach_environment: mockAttach }
    );

    chai.expect(result).to.deep.equal(mockUpdatedCategory);
    chai.expect(mockAttach.calledOnce).to.be.true;
  });

  it('should throw error when id_category is not positive', async () => {
    try {
      await category_service.attach_environment({
        id_category: 0,
        id_environment: 1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_environment is not positive', async () => {
    try {
      await category_service.attach_environment({
        id_category: 1,
        id_environment: -1,
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('category.service.update()', () => {
  it('should update category successfully', async () => {
    const mockUpdatedCategory = {
      id_category: 1,
      label: 'Updated Category',
      google_material_icon: 'updated_icon',
    };
    const mockUpdate = sinon.stub().resolves(mockUpdatedCategory);

    const result = await category_service.update(
      {
        id_category: 1,
        label: 'Updated Category',
        google_material_icon: 'updated_icon',
      },
      { category_update: mockUpdate }
    );

    chai.expect(result).to.deep.equal(mockUpdatedCategory);
    chai.expect(mockUpdate.calledOnce).to.be.true;
  });

  it('should throw error when label is less than 2 characters', async () => {
    try {
      await category_service.update({
        id_category: 1,
        label: 'a',
        google_material_icon: 'icon',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_category is not positive', async () => {
    try {
      await category_service.update({
        id_category: 0,
        label: 'Updated Category',
        google_material_icon: 'icon',
      });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});

describe('category.service.del()', () => {
  it('should delete category successfully', async () => {
    const mockDeletedCategory = {
      id_category: 1,
      label: 'Deleted Category',
    };
    const mockDelete = sinon.stub().resolves(mockDeletedCategory);

    const result = await category_service.del(
      { id_category: 1 },
      { category_del: mockDelete }
    );

    chai.expect(result).to.deep.equal(mockDeletedCategory);
    chai.expect(mockDelete.calledOnce).to.be.true;
  });

  it('should throw error when id_category is not positive', async () => {
    try {
      await category_service.del({ id_category: -1 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });

  it('should throw error when id_category is zero', async () => {
    try {
      await category_service.del({ id_category: 0 });
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
    }
  });
});
