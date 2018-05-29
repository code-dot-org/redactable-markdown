const parser = require('../cdoFlavoredParser');
const parseArgs = require('minimist')
const fs = require('fs');

const argv = parseArgs(process.argv.slice(2));

const helpFlag = (argv.h || argv.help);

if (helpFlag) {
  process.stdout.write("usage: redact INPUTFILE\n");
  process.stdout.write("options:\n");
  process.stdout.write("\t-h, --help: print this help message\n");
  process.stdout.write("\t-o OUTFILE: output to OUTFILE rather than stdout\n");
  process.exit()
}

const inputFile = argv._[0];
let inputData = fs.readFileSync(inputFile);
try {
  inputData = JSON.parse(inputData);
} catch (e) {
  inputData = inputData.toString();
}
const outputFile = argv.o;

function redact(data) {
  if (typeof data === "string") {
    if (data) {
      return parser.sourceToRedacted(data);
    }
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

const outputData = redact(inputData);
const formattedOutput = typeof outputData === "object" ? JSON.stringify(outputData, null, 2) : outputData;

if (outputFile) {
  fs.writeFileSync(outputFile, formattedOutput);
} else {
  process.stdout.write(formattedOutput)
}
