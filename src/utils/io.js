const fs = require('fs');
const yaml = require('js-yaml');

module.exports.readFromFileOrStdin = function (path) {
  const readStream = path ? fs.createReadStream(path) : process.stdin;
  let inputData = "";

  return new Promise((resolve, reject) => {
    readStream
      .setEncoding('utf8')
      .on('readable', () => {
        const chunk = readStream.read();
        if (chunk !== null) {
          inputData += chunk;
        }
      })
      .on('error', reject)
      .on('end', () => {
        resolve(inputData);
      });
  });
}

module.exports.writeToFileOrStdout = function (path, data) {
  if (path) {
    fs.writeFileSync(path, data);
  } else {
    process.stdout.write(data)
  }
}

module.exports.serialize = function (format, output) {
  if (!format) {
    format = (typeof output === "object") ? 'json' : 'txt';
  }

  if (format === 'json') {
    return JSON.stringify(output, null, 2);
  } else if (format === 'yaml') {
    return yaml.safeDump(output, {
      noRefs: true,
      lineWidth: -1
    });
  } else if (format === 'txt') {
    return output.toString();
  } else {
    throw Error("do not know how to serialize to format " + format);
  }
}

module.exports.deserialize = function (input) {
  try {
    return JSON.parse(input);
  } catch (e) {
    // input is not valid JSON
  }

  try {
    return yaml.safeLoad(input);
  } catch (e) {
    // input is not valid YAML
  }

  return input.toString();
}
