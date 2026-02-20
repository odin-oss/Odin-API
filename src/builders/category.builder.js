import z from 'zod';
import dbManager from '../config/db.config.js';
import { Category } from '../objects/Category.js';
import { Environment } from '../objects/Environment.js';
import Guard from '../utils/guard.util.js';
import {
  DBObjectAlreadyExists,
  DBObjectNotFound,
} from '../utils/errors.util.js';

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
    throw dbManager.sequelizeErrorManagement(err);
  }
};
/**
 * Detaching an Environment from the Category in DB.
 * @param {Number} id_category id of the category.
 * @param {Number} id_environment id of the environment.
 * @param {Function} fns functions to overwrite for testing purpose.
 * @returns {Category}
 */
export const detach_environment = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      id_environment: z.coerce.number().int().positive(),
      id_category: z.coerce.number().int().positive(),
    });
    const data = Guard.validateProps(schema, props);

    const category = await dbManager.models.CATEGORY.findByPk(
      data.id_category,
      {
        include: [{ model: dbManager.models.ENVIRONMENT_HAS_CATEGORY }],
      }
    );
    if (!category)
      throw new DBObjectNotFound(`No Category found with this id.`);

    // Checking if the environment is not already attached
    const alreadyAttached =
      await dbManager.models.ENVIRONMENT_HAS_CATEGORY.findOne({
        where: { ...data },
      });
    if (!alreadyAttached)
      throw new DBObjectAlreadyExists(
        `The Environment is already detached to this Category.`
      );

    // Detaching the Environment
    await dbManager.models.ENVIRONMENT_HAS_CATEGORY.destroy({
      where: { ...data },
    });

    // Sending the complete Category object
    return await fns.get(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Get a specific category by id with environments in it.
 * @param {Number} id_category id of the category.
 * @returns {Category}
 */
export const get = async function (props) {
  try {
    const schema = z.object({
      id_category: z.coerce.number().int().positive(),
    });
    const data = Guard.validateProps(schema, props);
    return await dbManager.models.CATEGORY.findOne({
      where: { ...data },
      include: [
        {
          model: dbManager.models.ENVIRONMENT_HAS_CATEGORY,
          include: [{ model: dbManager.models.ENVIRONMENT }],
        },
      ],
      order: [['id_category', 'ASC']],
    }).then(
      (cat) =>
        new Category({
          ...cat.dataValues,
          environments: cat.ENVIRONMENT_HAS_CATEGORies.map(
            (env) =>
              new Environment({
                ...env.ENVIRONMENT.dataValues,
                interfaces: [],
              })
          ),
        })
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Attaching a new Environment to the Category in DB.
 * @param {Number} id_category id of the category.
 * @param {Number} id_environment id of the environment.
 * @param {Function} fns functions to overwrite for testing purpose.
 * @returns {Category}
 */
export const attach_environment = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      id_environment: z.coerce.number().int().positive(),
      id_category: z.coerce.number().int().positive(),
    });
    const data = Guard.validateProps(schema, props);

    const category = await dbManager.models.CATEGORY.findByPk(
      data.id_category,
      {
        include: [{ model: dbManager.models.ENVIRONMENT_HAS_CATEGORY }],
      }
    );
    if (!category)
      throw new DBObjectNotFound(`No Category found with this id.`);

    // Checking if the environment is not already attached
    const alreadyAttached =
      await dbManager.models.ENVIRONMENT_HAS_CATEGORY.findOne({
        where: { ...data },
      });

    if (alreadyAttached)
      throw new DBObjectAlreadyExists(
        `The Environment is already attached to this Category.`
      );

    // Attaching the Environment
    await dbManager.models.ENVIRONMENT_HAS_CATEGORY.create(data);

    // Sending the complete Category object
    return await fns.get(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Function that update the label of a specific Category.
 * @param {Number} id_category id of the category.
 * @param {String} label new label of the Category.
 * @param {String} google_material_icon new icon of the Category.
 * @param {Function} fns functions to overwrite for testing purpose.
 * @returns {Category}
 */
export const update = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      id_category: z.coerce.number().int().positive(),
      label: z.string().min(2),
      google_material_icon: z.string().min(2),
    });
    const data = Guard.validateProps(schema, props);
    await dbManager.models.CATEGORY.update(
      {
        label: data.label,
        google_material_icon: data.google_material_icon,
      },
      {
        where: { id_category: data.id_category },
        returning: true,
      }
    );

    // Returning the complete updated version of the Category
    return await fns.get(props);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Deleting a Category from the database.
 * @param {Number} id_category id of the category.
 * @returns {Category}
 */
export const del = async function (props) {
  try {
    const schema = z.object({
      id_category: z.coerce.number().int().positive(),
    });
    const data = Guard.validateProps(schema, props);

    const category = await dbManager.models.CATEGORY.findByPk(
      data.id_category,
      {
        include: [
          {
            model: dbManager.models.ENVIRONMENT_HAS_CATEGORY,
            include: [{ model: dbManager.models.ENVIRONMENT }],
          },
        ],
      }
    );
    if (!category) throw new DBObjectNotFound(`Category not found.`);

    // Deleting the Category
    return await dbManager.models.CATEGORY.destroy({
      where: { id_category: data.id_category },
    }).then(
      () =>
        new Category({
          ...category.dataValues,
          environments: category.ENVIRONMENT_HAS_CATEGORies.map(
            (env) =>
              new Environment({
                ...env.ENVIRONMENT.dataValues,
                interfaces: [],
              })
          ),
        })
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
