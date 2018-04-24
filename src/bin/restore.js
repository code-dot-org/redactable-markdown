#!/usr/bin/env babel-node

const parser = require('../cdoFlavoredParser');
const parseArgs = require('minimist')
const fs = require('fs');

const argv = parseArgs(process.argv.slice(2));

const sourcefile = argv.s
let sourcedata = fs.readFileSync(sourcefile);
try {
  sourcedata = JSON.parse(sourcedata);
} catch (e) {
  sourcedata = sourcedata.toString();
}
const redactedfile = argv.r
let redacteddata = fs.readFileSync(redactedfile);
try {
  redacteddata = JSON.parse(redacteddata);
} catch (e) {
  redacteddata = redacteddata.toString();
}
const outputfile = argv.o;

function restore(source, redacted) {
  if (typeof source !== typeof redacted) {
    throw Error('source and redacted data must match');
  }

  if (typeof source === "string") {
    return parser.sourceAndRedactedToMarkdown(source, redacted);
  } else if (typeof source === "object") {
    return Object.keys(source).reduce((prev, key) => {
      const sourceValue = source[key];
      const redactedValue = redacted[key];
      prev[key] = restore(sourceValue, redactedValue);
      return prev;
    }, {});
  } else {
    throw Error('cannot process content of type ' + typeof data);
  }
}

const outputdata = restore(sourcedata, redacteddata);
const formattedoutput = typeof outputdata === "object" ? JSON.stringify(outputdata, null, 2) : outputdata;

if (outputfile) {
  fs.writeFileSync(outputfile, formattedoutput);
} else {
  process.stdout.write(formattedoutput)
}
