import * as chai from 'chai';
import { ImageType } from '../../src/objects/Image_type.js';

describe('ImageType object', () => {
  describe('constructor and validation', () => {
    it('should create an ImageType with valid properties', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'docker',
      });

      chai.expect(imageType.id_type).to.equal(1);
      chai.expect(imageType.label).to.equal('docker');
    });

    it('should accept numeric id_type and coerce it', () => {
      const imageType = new ImageType({
        id_type: '5',
        label: 'kubernetes',
      });

      chai.expect(imageType.id_type).to.equal(5);
    });

    it('should sanitize label to lowercase alphanumeric with hyphens', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'Docker@Image#2024',
      });

      chai.expect(imageType.label).to.equal('dockerimage2024');
    });

    it('should convert label to lowercase', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'KUBERNETES',
      });

      chai.expect(imageType.label).to.equal('kubernetes');
    });

    it('should preserve hyphens in labels', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'vm-image-v2',
      });

      chai.expect(imageType.label).to.equal('vm-image-v2');
    });

    it('should preserve numbers in labels', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'image123type456',
      });

      chai.expect(imageType.label).to.equal('image123type456');
    });

    it('should reject id_type as 0 (non-positive)', () => {
      chai
        .expect(() => {
          new ImageType({
            id_type: 0,
            label: 'docker',
          });
        })
        .to.throw();
    });

    it('should reject negative id_type', () => {
      chai
        .expect(() => {
          new ImageType({
            id_type: -1,
            label: 'docker',
          });
        })
        .to.throw();
    });

    it('should reject non-numeric id_type', () => {
      chai
        .expect(() => {
          new ImageType({
            id_type: 'invalid',
            label: 'docker',
          });
        })
        .to.throw();
    });

    it('should reject label shorter than 2 characters', () => {
      chai
        .expect(() => {
          new ImageType({
            id_type: 1,
            label: 'a',
          });
        })
        .to.throw();
    });

    it('should accept label with exactly 2 characters', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'vm',
      });

      chai.expect(imageType.label).to.equal('vm');
    });

    it('should reject label longer than 255 characters', () => {
      const longLabel = 'a'.repeat(256);
      chai
        .expect(() => {
          new ImageType({
            id_type: 1,
            label: longLabel,
          });
        })
        .to.throw();
    });

    it('should accept label with exactly 255 characters', () => {
      const label = 'a'.repeat(255);
      const imageType = new ImageType({
        id_type: 1,
        label: label,
      });

      chai.expect(imageType.label).to.have.lengthOf(255);
    });

    it('should reject missing id_type', () => {
      chai
        .expect(() => {
          new ImageType({
            label: 'docker',
          });
        })
        .to.throw();
    });

    it('should convert undefined label to string during preprocessing', () => {
      // Zod preprocessor converts undefined to string "undefined" which has length 9
      const imageType = new ImageType({
        id_type: 1,
        label: undefined,
      });
      // The preprocessor converts undefined to the string "undefined"
      chai.expect(imageType.label).to.equal('undefined');
    });

    it('should reject null id_type', () => {
      chai
        .expect(() => {
          new ImageType({
            id_type: null,
            label: 'docker',
          });
        })
        .to.throw();
    });

    it('should convert null label to string during preprocessing', () => {
      // Zod preprocessor converts null to string "null" which has length 4
      const imageType = new ImageType({
        id_type: 1,
        label: null,
      });
      // The preprocessor converts null to the string "null"
      chai.expect(imageType.label).to.equal('null');
    });

    it('should reject undefined id_type', () => {
      chai
        .expect(() => {
          new ImageType({
            id_type: undefined,
            label: 'docker',
          });
        })
        .to.throw();
    });

    it('should convert completely missing label to undefined string during preprocessing', () => {
      // When label is completely missing, Zod treats it as undefined
      // and the preprocessor converts it to the string "undefined"
      const imageType = new ImageType({
        id_type: 1,
      });

      chai.expect(imageType.label).to.equal('undefined');
    });

    it('should reject label with only special characters', () => {
      chai
        .expect(() => {
          new ImageType({
            id_type: 1,
            label: '@#$%^&*()',
          });
        })
        .to.throw();
    });

    it('should handle label with mixed case and special characters', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'Docker@IMAGE#Type',
      });

      chai.expect(imageType.label).to.equal('dockerimagetype');
    });

    it('should handle string numeric id_type and coerce to integer', () => {
      const imageType = new ImageType({
        id_type: '42',
        label: 'docker',
      });

      chai.expect(imageType.id_type).to.equal(42);
    });
  });

  describe('getters', () => {
    it('should return id_type value', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'docker',
      });

      chai.expect(imageType.id_type).to.equal(1);
    });

    it('should return label value', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'kubernetes',
      });

      chai.expect(imageType.label).to.equal('kubernetes');
    });

    it('should return sanitized label from getter', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'Docker@Image',
      });

      chai.expect(imageType.label).to.equal('dockerimage');
    });
  });

  describe('setters', () => {
    it('should set new id_type value', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'docker',
      });

      imageType.id_type = 5;
      chai.expect(imageType.id_type).to.equal(5);
    });

    it('should set new label value', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'docker',
      });

      imageType.label = 'kubernetes';
      chai.expect(imageType.label).to.equal('kubernetes');
    });

    it('should allow multiple setter calls', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'docker',
      });

      imageType.id_type = 2;
      imageType.label = 'kubernetes';
      imageType.id_type = 3;

      chai.expect(imageType.id_type).to.equal(3);
      chai.expect(imageType.label).to.equal('kubernetes');
    });
  });

  describe('toJSON()', () => {
    it('should return object with id_type and label properties', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'docker',
      });

      const json = imageType.toJSON();

      chai.expect(json).to.deep.equal({
        id_type: 1,
        label: 'docker',
      });
    });

    it('should serialize with sanitized label', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'Docker@Image',
      });

      const json = imageType.toJSON();

      chai.expect(json.label).to.equal('dockerimage');
    });

    it('should return new object on each call', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'docker',
      });

      const json1 = imageType.toJSON();
      const json2 = imageType.toJSON();

      chai.expect(json1).to.deep.equal(json2);
      chai.expect(json1).to.not.equal(json2);
    });

    it('should be JSON stringifiable', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'docker',
      });

      const jsonString = JSON.stringify(imageType.toJSON());

      chai.expect(jsonString).to.equal('{"id_type":1,"label":"docker"}');
    });

    it('should not include private fields in JSON', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'docker',
      });

      const json = imageType.toJSON();
      const keys = Object.keys(json);

      chai.expect(keys).to.deep.equal(['id_type', 'label']);
      chai.expect(keys).to.not.include('#id_type');
      chai.expect(keys).to.not.include('#label');
    });

    it('should have correct keys in JSON output', () => {
      const imageType = new ImageType({
        id_type: 42,
        label: 'custom-type',
      });

      const json = imageType.toJSON();

      chai.expect(json).to.have.property('id_type', 42);
      chai.expect(json).to.have.property('label', 'custom-type');
      chai.expect(Object.keys(json)).to.have.lengthOf(2);
    });
  });

  describe('schema validation', () => {
    it('should have schema property', () => {
      chai.expect(ImageType.schema).to.exist;
    });

    it('should validate positive integer id_type', () => {
      const schema = ImageType.schema;
      const result = schema.safeParse({
        id_type: 1,
        label: 'docker',
      });

      chai.expect(result.success).to.be.true;
    });

    it('should reject zero id_type', () => {
      const schema = ImageType.schema;
      const result = schema.safeParse({
        id_type: 0,
        label: 'docker',
      });

      chai.expect(result.success).to.be.false;
    });

    it('should reject negative id_type', () => {
      const schema = ImageType.schema;
      const result = schema.safeParse({
        id_type: -5,
        label: 'docker',
      });

      chai.expect(result.success).to.be.false;
    });

    it('should validate label minimum length', () => {
      const schema = ImageType.schema;
      const result = schema.safeParse({
        id_type: 1,
        label: 'ab',
      });

      chai.expect(result.success).to.be.true;
    });

    it('should reject label below minimum length', () => {
      const schema = ImageType.schema;
      const result = schema.safeParse({
        id_type: 1,
        label: 'a',
      });

      chai.expect(result.success).to.be.false;
    });

    it('should validate label maximum length', () => {
      const schema = ImageType.schema;
      const result = schema.safeParse({
        id_type: 1,
        label: 'a'.repeat(255),
      });

      chai.expect(result.success).to.be.true;
    });

    it('should reject label exceeding maximum length', () => {
      const schema = ImageType.schema;
      const result = schema.safeParse({
        id_type: 1,
        label: 'a'.repeat(256),
      });

      chai.expect(result.success).to.be.false;
    });
  });

  describe('edge cases', () => {
    it('should handle large id_type values', () => {
      const imageType = new ImageType({
        id_type: 999999,
        label: 'docker',
      });

      chai.expect(imageType.id_type).to.equal(999999);
    });

    it('should handle label with hyphens at start and end', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: '-docker-',
      });

      chai.expect(imageType.label).to.equal('-docker-');
    });

    it('should handle label with numbers at start', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: '2024docker',
      });

      chai.expect(imageType.label).to.equal('2024docker');
    });

    it('should handle label with consecutive hyphens', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'docker--image',
      });

      chai.expect(imageType.label).to.equal('docker--image');
    });

    it('should handle whitespace removal in label', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'docker image type',
      });

      chai.expect(imageType.label).to.equal('dockerimagetype');
    });

    it('should handle tabs and newlines in label', () => {
      const imageType = new ImageType({
        id_type: 1,
        label: 'docker\n\timage',
      });

      chai.expect(imageType.label).to.equal('dockerimage');
    });
  });

  describe('multiple instances', () => {
    it('should create multiple independent instances', () => {
      const type1 = new ImageType({
        id_type: 1,
        label: 'docker',
      });

      const type2 = new ImageType({
        id_type: 2,
        label: 'kubernetes',
      });

      chai.expect(type1.id_type).to.equal(1);
      chai.expect(type2.id_type).to.equal(2);
      chai.expect(type1.label).to.equal('docker');
      chai.expect(type2.label).to.equal('kubernetes');
    });

    it('should not affect other instances when modifying one', () => {
      const type1 = new ImageType({
        id_type: 1,
        label: 'docker',
      });

      const type2 = new ImageType({
        id_type: 2,
        label: 'kubernetes',
      });

      type1.id_type = 10;

      chai.expect(type1.id_type).to.equal(10);
      chai.expect(type2.id_type).to.equal(2);
    });
  });
});
