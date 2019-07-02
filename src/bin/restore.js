#!/usr/bin/env node

const parseArgs = require('minimist');

const ioUtils = require('../utils/io');
const recursivelyProcessAll = require('../utils/misc').recursivelyProcessAll;
const requireByPath = require('../utils/misc').requireByPath;

const MarkdownProcessor = require('../redactableMarkdownProcessor');
const TextProcessor = require('../redactableProcessor');

const argv = parseArgs(process.argv.slice(2));

const helpFlag = (argv.h || argv.help);
const missingRequiredFlags = !(argv.s && argv.r);
if (helpFlag || missingRequiredFlags) {
  process.stdout.write("usage: restore -s SOURCEFILE -r REDACTEDFILE\n");
  process.stdout.write("options:\n");
  process.stdout.write("\t-h, --help: print this help message\n");
  process.stdout.write("\t-o OUTFILE: output to OUTFILE rather than stdout\n");
  process.stdout.write("\t-f, --format [md|txt]: specify format of content (default to markdown)\n");
  process.stdout.write("\t-p, --parserPlugins PLUGINS: comma-separated list of parser plugins to include in addition to the defaults\n");
  process.stdout.write("\t-c, --compilerPlugins PLUGINS: comma-separated list of compiler plugins to include in addition to the defaults\n");
  process.stdout.write("\t-v, --checkRestorations Discard restoration if redactions are added or missing");
  process.exit()
}

const format = (argv.f || argv.format)
let processor;
if (format && format === 'txt') {
  processor = TextProcessor.create()
} else {
  processor = MarkdownProcessor.create()
}

const parserPlugins = (argv.p || argv.parserPlugins)
if (parserPlugins) {
  processor.processor.use(requireByPath(parserPlugins));
}

const compilerPlugins = (argv.c || argv.compilerPlugins)
if (compilerPlugins) {
  processor.compilerPlugins.push(...requireByPath(compilerPlugins));
}

var check = false
if (argv.v || argv.checkRestorations) {
  check = true;
}

function restore_with_check() {
  return function(...args) {
    return processor.sourceAndRedactedToRestored(...args, check);
  }
}

function restore(data) {
  return recursivelyProcessAll(restore_with_check().bind(processor), data);
}

Promise.all([
  ioUtils.readFromFileOrStdin(argv.s).then(ioUtils.parseAsSerialized),
  ioUtils.readFromFileOrStdin(argv.r).then(ioUtils.parseAsSerialized),
]).then(restore)
  .then(ioUtils.formatAsSerialized)
  .then(ioUtils.writeToFileOrStdout.bind(ioUtils, argv.o));
