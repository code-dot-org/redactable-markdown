#!/usr/bin/env babel-node

const parser = require('../cdoFlavoredParser');
const parseArgs = require('minimist')
const fs = require('fs');

const argv = parseArgs(process.argv.slice(2));

const sourceFile = argv.s
let sourceData = fs.readFileSync(sourceFile);
try {
  sourceData = JSON.parse(sourceData);
} catch (e) {
  sourceData = sourceData.toString();
}
const redactedFile = argv.r
let redactedData = fs.readFileSync(redactedFile);
try {
  redactedData = JSON.parse(redactedData);
} catch (e) {
  redactedData = redactedData.toString();
}
const outputFile = argv.o;

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

const outputData = restore(sourceData, redactedData);
const formattedOutput = typeof outputData === "object" ? JSON.stringify(outputData, null, 2) : outputData;

if (outputFile) {
  fs.writeFileSync(outputFile, formattedOutput);
} else {
  process.stdout.write(formattedOutput)
}
