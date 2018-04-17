#!/usr/bin/env node

const parser = require('../cdoFlavoredParser');
const parseArgs = require('minimist')
const fs = require('fs');

const argv = parseArgs(process.argv.slice(2));

const sourcefile = argv.s
const sourcedata = JSON.parse(fs.readFileSync(sourcefile));
const redactedfile = argv.r
const redacteddata = JSON.parse(fs.readFileSync(redactedfile));
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

fs.writeFileSync(outputfile, JSON.stringify(outputdata, null, 2));

