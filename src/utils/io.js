const fs = require('fs');

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
      .on('error', (error) => {
        reject(error);
      })
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

module.exports.formatAsSerialized = function (output, format) {
  if (!format) {
    format = (typeof output === "object") ? 'json' : 'txt';
  }

  if (format === 'json') {
    return JSON.stringify(output, null, 2);
  } else if (format === 'txt') {
    return output.toString();
  } else {
    throw Error("do not know how to output to format " + format);
  }
}

module.exports.parseAsSerialized = function (input) {
  try {
    return JSON.parse(input);
  } catch (e) {
    // input is not valid JSON
  }

  return input.toString();
}
