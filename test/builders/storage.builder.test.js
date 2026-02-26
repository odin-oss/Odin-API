import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Op } from 'sequelize';
import dbManager from '../../src/config/db.config.js';
import * as storage_builder from '../../src/builders/storage.builder.js';
import { Application_export } from '../../src/objects/Application_export.js';
import moment from 'moment-timezone';
import CONFIG from '../../src/config/config.js';

chai.use(sinonChai);

describe('storage.builder.create()', () => {
	let createStub;
	let enumFindOneStub;

	before(async () => {
		await dbManager.initModels();
	});

	beforeEach(() => {
		createStub = sinon.stub(dbManager.models.APPLICATION_EXPORT, 'create');
		enumFindOneStub = sinon.stub(dbManager.models.ENUM_EXPORT_STATE, 'findOne');
	});

	afterEach(() => {
		sinon.restore();
	});

	it('should create an export with valid inputs', async () => {
		enumFindOneStub.resolves({ id_enum_export_state: 1 });
		createStub.resolves({
			id_export: 10,
			id_application: 5,
			init_date: moment.tz(CONFIG.APP_TZ).format(),
			expiration_date: moment.tz(CONFIG.APP_TZ).add(7, 'days').format(),
			id_enum_export_state: 1,
		});

		const result = await storage_builder.create({
			id_application: 5,
			availability_days: 7,
		});

		chai.expect(enumFindOneStub.calledOnce).to.be.true;
		chai.expect(createStub.calledOnce).to.be.true;
		chai.expect(result).to.be.instanceOf(Application_export);
		chai.expect(result.status).to.equal('Launched');
		chai.expect(result.id_application).to.equal(5);
	});

	it('should reject invalid id_application', async () => {
		try {
			await storage_builder.create({
				id_application: 0,
				availability_days: 7,
			});
			chai.expect.fail('Should have thrown an error');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});

	it('should reject invalid availability_days', async () => {
		try {
			await storage_builder.create({
				id_application: 1,
				availability_days: 0,
			});
			chai.expect.fail('Should have thrown an error');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});
});

describe('storage.builder.get()', () => {
	let findOneStub;
	let enumFindOneStub;

	before(async () => {
		await dbManager.initModels();
	});

	beforeEach(() => {
		findOneStub = sinon.stub(dbManager.models.APPLICATION_EXPORT, 'findOne');
		enumFindOneStub = sinon.stub(dbManager.models.ENUM_EXPORT_STATE, 'findOne');
	});

	afterEach(() => {
		sinon.restore();
	});

	it('should retrieve an export with status', async () => {
		findOneStub.resolves({
			id_export: 12,
			id_application: 8,
			id_enum_export_state: 2,
			dataValues: {
				id_export: 12,
				id_application: 8,
				init_date: moment.tz(CONFIG.APP_TZ).format(),
				expiration_date: moment.tz(CONFIG.APP_TZ).add(1, 'days').format(),
				id_enum_export_state: 2,
			},
		});
		enumFindOneStub.resolves({ status: 'Available' });

		const result = await storage_builder.get({ id_export: 12 });

		chai.expect(findOneStub.calledOnce).to.be.true;
		chai.expect(enumFindOneStub.calledOnce).to.be.true;
		chai.expect(result).to.be.instanceOf(Application_export);
		chai.expect(result.status).to.equal('Available');
	});

	it('should throw when export is not found', async () => {
		findOneStub.resolves(null);

		try {
			await storage_builder.get({ id_export: 404 });
			chai.expect.fail('Should have thrown an error');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});

	it('should reject invalid id_export', async () => {
		try {
			await storage_builder.get({ id_export: 0 });
			chai.expect.fail('Should have thrown an error');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});
});

describe('storage.builder.getLatestStorage()', () => {
	let findOneStub;
	let enumFindOneStub;

	before(async () => {
		await dbManager.initModels();
	});

	beforeEach(() => {
		findOneStub = sinon.stub(dbManager.models.APPLICATION_EXPORT, 'findOne');
		enumFindOneStub = sinon.stub(dbManager.models.ENUM_EXPORT_STATE, 'findOne');
	});

	afterEach(() => {
		sinon.restore();
	});

	it('should retrieve latest storage with active expiration', async () => {
		findOneStub.resolves({
			id_export: 20,
			id_application: 9,
			init_date: moment.tz(CONFIG.APP_TZ).format(),
			expiration_date: moment.tz(CONFIG.APP_TZ).add(2, 'days').format(),
			id_enum_export_state: 3,
		});
		enumFindOneStub.resolves({ status: 'Exporting' });

		const result = await storage_builder.getLatestStorage({
			id_application: 9,
		});

		chai.expect(findOneStub.calledOnce).to.be.true;
		const callArgs = findOneStub.getCall(0).args[0];
		chai.expect(callArgs.where.id_application).to.equal(9);
		chai.expect(callArgs.where.expiration_date).to.have.property(Op.gt);
		chai.expect(callArgs.order[0][0]).to.equal('init_date');
		chai.expect(callArgs.order[0][1]).to.equal('DESC');
		chai.expect(result).to.be.instanceOf(Application_export);
		chai.expect(result.status).to.equal('Exporting');
	});

	it('should reject invalid id_application', async () => {
		try {
			await storage_builder.getLatestStorage({ id_application: 0 });
			chai.expect.fail('Should have thrown an error');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});
});

describe('storage.builder.getNonErrorApplicationStorage()', () => {
	let findOneStub;
	let enumFindAllStub;
	let enumFindOneStub;

	before(async () => {
		await dbManager.initModels();
	});

	beforeEach(() => {
		findOneStub = sinon.stub(dbManager.models.APPLICATION_EXPORT, 'findOne');
		enumFindAllStub = sinon.stub(dbManager.models.ENUM_EXPORT_STATE, 'findAll');
		enumFindOneStub = sinon.stub(dbManager.models.ENUM_EXPORT_STATE, 'findOne');
	});

	afterEach(() => {
		sinon.restore();
	});

	it('should return the export when state is allowed', async () => {
		enumFindAllStub.resolves([
			{ dataValues: { status: 'Launched', id_enum_export_state: 1 }, status: 'Launched' },
			{ dataValues: { status: 'Exporting', id_enum_export_state: 2 }, status: 'Exporting' },
			{ dataValues: { status: 'Available', id_enum_export_state: 3 }, status: 'Available' },
		]);
		enumFindOneStub.resolves({ status: 'Available' });
		findOneStub.resolves({
			id_export: 30,
			id_application: 10,
			init_date: moment.tz(CONFIG.APP_TZ).format(),
			expiration_date: moment.tz(CONFIG.APP_TZ).add(2, 'days').format(),
			id_enum_export_state: 3,
		});

		const result = await storage_builder.getNonErrorApplicationStorage({
			id_application: 10,
		});

		chai.expect(enumFindAllStub.calledOnce).to.be.true;
		chai.expect(findOneStub.calledOnce).to.be.true;
		chai.expect(result).to.be.instanceOf(Application_export);
		chai.expect(result.status).to.equal('Available');
	});

	it('should return an empty export when no match is found', async () => {
		enumFindAllStub.resolves([
			{ dataValues: { status: 'Launched', id_enum_export_state: 1 }, status: 'Launched' },
			{ dataValues: { status: 'Exporting', id_enum_export_state: 2 }, status: 'Exporting' },
			{ dataValues: { status: 'Available', id_enum_export_state: 3 }, status: 'Available' },
		]);
		findOneStub.resolves({
			id_export: 31,
			id_application: 10,
			init_date: moment.tz(CONFIG.APP_TZ).format(),
			expiration_date: moment.tz(CONFIG.APP_TZ).add(2, 'days').format(),
			id_enum_export_state: 9,
		});

		const result = await storage_builder.getNonErrorApplicationStorage({
			id_application: 10,
		});

		chai.expect(result).to.be.instanceOf(Application_export);
		chai.expect(result.id_export).to.equal(null);
	});
});

describe('storage.builder.deleteExport()', () => {
	let updateStub;
	let enumFindOneStub;

	before(async () => {
		await dbManager.initModels();
	});

	beforeEach(() => {
		updateStub = sinon.stub(dbManager.models.APPLICATION_EXPORT, 'update');
		enumFindOneStub = sinon.stub(dbManager.models.ENUM_EXPORT_STATE, 'findOne');
	});

	afterEach(() => {
		sinon.restore();
	});

	it('should update export state to revoked', async () => {
		enumFindOneStub.resolves({ id_enum_export_state: 5 });
		updateStub.resolves([1]);

		const result = await storage_builder.deleteExport({ id_export: 50 });

		chai.expect(enumFindOneStub.calledOnce).to.be.true;
		chai.expect(updateStub.calledOnce).to.be.true;
		chai.expect(result).to.be.instanceOf(Application_export);
	});

	it('should throw when export does not exist', async () => {
		enumFindOneStub.resolves({ id_enum_export_state: 5 });
		updateStub.resolves([0]);

		try {
			await storage_builder.deleteExport({ id_export: 999 });
			chai.expect.fail('Should have thrown an error');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});
});

describe('storage.builder.setError()', () => {
	let updateStub;
	let enumFindOneStub;

	before(async () => {
		await dbManager.initModels();
	});

	beforeEach(() => {
		updateStub = sinon.stub(dbManager.models.APPLICATION_EXPORT, 'update');
		enumFindOneStub = sinon.stub(dbManager.models.ENUM_EXPORT_STATE, 'findOne');
	});

	afterEach(() => {
		sinon.restore();
	});

	it('should update export state to error', async () => {
		enumFindOneStub.resolves({ id_enum_export_state: 6 });
		updateStub.resolves([1]);

		const result = await storage_builder.setError({ id_export: 77 });

		chai.expect(enumFindOneStub.calledOnce).to.be.true;
		chai.expect(updateStub.calledOnce).to.be.true;
		chai.expect(result).to.be.instanceOf(Application_export);
	});

	it('should throw when export does not exist', async () => {
		enumFindOneStub.resolves({ id_enum_export_state: 6 });
		updateStub.resolves([0]);

		try {
			await storage_builder.setError({ id_export: 999 });
			chai.expect.fail('Should have thrown an error');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});
});

describe('storage.builder.getIdEnumState()', () => {
	let enumFindOneStub;

	before(async () => {
		await dbManager.initModels();
	});

	beforeEach(() => {
		enumFindOneStub = sinon.stub(dbManager.models.ENUM_EXPORT_STATE, 'findOne');
	});

	afterEach(() => {
		sinon.restore();
	});

	it('should return the enum state id for a valid status', async () => {
		enumFindOneStub.resolves({ id_enum_export_state: 2 });

		const result = await storage_builder.getIdEnumState({
			status: 'Available',
		});

		chai.expect(result).to.equal(2);
	});

	it('should throw when status is not found', async () => {
		enumFindOneStub.resolves(null);

		try {
			await storage_builder.getIdEnumState({ status: 'Available' });
			chai.expect.fail('Should have thrown an error');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});
});

describe('storage.builder.getIdsEnumStates()', () => {
	let enumFindAllStub;

	before(async () => {
		await dbManager.initModels();
	});

	beforeEach(() => {
		enumFindAllStub = sinon.stub(dbManager.models.ENUM_EXPORT_STATE, 'findAll');
	});

	afterEach(() => {
		sinon.restore();
	});

	it('should return ids for the provided statuses', async () => {
		enumFindAllStub.resolves([
			{ dataValues: { status: 'Launched', id_enum_export_state: 1 }, status: 'Launched' },
			{ dataValues: { status: 'Available', id_enum_export_state: 3 }, status: 'Available' },
		]);

		const result = await storage_builder.getIdsEnumStates({
			statuses: ['Launched', 'Available'],
		});

		chai.expect(result).to.deep.equal([1, 3]);
	});

	it('should throw when a status is missing', async () => {
		enumFindAllStub.resolves([
			{ dataValues: { status: 'Launched' }, status: 'Launched' },
		]);

		try {
			await storage_builder.getIdsEnumStates({
				statuses: ['Launched', 'Available'],
			});
			chai.expect.fail('Should have thrown an error');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});
});

describe('storage.builder.getStatusFromId()', () => {
	let enumFindOneStub;

	before(async () => {
		await dbManager.initModels();
	});

	beforeEach(() => {
		enumFindOneStub = sinon.stub(dbManager.models.ENUM_EXPORT_STATE, 'findOne');
	});

	afterEach(() => {
		sinon.restore();
	});

	it('should return the status for a valid id', async () => {
		enumFindOneStub.resolves({ status: 'Expired' });

		const result = await storage_builder.getStatusFromId({
			id_enum_export_state: 4,
		});

		chai.expect(result).to.equal('Expired');
	});

	it('should throw when id is not found', async () => {
		enumFindOneStub.resolves(null);

		try {
			await storage_builder.getStatusFromId({ id_enum_export_state: 999 });
			chai.expect.fail('Should have thrown an error');
		} catch (err) {
			chai.expect(err).to.exist;
		}
	});
});
