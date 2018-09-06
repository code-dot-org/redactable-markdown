#!/usr/bin/env node

const parseArgs = require('minimist');

const ioUtils = require('../utils/io');
const parser = require('../redactableMarkdownParser').create();
const recursivelyProcessAll = require('../utils/misc').recursivelyProcessAll;
const requireByPath = require('../utils/misc').requireByPath;

const argv = parseArgs(process.argv.slice(2));

const helpFlag = (argv.h || argv.help);
const missingRequiredFlags = !(argv.s && argv.r);
if (helpFlag || missingRequiredFlags) {
  process.stdout.write("usage: restore -s SOURCEFILE -r REDACTEDFILE\n");
  process.stdout.write("options:\n");
  process.stdout.write("\t-h, --help: print this help message\n");
  process.stdout.write("\t-o OUTFILE: output to OUTFILE rather than stdout\n");
  process.stdout.write("\t-p, --parserPlugins PLUGINS: comma-separated list of parser plugins to include in addition to the defaults\n");
  process.stdout.write("\t-c, --compilerPlugins PLUGINS: comma-separated list of compiler plugins to include in addition to the defaults\n");
  process.exit()
}

const parserPlugins = (argv.p || argv.parserPlugins)
if (parserPlugins) {
  parser.parser.use(requireByPath(parserPlugins));
}

const compilerPlugins = (argv.c || argv.compilerPlugins)
if (compilerPlugins) {
  parser.compilerPlugins.push(...requireByPath(compilerPlugins));
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
