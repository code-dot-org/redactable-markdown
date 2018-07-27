/**
 * Given an input or set of inputs, which can each be a string, array, or
 * object, iterate through every input in parallel and call the handler on each
 * set of matching leaf nodes.
 *
 * Note that if given a set of inputs, every input in the set must have the same
 * basic structure of object keys, array lengths, and leaf types.
 */
function recursivelyProcessAll (handler, inputs, isValue) {
  if (!Array.isArray(inputs)) {
    inputs = [inputs]
  }

  if (inputs.some(input => !input)) {
    return;
  }

  const inputType = typeof inputs[0];
  if (inputs.length && inputs.some(input => typeof input !== inputType)) {
    throw Error('all data to process must have the same structure');
  }

  if (inputType === "string") {
    const result = handler(...inputs);
    if (isValue && typeof result === "string") {
      // strings generated by remark-stringify always end with a newline to
      // ensure valid POSIX files, but if the string is going to be used as the
      // value of an object rather than being written out to a file, we can drop
      // it.
      return result.slice(0, -1);
    } else {
      return result;
    }
  } else if (Array.isArray(inputs[0])) {
    return inputs[0].map((_, i) => {
      const values = inputs.map(input => input[i]);
      return recursivelyProcessAll(handler, values, true);
    })
  } else if (inputType === "object") {
    return Object.keys(inputs[0]).reduce((prev, key) => {
      const values = inputs.map(input => input[key]);
      prev[key] = recursivelyProcessAll(handler, values, true);
      return prev;
    }, {});
  } else {
    throw Error('cannot process content of type ' + inputType );
  }
}

module.exports.recursivelyProcessAll = recursivelyProcessAll;
