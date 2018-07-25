#!/usr/bin/env node

const parseArgs = require('minimist');

const ioUtils = require('../utils/io');
const parser = require('../redactableMarkdownParser').create();
const recursivelyProcessAll = require('../utils/misc').recursivelyProcessAll;

const argv = parseArgs(process.argv.slice(2));

const helpFlag = (argv.h || argv.help);
if (helpFlag) {
  process.stdout.write("usage: render [INFILE] [options]\n");
  process.stdout.write("\n");
  process.stdout.write("Reads content from INFILE if specified, STDIN otherwise.\n");
  process.stdout.write("Content can be plain text or JSON.\n");
  process.stdout.write("Content will be rendered as HTML. If the content is JSON, all string values (including those several levels deep) will be rendered.\n");
  process.stdout.write("\n");
  process.stdout.write("options:\n");
  process.stdout.write("\t-h, --help: print this help message\n");
  process.stdout.write("\t-o OUTFILE: output to OUTFILE rather than stdout\n");
  process.stdout.write("\t-p, --parserPlugins PLUGINS: comma-separated list of parser plugins to include in addition to the defaults\n");
  process.stdout.write("\t-c, --compilerPlugins PLUGINS: comma-separated list of compiler plugins to include in addition to the defaults\n");
  process.exit()
}

const parserPlugins = (argv.p || argv.parserPlugins)
if (parserPlugins) {
  parser.loadParserPlugins(parserPlugins);
}

const compilerPlugins = (argv.c || argv.compilerPlugins)
if (compilerPlugins) {
  parser.loadCompilerPlugins(compilerPlugins);
}

function render(data) {
  return recursivelyProcessAll(parser.sourceToHtml.bind(parser), data);
}

ioUtils.readFromFileOrStdin(argv._[0])
  .then(ioUtils.parseAsSerialized)
  .then(render)
  .then(ioUtils.formatAsSerialized)
  .then(ioUtils.writeToFileOrStdout.bind(ioUtils, argv.o));
