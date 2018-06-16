const parseArgs = require('minimist');

const ioUtils = require('../utils/io');
const parser = require('../cdoFlavoredParser');

const argv = parseArgs(process.argv.slice(2));

const helpFlag = (argv.h || argv.help);
const missingRequiredFlags = !(argv.s && argv.r);

if (helpFlag || missingRequiredFlags) {
  process.stdout.write("usage: restore -s SOURCEFILE -r REDACTEDFILE\n");
  process.stdout.write("options:\n");
  process.stdout.write("\t-h, --help: print this help message\n");
  process.stdout.write("\t-o OUTFILE: output to OUTFILE rather than stdout\n");
  process.exit()
}

Promise.all([
  ioUtils.readFromFileOrStdin(argv.s).then(ioUtils.parseAsSerialized),
  ioUtils.readFromFileOrStdin(argv.r).then(ioUtils.parseAsSerialized),
]).then(([source, redacted]) => restore(source, redacted))
  .then(ioUtils.formatAsSerialized)
  .then(ioUtils.writeToFileOrStdout.bind(ioUtils, argv.o));

function restore(source, redacted) {
  if (typeof source !== typeof redacted) {
    throw Error('source and redacted data must match');
  }

  if (typeof source === "string") {
    if (source && redacted) {
      return parser.sourceAndRedactedToMarkdown(source, redacted);
    }
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
