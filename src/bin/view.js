#!/usr/bin/env babel-node

const parseArgs = require('minimist')
const fs = require('fs');

const argv = parseArgs(process.argv.slice(2));

const inputFile = argv._[0];
const inputData = JSON.parse(fs.readFileSync(inputFile));

function print(data) {
  if (typeof data === "string") {
    process.stdout.write(data + "\n");
  } else if (typeof data === "object") {
    Object.keys(data).forEach((key) => {
      process.stdout.write(key + "\n\n")
      print(data[key]);
    })
  } else {
    throw Error('cannot process content of type ' + typeof data);
  }

}

print(inputData);
