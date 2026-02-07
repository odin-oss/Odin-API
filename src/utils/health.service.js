import logs from '../config/winston.config.js';
import db from '../config/db.config.js';

export const test_health = async () => {
  return await db.sequelize
    .sync()
    .then((r) => {
      const result = [];
      if (r.status === 'rejected')
        result.push({ ms: 'db', state: false, reason: r[0].reason });
      else result.push({ ms: 'db', state: true });
      return result;
    })
    .catch((err) => {
      logs.error(`[${err.name}][${err.code}] on start : ${err.message}.`);
      process.exit(1);
    });
};
