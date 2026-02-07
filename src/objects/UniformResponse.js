import moment from 'moment-timezone';
import CONFIG from '../config/config.js';
import Guard from '../utils/guard.service.js';

export default class UniformResponse {
  static json(props) {
    Guard.control(props, {
      status: Guard.check_status,
      message: Guard.check_string,
      data: Guard.check_JSON,
    });
    return {
      status: props.status,
      message: props.message,
      data: props.data,
      timestamp: moment.tz(CONFIG.APP_TZ),
    };
  }
}
