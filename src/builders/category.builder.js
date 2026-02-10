import dbManager from '../config/db.config.js';
import { Category } from '../objects/Category.js';
import { Environment } from '../objects/Environment.js';

/**
 * Builder that list all the categories from the db.
 * @returns {Array<Category>}
 */
export const list = async function () {
  const options = {
    include: [
      {
        model: dbManager.models.CATEGORY,
        required: true,
      },
      {
        model: dbManager.models.ENVIRONMENT,
        required: true,
      },
    ],
    order: [
      [{ model: dbManager.models.CATEGORY }, 'label', 'ASC'],
      [{ model: dbManager.models.ENVIRONMENT }, 'label', 'ASC'],
    ],
  };
  return await dbManager.models.ENVIRONMENT_HAS_CATEGORY.findAll(options)
    .then((r) => {
      const result = [];
      for (let category of r) {
        if (
          result.filter(
            (cat) => cat.id_category === category.CATEGORY.id_category
          ).length === 0
        )
          result.push(
            new Category({
              ...category.CATEGORY,
              environments: [
                new Environment({
                  ...category.ENVIRONMENT
                }),
              ],
            })
          );
        else
          result
            .filter(
              (cat) => cat.id_category === category.CATEGORY.id_category
            )[0]
            .environments.push(
              new Environment({
                ...category.ENVIRONMENT,
                interfaces: [],
              })
            );
      }
      return result;
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};
