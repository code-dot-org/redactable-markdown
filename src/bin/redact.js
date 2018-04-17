#!/usr/bin/env node

const parser = require('../cdoFlavoredParser');
const parseArgs = require('minimist')
const fs = require('fs');

const argv = parseArgs(process.argv.slice(2));

const inputfile = argv._[0];
const inputdata = JSON.parse(fs.readFileSync(inputfile));
const outputfile = argv.o;

function redact(data) {
  if (typeof data === "string") {
    return parser.sourceToRedacted(data);
  } else if (typeof data === "object") {
    return Object.keys(data).reduce((prev, key) => {
      const value = data[key];
      prev[key] = redact(value);
      return prev;
    }, {});
  } else {
    throw Error('cannot process content of type ' + typeof data);
  }
}

const outputdata = redact(inputdata);

fs.writeFileSync(outputfile, JSON.stringify(outputdata, null, 2));
