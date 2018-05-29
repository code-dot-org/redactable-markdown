const parser = require('../cdoFlavoredParser');
const parseArgs = require('minimist')
const fs = require('fs');

const argv = parseArgs(process.argv.slice(2));

const inputFile = argv._[0];
let inputData = fs.readFileSync(inputFile);
try {
  inputData = JSON.parse(inputData);
} catch (e) {
  inputData = inputData.toString();
}
const outputFile = argv.o;

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

const outputData = render(inputData);
const formattedOutput = typeof outputData === "object" ? JSON.stringify(outputData, null, 2) : outputData;

if (outputFile) {
  fs.writeFileSync(outputFile, formattedOutput);
} else {
  process.stdout.write(formattedOutput)
}
