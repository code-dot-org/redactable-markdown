const fs = require('fs');

module.exports.readFromFileOrStdin = function (path, callback) {
  const readStream = path ? fs.createReadStream(path) : process.stdin;
  let inputData = "";

  readStream
    .setEncoding('utf8')
    .on('readable', () => {
      const chunk = readStream.read();
      if (chunk !== null) {
        inputData += chunk;
      }
    })
    .on('end', () => {
      callback(inputData);
    });
}

module.exports.writeToFileOrStdout = function (path, data) {
  if (path) {
    fs.writeFileSync(path, data);
  } else {
    process.stdout.write(data)
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
