#!/usr/bin/env babel-node

const parser = require('../cdoFlavoredParser');
const parseArgs = require('minimist')
const fs = require('fs');

const argv = parseArgs(process.argv.slice(2));

const inputfile = argv._[0];
let inputdata = fs.readFileSync(inputfile);
try {
  inputdata = JSON.parse(inputdata);
} catch (e) {
  inputdata = inputdata.toString();
}
const outputfile = argv.o;

function render(data) {
  if (typeof data === "string") {
    return parser.sourceToHtml(data);
  } else if (typeof data === "object") {
    return Object.keys(data).reduce((prev, key) => {
      const value = data[key];
      prev[key] = render(value);
      return prev;
    }, {});
  } else {
    throw Error('cannot process content of type ' + typeof data);
  }
}

const outputdata = render(inputdata);
const formattedoutput = typeof outputdata === "object" ? JSON.stringify(outputdata, null, 2) : outputdata;

if (outputfile) {
  fs.writeFileSync(outputfile, formattedoutput);
} else {
  process.stdout.write(formattedoutput)
}
