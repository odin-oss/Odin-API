import z from 'zod';
import Guard from './guard.util.js';

/**
 * Function that will replace the tag keyname with the real value for customing environment.
 * @param {String} value value to search in.
 * @param {Object} custom_values custom values to put when a value is parsed.
 * @returns {String}
 */
export const parsing_generic_tags = function (
  value = '',
  custom_values = undefined
) {
  if (custom_values === undefined) return value;

  const schema = z.object({
    username: z.string().min(2),
    label: z.string().min(2),
    password: z.string().min(2),
    hash: z.string().min(2),
    generated_label: z.string().min(2),
    web_title: z.string().min(2),
    target: z.string().default(''),
  });
  const data = Guard.validateProps(schema, custom_values);
  let result = value.replace('<hash>', `${data.hash}`);
  result = result.replace('<username>', `${data.username}`);
  result = result.replace('<password>', `${data.password}`);
  result = result.replace('<generated_label>', `${data.generated_label}`);
  result = result.replace('<target>', `${data.target}`);
  result = result.replace(
    '<subpath>',
    `/${data.hash}/${data.label}${data.target ? '-terminal' : ''}`
  );
  result = result.replace('<vm_name>', `${data.web_title}`);
  return result;
};
