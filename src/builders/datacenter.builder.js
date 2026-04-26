import z from 'zod';
import dbManager from '../config/db.config.js';
import { Datacenter } from '../objects/Datacenter.js';
import { DBObjectNotFound } from '../utils/errors.util.js';
import Guard from '../utils/guard.util.js';
import Agent, { Agent_state } from '../objects/Agent.js';

/**
 * Builder that fetchs all the dcs in the database.
 * @returns {Array<Datacenter>}
 */
export const list = async function () {
  return await dbManager.models.DATACENTER.findAll({
    include: [
      {
        model: dbManager.models.AGENT,
        include: [
          {
            model: dbManager.models.ENUM_AGENT_STATE,
          },
        ],
      },
    ],
  })
    .then((dcs) =>
      dcs.map(
        (dc) =>
          new Datacenter({
            ...dc.dataValues,
            agent: dc.AGENT
              ? new Agent({
                  ...dc.AGENT.dataValues,
                  status: new Agent_state({
                    id_enum_agent_state:
                      dc.AGENT.ENUM_AGENT_STATE.id_enum_agent_state,
                    label: dc.AGENT.ENUM_AGENT_STATE.label,
                  }),
                })
              : undefined,
          })
      )
    )
    .catch(dbManager.sequelizeErrorManagement);
};

/**
 * Builder that gets the specific datacenter in database.
 * @param {Number} id_datacenter id of the datacenter to get.
 * @returns {Datacenter}
 */
export const get = async function (props) {
  const schema = z.object({
    id_datacenter: z.number().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await dbManager.models.DATACENTER.findOne({
    where: { ...data },
    include: [
      {
        model: dbManager.models.AGENT,
        include: [
          {
            model: dbManager.models.ENUM_AGENT_STATE,
          },
        ],
      },
    ],
  })
    .then((r) => {
      if (r == null)
        throw new DBObjectNotFound('The datacenter could not be found.');
      return new Datacenter({
        ...r.dataValues,
        agent: r.AGENT
          ? new Agent({
              ...r.AGENT.dataValues,
              status: new Agent_state({
                id_enum_agent_state:
                  r.AGENT.ENUM_AGENT_STATE.id_enum_agent_state,
                label: r.AGENT.ENUM_AGENT_STATE.label,
              }),
            })
          : undefined,
      });
    })
    .catch(dbManager.sequelizeErrorManagement);
};

/**
 * Builder that creates the new datacenter in database.
 * @param {String} label label of the new Datacenter to be created.
 * @param {String} provider provider of the new Datacenter to be created.
 * @param {String} city city of the new Datacenter to be created.
 * @returns {Datacenter}
 */
export const create = async function (props) {
  try {
    const schema = z.object({
      label: z.preprocess(
        (val) =>
          String(val)
            .replace(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase(),
        z.string().min(2)
      ),
      city: z.string().min(2),
      provider: z.preprocess(
        (val) =>
          String(val)
            .replace(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase(),
        z.string().min(2)
      ),
    });
    const data = Guard.validateProps(schema, props);
    return await dbManager.models.DATACENTER.create(data).then(
      (result) => new Datacenter(result.dataValues)
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Builder that updates the datacenter in database.
 * @param {String} label label of the new Datacenter to be updated.
 * @param {String} provider provider of the new Datacenter to be updated.
 * @param {String} city city of the new Datacenter to be updated.
 * @param {Number} id_datacenter id of the datacenter to update.
 * @param {Function} fns functions to overwriting for tests purpose.
 * @returns {Datacenter}
 */
export const update = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      label: z.preprocess(
        (val) =>
          String(val)
            .replace(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase(),
        z.string().min(2)
      ),
      city: z.string().min(2),
      provider: z.preprocess(
        (val) =>
          String(val)
            .replace(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase(),
        z.string().min(2)
      ),
      id_datacenter: z.coerce.number().int().positive(),
    });
    const data = Guard.validateProps(schema, props);
    await dbManager.models.DATACENTER.update(
      {
        label: data.label,
        city: data.city,
        provider: data.provider,
      },
      { where: { id_datacenter: data.id_datacenter } }
    );
    return await fns.get(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Builder that executes the deletion of the datacenter.
 * @param {Number} id_datacenter id of the datacenter to update.
 * @returns {Datacenter}
 */
export const del = async function (
  props = {
    id_datacenter: undefined,
  }
) {
  try {
    const schema = z.object({
      id_datacenter: z.coerce.number().int().positive(),
    });
    const data = Guard.validateProps(schema, props);
    const dc = await dbManager.models.DATACENTER.findOne({
      where: { id_datacenter: data.id_datacenter },
    });
    if (!dc)
      throw new DBObjectNotFound('The datacenter is not existing in database.');
    return await dbManager.models.DATACENTER.destroy({
      where: { id_datacenter: data.id_datacenter },
    }).then(() => new Datacenter(dc.dataValues));
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Builder that creates the new datacenter in database.
 * @param {Number} id_datacenter id of the datacenter to update.
 * @param {String} id_agent id of the agent to add to the datacenter.
 * @param {Function} fns functions to overwriting for tests purpose.
 * @returns {Datacenter}
 */
export const addAgent = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      id_datacenter: z.coerce.number().int().positive(),
      id_agent: z.string().min(2),
    });

    const data = Guard.validateProps(schema, props);
    const agent = await dbManager.models.AGENT.findOne({
      where: { id_agent: data.id_agent },
      include: [
        {
          model: dbManager.models.ENUM_AGENT_STATE,
          required: true,
        },
      ],
    });
    if (!agent)
      throw new DBObjectNotFound('The agent is not existing in database.');
    if (agent.ENUM_AGENT_STATE.label !== 'Available')
      throw new Error(
        'The agent is not available to be added to a datacenter.'
      );

    const status_attributed = await dbManager.models.ENUM_AGENT_STATE.findOne({
      where: { label: 'Attributed' },
    });
    if (!status_attributed)
      throw new DBObjectNotFound(
        'The status attributed could not be found in database.'
      );

    await dbManager.models.DATACENTER.update(
      {
        id_agent: data.id_agent,
      },
      { where: { id_datacenter: data.id_datacenter } }
    );

    await dbManager.models.AGENT.update(
      {
        id_enum_agent_state: status_attributed.id_enum_agent_state,
      },
      { where: { id_agent: data.id_agent } }
    );
    return await fns.get(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
