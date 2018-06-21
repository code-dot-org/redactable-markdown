const parseArgs = require('minimist');

const ioUtils = require('../utils/io');
const parser = require('../cdoFlavoredParser');
const recursivelyProcessAll = require('../utils/misc').recursivelyProcessAll;

const argv = parseArgs(process.argv.slice(2));

const helpFlag = (argv.h || argv.help);
const missingRequiredFlags = !(argv.s && argv.r);

if (helpFlag || missingRequiredFlags) {
  process.stdout.write("usage: restore -s SOURCEFILE -r REDACTEDFILE\n");
  process.stdout.write("options:\n");
  process.stdout.write("\t-h, --help: print this help message\n");
  process.stdout.write("\t-o OUTFILE: output to OUTFILE rather than stdout\n");
  process.stdout.write("\t-f FORMAT ( json | yaml | txt ): format output as FORMAT. If not specified, will format object data as json and all other data as text\n");
  process.exit()
}

function restore(data) {
  return recursivelyProcessAll(parser.sourceAndRedactedToMarkdown.bind(parser), data);
}

Promise.all([
  ioUtils.readFromFileOrStdin(argv.s).then(ioUtils.deserialize),
  ioUtils.readFromFileOrStdin(argv.r).then(ioUtils.deserialize),
]).then(restore)
  .then(ioUtils.serialize.bind(null, argv.f))
  .then(ioUtils.writeToFileOrStdout.bind(null, argv.o));
