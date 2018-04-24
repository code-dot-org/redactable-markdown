#!/usr/bin/env babel-node

const parseArgs = require('minimist')
const fs = require('fs');

const argv = parseArgs(process.argv.slice(2));

const inputfile = argv._[0];
const inputdata = JSON.parse(fs.readFileSync(inputfile));

function print(data) {
  if (typeof data === "string") {
    console.log(data);
  } else if (typeof data === "object") {
    Object.keys(data).forEach((key) => {
      console.log(key + "\n")
      print(data[key]);
    })
  } else {
    throw Error('cannot process content of type ' + typeof data);
  }

}

print(inputdata);
