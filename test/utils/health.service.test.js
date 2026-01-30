import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import CONFIG from '../../src/config/config.js';
import {
  BadTypeArgumentError,
  MissingArgumentError,
  ParameterMisformed,
} from '../../src/utils/errors.service.js';
import * as health_service from '../../src/utils/health.service.js';
import moment from 'moment-timezone';
chai.use(sinonChai);
