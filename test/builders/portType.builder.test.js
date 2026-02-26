import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import dbManager from '../../src/config/db.config.js';
import * as portType_builder from '../../src/builders/portType.builder.js';
import PortType from '../../src/objects/Port_type.js';

chai.use(sinonChai);

describe('portType.builder.list()', () => {
  let findAllStub;

  before(async () => {
    await dbManager.initModels();
  });

  beforeEach(() => {
    findAllStub = sinon.stub(dbManager.models.PORT_TYPE, 'findAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve all port types from database', async () => {
    findAllStub.resolves([
      { dataValues: { id_port_type: 1, label: 'HTTP' } },
      { dataValues: { id_port_type: 2, label: 'HTTPS' } },
    ]);

    const result = await portType_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(2);
    chai.expect(result[0]).to.be.instanceOf(PortType);
    chai.expect(result[1]).to.be.instanceOf(PortType);
  });

  it('should return empty array when no port types exist', async () => {
    findAllStub.resolves([]);

    const result = await portType_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(result).to.be.an('array');
    chai.expect(result).to.have.lengthOf(0);
  });

  it(
    'should map database records to PortType instances with correct properties',
    async () => {
      findAllStub.resolves([
        { dataValues: { id_port_type: 1, label: 'HTTP' } },
        { dataValues: { id_port_type: 2, label: 'HTTPS' } },
        { dataValues: { id_port_type: 3, label: 'SSH' } },
      ]);

      const result = await portType_builder.list();

      chai.expect(result[0].id_port_type).to.equal(1);
      chai.expect(result[0].label).to.equal('HTTP');
      chai.expect(result[1].id_port_type).to.equal(2);
      chai.expect(result[1].label).to.equal('HTTPS');
      chai.expect(result[2].id_port_type).to.equal(3);
      chai.expect(result[2].label).to.equal('SSH');
    }
  );

  it('should handle single port type record', async () => {
    findAllStub.resolves([
      { dataValues: { id_port_type: 5, label: 'RDP' } },
    ]);

    const result = await portType_builder.list();

    chai.expect(result).to.have.lengthOf(1);
    chai.expect(result[0].id_port_type).to.equal(5);
    chai.expect(result[0].label).to.equal('RDP');
  });

  it('should handle multiple port types with various labels', async () => {
    findAllStub.resolves([
      { dataValues: { id_port_type: 1, label: 'HTTP' } },
      { dataValues: { id_port_type: 2, label: 'HTTPS' } },
      { dataValues: { id_port_type: 3, label: 'SSH' } },
      { dataValues: { id_port_type: 4, label: 'TELNET' } },
      { dataValues: { id_port_type: 5, label: 'FTP' } },
    ]);

    const result = await portType_builder.list();

    chai.expect(result).to.have.lengthOf(5);
    result.forEach((item, index) => {
      chai.expect(item).to.be.instanceOf(PortType);
      chai.expect(item.id_port_type).to.equal(index + 1);
    });
  });

  it('should handle port types with numeric IDs', async () => {
    findAllStub.resolves([
      { dataValues: { id_port_type: 100, label: 'CUSTOM_PORT_1' } },
      { dataValues: { id_port_type: 999, label: 'CUSTOM_PORT_2' } },
    ]);

    const result = await portType_builder.list();

    chai.expect(result[0].id_port_type).to.equal(100);
    chai.expect(result[0].label).to.equal('CUSTOM_PORT_1');
    chai.expect(result[1].id_port_type).to.equal(999);
    chai.expect(result[1].label).to.equal('CUSTOM_PORT_2');
  });

  it('should handle port types with alphanumeric labels', async () => {
    findAllStub.resolves([
      { dataValues: { id_port_type: 1, label: 'HTTP_8080' } },
      { dataValues: { id_port_type: 2, label: 'HTTPS_443_TLS' } },
    ]);

    const result = await portType_builder.list();

    chai.expect(result[0].label).to.equal('HTTP_8080');
    chai.expect(result[1].label).to.equal('HTTPS_443_TLS');
  });

  it('should handle port types with lowercase labels', async () => {
    findAllStub.resolves([
      { dataValues: { id_port_type: 1, label: 'http' } },
      { dataValues: { id_port_type: 2, label: 'https' } },
    ]);

    const result = await portType_builder.list();

    chai.expect(result[0].label).to.equal('http');
    chai.expect(result[1].label).to.equal('https');
  });

  it('should handle database errors', async () => {
    findAllStub.rejects(new Error('Database connection failed'));

    try {
      await portType_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
      chai.expect(err.message).to.equal('Database connection failed');
    }
  });

  it('should handle database timeout errors', async () => {
    findAllStub.rejects(new Error('Query timeout exceeded'));

    try {
      await portType_builder.list();
      chai.expect.fail('Should have thrown an error');
    } catch (err) {
      chai.expect(err).to.exist;
      chai.expect(err.message).to.equal('Query timeout exceeded');
    }
  });

  it('should call findAll on PORT_TYPE model', async () => {
    findAllStub.resolves([]);

    await portType_builder.list();

    chai.expect(findAllStub.calledOnce).to.be.true;
    chai.expect(findAllStub.calledWith()).to.be.true;
  });

  it(
    'should correctly extract dataValues from Sequelize model instances',
    async () => {
      findAllStub.resolves([
        {
          dataValues: { id_port_type: 1, label: 'HTTP' },
          _previousDataValues: {},
          _changed: new Set(),
          _options: {},
          _modelOptions: {},
        },
      ]);

      const result = await portType_builder.list();

      chai.expect(result[0].id_port_type).to.equal(1);
      chai.expect(result[0].label).to.equal('HTTP');
    }
  );

  it('should handle port types with consistent property access', async () => {
    findAllStub.resolves([
      { dataValues: { id_port_type: 1, label: 'TCP' } },
      { dataValues: { id_port_type: 2, label: 'UDP' } },
    ]);

    const result = await portType_builder.list();

    result.forEach((portType) => {
      chai.expect(portType).to.have.property('id_port_type');
      chai.expect(portType).to.have.property('label');
    });
  });

  it('should handle port type with undefined label', async () => {
    findAllStub.resolves([
      { dataValues: { id_port_type: 1 } },
    ]);

    const result = await portType_builder.list();

    chai.expect(result[0].label).to.be.undefined;
  });

  it('should handle port type with valid id and label', async () => {
    findAllStub.resolves([
      { dataValues: { id_port_type: 1, label: 'HTTP' } },
    ]);

    const result = await portType_builder.list();

    chai.expect(result[0].id_port_type).to.equal(1);
    chai.expect(result[0].label).to.equal('HTTP');
  });

  it(
    'should maintain order of port types as returned from database',
    async () => {
      findAllStub.resolves([
        { dataValues: { id_port_type: 5, label: 'FTP' } },
        { dataValues: { id_port_type: 3, label: 'SSH' } },
        { dataValues: { id_port_type: 1, label: 'HTTP' } },
      ]);

      const result = await portType_builder.list();

      chai.expect(result[0].id_port_type).to.equal(5);
      chai.expect(result[1].id_port_type).to.equal(3);
      chai.expect(result[2].id_port_type).to.equal(1);
    }
  );

  it('should handle large number of port types', async () => {
    const portTypes = [];
    for (let i = 1; i <= 1000; i++) {
      portTypes.push({
        dataValues: { id_port_type: i, label: `PORT_${i}` },
      });
    }
    findAllStub.resolves(portTypes);

    const result = await portType_builder.list();

    chai.expect(result).to.have.lengthOf(1000);
    chai.expect(result[0].id_port_type).to.equal(1);
    chai.expect(result[999].id_port_type).to.equal(1000);
  });

  it('should create independent PortType instances', async () => {
    findAllStub.resolves([
      { dataValues: { id_port_type: 1, label: 'HTTP' } },
      { dataValues: { id_port_type: 2, label: 'HTTPS' } },
    ]);

    const result = await portType_builder.list();

    chai.expect(result[0]).to.not.equal(result[1]);
    chai.expect(result[0].id_port_type).to.not.equal(
      result[1].id_port_type
    );
  });

  it('should handle special characters in labels', async () => {
    findAllStub.resolves([
      { dataValues: { id_port_type: 1, label: 'HTTP-8080/TCP' } },
      { dataValues: { id_port_type: 2, label: 'HTTPS:443' } },
    ]);

    const result = await portType_builder.list();

    chai.expect(result[0].label).to.equal('HTTP-8080/TCP');
    chai.expect(result[1].label).to.equal('HTTPS:443');
  });

  it('should handle port type with very long label', async () => {
    const longLabel = 'CUSTOM_PORT_TYPE_WITH_VERY_LONG_DESCRIPTION_'.repeat(5);
    findAllStub.resolves([
      { dataValues: { id_port_type: 1, label: longLabel } },
    ]);

    const result = await portType_builder.list();

    chai.expect(result[0].label).to.equal(longLabel);
  });
});
