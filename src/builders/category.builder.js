import db from '../config/db.config.js';
import { Category } from '../objects/Category.js';
import { Environment } from '../objects/Environment.js';

/**
 * Builder that list all the categories from the db.
 * @returns
 */
export const list = async function () {
  const options = {
    include: [
      {
        model: db.cirrus.CATEGORY,
        required: true,
      },
      {
        model: db.cirrus.ENVIRONMENT,
        required: true,
      },
    ],
    order: [
      [{ model: db.cirrus.CATEGORY }, 'label', 'ASC'],
      [{ model: db.cirrus.ENVIRONMENT }, 'label', 'ASC'],
    ],
  };
  return await Promise.resolve(
    db.cirrus.ENVIRONMENT_HAS_CATEGORY.findAll(options)
  )
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
              id_category: category.CATEGORY.id_category,
              label: category.CATEGORY.label,
              google_material_icon: category.CATEGORY.google_material_icon,
              environments: [
                new Environment({
                  id_environment: category.ENVIRONMENT.id_environment,
                  label: category.ENVIRONMENT.label,
                  icon: category.ENVIRONMENT.icon,
                  interfaces: [],
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
                id_environment: category.ENVIRONMENT.id_environment,
                label: category.ENVIRONMENT.label,
                icon: category.ENVIRONMENT.icon,
                interfaces: [],
              })
            );
      }
      return result;
    })
    .catch((err) => {
      throw db.sequelizeErrorManagement(err);
    });
};
