import * as category_controller from '../../src/controllers/category.controller.js';
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as token_service from '../../src/utils/token.util.js';
import { DBConnexionRefused } from '../../src/utils/errors.util.js';
import { Category } from '../../src/objects/Category.js';
import { Environment } from '../../src/objects/Environment.js';

chai.use(sinonChai);

describe('category_controller.list()', () => {
  let fakeList, fakeRole, fakeReq, fakeRes;

  beforeEach(() => {
    fakeList = sinon.stub();
    fakeRole = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      query: {},
      method: 'GET',
      originalUrl: '/category/list',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called without all parameter and should return list of categories.', async () => {
    const mockEnvironment = new Environment({
      id_environment: 1,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    const mockCategories = [
      new Category({
        id_category: 1,
        label: 'Development',
        google_material_icon: 'code',
        environments: [mockEnvironment],
      }),
    ];

    fakeList.resolves(Promise.resolve(mockCategories));

    await category_controller.list(fakeReq, fakeRes, {
      category_list: fakeList,
      user_role: fakeRole,
    });

    chai.expect(fakeList).to.have.been.calledOnceWithExactly({ all: false });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
  });

  it('called with all=true as admin and should return all categories.', async () => {
    fakeReq.query = { all: 'true' };
    fakeRole.resolves('ADMINISTRATEUR');

    const mockCategories = [
      new Category({
        id_category: 1,
        label: 'Development',
        google_material_icon: 'code',
        environments: [],
      }),
      new Category({
        id_category: 2,
        label: 'Production',
        google_material_icon: 'cloud',
        environments: [],
      }),
    ];

    fakeList.resolves(Promise.resolve(mockCategories));

    await category_controller.list(fakeReq, fakeRes, {
      category_list: fakeList,
      user_role: fakeRole,
    });

    chai.expect(fakeRole).to.have.been.calledOnceWithExactly({ id_user: 1 });
    chai.expect(fakeList).to.have.been.calledOnceWithExactly({ all: true });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called with all=true as non-admin and should return limited categories.', async () => {
    fakeReq.query = { all: 'true' };
    fakeRole.resolves('USER');

    const mockCategories = [
      new Category({
        id_category: 1,
        label: 'Development',
        google_material_icon: 'code',
        environments: [],
      }),
    ];

    fakeList.resolves(Promise.resolve(mockCategories));

    await category_controller.list(fakeReq, fakeRes, {
      category_list: fakeList,
      user_role: fakeRole,
    });

    chai.expect(fakeRole).to.have.been.calledOnceWithExactly({ id_user: 1 });
    chai.expect(fakeList).to.have.been.calledOnceWithExactly({ all: false });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeList.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await category_controller.list(fakeReq, fakeRes, {
      category_list: fakeList,
      user_role: fakeRole,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('Connexion to the database refused.');
    chai.expect(jsonCall.error.type).to.equal('DBConnexionRefused');
  });
});

describe('category_controller.create()', () => {
  let fakeCreate, fakeReq, fakeRes;

  beforeEach(() => {
    fakeCreate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      body: {
        label: 'Development',
        google_material_icon: 'code',
      },
      method: 'POST',
      originalUrl: '/category',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should create new category.', async () => {
    const mockCategory = new Category({
      id_category: 1,
      label: 'Development',
      google_material_icon: 'code',
      environments: [],
    });

    fakeCreate.resolves(Promise.resolve(mockCategory));

    await category_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai
      .expect(fakeCreate)
      .to.have.been.calledOnceWithExactly({
        label: 'Development',
        google_material_icon: 'code',
      });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('New Category created.');
  });

  it('called without label and should reject with validation error.', async () => {
    fakeReq.body = {
      google_material_icon: 'code',
    };

    await category_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without icon and should reject with validation error.', async () => {
    fakeReq.body = {
      label: 'Development',
    };

    await category_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeCreate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeCreate.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await category_controller.create(fakeReq, fakeRes, {
      create: fakeCreate,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('Connexion to the database refused.');
    chai.expect(jsonCall.error.type).to.equal('DBConnexionRefused');
  });
});

describe('category_controller.detach_environment()', () => {
  let fakeDetach, fakeReq, fakeRes;

  beforeEach(() => {
    fakeDetach = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      params: {
        id_category: 1,
      },
      body: {
        id_environment: 2,
      },
      method: 'DELETE',
      originalUrl: '/category/1/environment',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should detach environment from category.', async () => {
    const mockCategory = new Category({
      id_category: 1,
      label: 'Development',
      google_material_icon: 'code',
      environments: [],
    });

    fakeDetach.resolves(Promise.resolve(mockCategory));

    await category_controller.detach_environment(fakeReq, fakeRes, {
      detach_environment: fakeDetach,
    });

    chai
      .expect(fakeDetach)
      .to.have.been.calledOnceWithExactly({
        id_category: 1,
        id_environment: 2,
      });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai
      .expect(jsonCall.message)
      .to.equal('The environment has been detached from the category.');
  });

  it('called without id_environment and should reject with validation error.', async () => {
    fakeReq.body = {};

    await category_controller.detach_environment(fakeReq, fakeRes, {
      detach_environment: fakeDetach,
    });

    chai.expect(fakeDetach).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without id_category and should reject with validation error.', async () => {
    fakeReq.params = {};

    await category_controller.detach_environment(fakeReq, fakeRes, {
      detach_environment: fakeDetach,
    });

    chai.expect(fakeDetach).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeDetach.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await category_controller.detach_environment(fakeReq, fakeRes, {
      detach_environment: fakeDetach,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('Connexion to the database refused.');
    chai.expect(jsonCall.error.type).to.equal('DBConnexionRefused');
  });
});

describe('category_controller.attach_environment()', () => {
  let fakeAttach, fakeReq, fakeRes;

  beforeEach(() => {
    fakeAttach = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      params: {
        id_category: 1,
      },
      body: {
        id_environment: 2,
      },
      method: 'POST',
      originalUrl: '/category/1/environment',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should attach environment to category.', async () => {
    const mockEnvironment = new Environment({
      id_environment: 2,
      label: 'NodeJS',
      icon: 'nodejs-icon',
      interfaces: [],
    });

    const mockCategory = new Category({
      id_category: 1,
      label: 'Development',
      google_material_icon: 'code',
      environments: [mockEnvironment],
    });

    fakeAttach.resolves(Promise.resolve(mockCategory));

    await category_controller.attach_environment(fakeReq, fakeRes, {
      attach_environment: fakeAttach,
    });

    chai
      .expect(fakeAttach)
      .to.have.been.calledOnceWithExactly({
        id_category: 1,
        id_environment: 2,
      });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai
      .expect(jsonCall.message)
      .to.equal('The environment has been attached to the category.');
  });

  it('called without id_environment and should reject with validation error.', async () => {
    fakeReq.body = {};

    await category_controller.attach_environment(fakeReq, fakeRes, {
      attach_environment: fakeAttach,
    });

    chai.expect(fakeAttach).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without id_category and should reject with validation error.', async () => {
    fakeReq.params = {};

    await category_controller.attach_environment(fakeReq, fakeRes, {
      attach_environment: fakeAttach,
    });

    chai.expect(fakeAttach).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeAttach.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await category_controller.attach_environment(fakeReq, fakeRes, {
      attach_environment: fakeAttach,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('Connexion to the database refused.');
    chai.expect(jsonCall.error.type).to.equal('DBConnexionRefused');
  });
});

describe('category_controller.update()', () => {
  let fakeUpdate, fakeReq, fakeRes;

  beforeEach(() => {
    fakeUpdate = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      params: {
        id_category: 1,
      },
      body: {
        label: 'Updated Category',
        google_material_icon: 'updated_icon',
      },
      method: 'PUT',
      originalUrl: '/category/1',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should update category.', async () => {
    const mockCategory = new Category({
      id_category: 1,
      label: 'Updated Category',
      google_material_icon: 'updated_icon',
      environments: [],
    });

    fakeUpdate.resolves(Promise.resolve(mockCategory));

    await category_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai
      .expect(fakeUpdate)
      .to.have.been.calledOnceWithExactly({
        id_category: 1,
        label: 'Updated Category',
        google_material_icon: 'updated_icon',
      });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Category updated.');
  });

  it('called without label and should reject with validation error.', async () => {
    fakeReq.body = {
      google_material_icon: 'updated_icon',
    };

    await category_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without icon and should reject with validation error.', async () => {
    fakeReq.body = {
      label: 'Updated Category',
    };

    await category_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called without id_category and should reject with validation error.', async () => {
    fakeReq.params = {};

    await category_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeUpdate).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeUpdate.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await category_controller.update(fakeReq, fakeRes, {
      update: fakeUpdate,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('Connexion to the database refused.');
    chai.expect(jsonCall.error.type).to.equal('DBConnexionRefused');
  });
});

describe('category_controller.del()', () => {
  let fakeDel, fakeReq, fakeRes;

  beforeEach(() => {
    fakeDel = sinon.stub();
    const token = token_service.generateToken({ id_user: 1 });
    fakeReq = {
      headers: {
        authorization: 'Bearer ' + token,
      },
      body: {
        id_category: 1,
      },
      method: 'DELETE',
      originalUrl: '/category',
    };
    fakeRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('called with good arguments and should delete category.', async () => {
    const mockCategory = new Category({
      id_category: 1,
      label: 'Development',
      google_material_icon: 'code',
      environments: [],
    });

    fakeDel.resolves(Promise.resolve(mockCategory));

    await category_controller.del(fakeReq, fakeRes, {
      del: fakeDel,
    });

    chai
      .expect(fakeDel)
      .to.have.been.calledOnceWithExactly({ id_category: 1 });
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(200);
    chai.expect(fakeRes.json).to.have.been.calledOnce;
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(true);
    chai.expect(jsonCall.message).to.equal('Category deleted.');
  });

  it('called without id_category and should reject with validation error.', async () => {
    fakeReq.body = {};

    await category_controller.del(fakeReq, fakeRes, {
      del: fakeDel,
    });

    chai.expect(fakeDel).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called with negative id_category and should reject with validation error.', async () => {
    fakeReq.body = {
      id_category: -1,
    };

    await category_controller.del(fakeReq, fakeRes, {
      del: fakeDel,
    });

    chai.expect(fakeDel).to.not.have.been.called;
    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(400);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
  });

  it('called but should reject with DBConnexionRefused error.', async () => {
    fakeDel.rejects(
      new DBConnexionRefused('Connexion to the database refused.')
    );

    await category_controller.del(fakeReq, fakeRes, {
      del: fakeDel,
    });

    chai.expect(fakeRes.status).to.have.been.calledOnceWithExactly(500);
    const jsonCall = fakeRes.json.firstCall.args[0];
    chai.expect(jsonCall.success).to.equal(false);
    chai
      .expect(jsonCall.message)
      .to.equal('Connexion to the database refused.');
    chai.expect(jsonCall.error.type).to.equal('DBConnexionRefused');
  });
});
