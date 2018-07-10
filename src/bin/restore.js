#!/usr/bin/env node

const parseArgs = require('minimist');

const ioUtils = require('../utils/io');
const parser = require('../redactableMarkdownParser').create();
const recursivelyProcessAll = require('../utils/misc').recursivelyProcessAll;

const argv = parseArgs(process.argv.slice(2));

const helpFlag = (argv.h || argv.help);
const missingRequiredFlags = !(argv.s && argv.r);
if (helpFlag || missingRequiredFlags) {
  process.stdout.write("usage: restore -s SOURCEFILE -r REDACTEDFILE\n");
  process.stdout.write("options:\n");
  process.stdout.write("\t-h, --help: print this help message\n");
  process.stdout.write("\t-o OUTFILE: output to OUTFILE rather than stdout\n");
  process.stdout.write("\t-p, --plugins PLUGINS: comma-separated list of parser plugins to include in addition to the defaults\n");
  process.exit()
}

const plugins = (argv.p || argv.plugins)
if (plugins) {
  parser.loadPlugins(plugins);
}

function restore(data) {
  return recursivelyProcessAll(parser.sourceAndRedactedToMarkdown.bind(parser), data);
}

Promise.all([
  ioUtils.readFromFileOrStdin(argv.s).then(ioUtils.parseAsSerialized),
  ioUtils.readFromFileOrStdin(argv.r).then(ioUtils.parseAsSerialized),
]).then(restore)
  .then(ioUtils.formatAsSerialized)
  .then(ioUtils.writeToFileOrStdout.bind(ioUtils, argv.o));
