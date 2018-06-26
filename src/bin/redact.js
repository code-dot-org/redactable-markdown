const parseArgs = require('minimist');

const ioUtils = require('../utils/io');
const parser = require('../cdoFlavoredParser');
const recursivelyProcessAll = require('../utils/misc').recursivelyProcessAll;

const argv = parseArgs(process.argv.slice(2));

const helpFlag = (argv.h || argv.help);

if (helpFlag) {
  process.stdout.write("usage: redact [INFILE] [options]\n");
  process.stdout.write("\n");
  process.stdout.write("Reads content from INFILE if specified, STDIN otherwise.\n");
  process.stdout.write("Content can be plain text or JSON.\n");
  process.stdout.write("Content will be redacted. If the content is JSON, all string values (including those several levels deep) will be redacted.\n");
  process.stdout.write("\n");
  process.stdout.write("options:\n");
  process.stdout.write("\t-h, --help: print this help message\n");
  process.stdout.write("\t-o OUTFILE: output to OUTFILE rather than stdout\n");
  process.stdout.write("\t-f FORMAT ( json | yaml | txt ): format output as FORMAT. If not specified, will format object data as json and all other data as text\n");
  process.exit()
}

function redact(data) {
  return recursivelyProcessAll(parser.sourceToRedacted.bind(parser), data);
}

ioUtils.readFromFileOrStdin(argv._[0])
  .then(ioUtils.deserialize)
  .then(redact)
  .then(ioUtils.serialize.bind(null, argv.f))
  .then(ioUtils.writeToFileOrStdout.bind(null, argv.o));
