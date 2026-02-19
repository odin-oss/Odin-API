import z from 'zod';
import dbManager from '../config/db.config.js';
import { Category } from '../objects/Category.js';
import { Environment } from '../objects/Environment.js';
import Guard from '../utils/guard.util.js';

/**
 * Builder that list all the categories from the db.
 * @param {Boolean} all getting all the categories (if true, even the one that are not attributed to environment).
 * @returns {Array<Category>}
 */
export const list = async function (props) {
  try {
    const schema = z.object({
      all: z.boolean().default(false),
    });
    const data = Guard.validateProps(schema, props);
    if (data.all) {
      return await dbManager.models.CATEGORY.findAll({
        include: [
          {
            model: dbManager.models.ENVIRONMENT_HAS_CATEGORY,
            include: [
              {
                model: dbManager.models.ENVIRONMENT,
              },
            ],
          },
        ],
        order: [['id_category', 'ASC']],
      }).then((cats) => {
        return cats.map(
          (cat) =>
            new Category({
              ...cat.dataValues,
              environments: cat.ENVIRONMENT_HAS_CATEGORies.map(
                (env) =>
                  new Environment({
                    id_environment: env.id_environment,
                    label: env.ENVIRONMENT.label,
                    interfaces: [],
                    icon: env.ENVIRONMENT.icon,
                  })
              ),
            })
        );
      });
    }
    return await dbManager.models.ENVIRONMENT_HAS_CATEGORY.findAll({
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
    }).then((r) => {
      const result = [];
      for (let category of r) {
        if (
          result.filter(
            (cat) => cat.id_category === category.CATEGORY.id_category
          ).length === 0
        )
          result.push(
            new Category({
              ...category.CATEGORY.dataValues,
              environments: [
                new Environment({
                  ...category.ENVIRONMENT.dataValues,
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
                ...category.ENVIRONMENT.dataValues,
                interfaces: [],
              })
            );
      }
      return result;
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Create a new Category.
 * @param {String} label label to put on the new Category.
 * @param {String} google_material_icon icon of the category.
 * @returns {Category}
 */
export const create = async function (props) {
  try {
    const schema = z.object({
      label: z.string().min(2),
      google_material_icon: z.string().min(2),
    });
    const data = Guard.validateProps(schema, props);
    return await dbManager.models.CATEGORY.create({ ...data }).then(
      (result) => new Category(result)
    );
  } catch (err) {
    throw db.sequelizeErrorManagement(err);
  }
};
