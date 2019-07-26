#!/usr/bin/env node

const parseArgs = require("minimist");

const ioUtils = require("../utils/io");
const recursivelyProcessAll = require("../utils/misc").recursivelyProcessAll;
const requireByPath = require("../utils/misc").requireByPath;

const MarkdownProcessor = require("../redactableMarkdownProcessor");
const TextProcessor = require("../redactableProcessor");

const argv = parseArgs(process.argv.slice(2));

const helpFlag = argv.h || argv.help;
if (helpFlag) {
  process.stdout.write("usage: redact [INFILE] [options]\n");
  process.stdout.write("\n");
  process.stdout.write(
    "Reads content from INFILE if specified, STDIN otherwise.\n"
  );
  process.stdout.write("Content can be plain text or JSON.\n");
  process.stdout.write(
    "Content will be redacted. If the content is JSON, all string values (including those several levels deep) will be redacted.\n"
  );
  process.stdout.write("\n");
  process.stdout.write("options:\n");
  process.stdout.write("\t-h, --help: print this help message\n");
  process.stdout.write("\t-o OUTFILE: output to OUTFILE rather than stdout\n");
  process.stdout.write(
    "\t-f, --format [md|txt]: specify format of content (default to markdown)\n"
  );
  process.stdout.write(
    "\t-p, --parserPlugins PLUGINS: comma-separated list of parser plugins to include in addition to the defaults\n"
  );
  process.stdout.write(
    "\t-c, --compilerPlugins PLUGINS: comma-separated list of compiler plugins to include in addition to the defaults\n"
  );
  process.exit();
}

const format = argv.f || argv.format;
let processor;
if (format && format === "txt") {
  processor = TextProcessor.create();
} else {
  processor = MarkdownProcessor.create();
}

const parserPlugins = argv.p || argv.parserPlugins;
if (parserPlugins) {
  processor.processor.use(requireByPath(parserPlugins));
}

const compilerPlugins = argv.c || argv.compilerPlugins;
if (compilerPlugins) {
  processor.compilerPlugins.push(...requireByPath(compilerPlugins));
}

function redact(data) {
  return recursivelyProcessAll(
    processor.sourceToRedacted.bind(processor),
    data
  );
}

ioUtils
  .readFromFileOrStdin(argv._[0])
  .then(ioUtils.parseAsSerialized)
  .then(redact)
  .then(ioUtils.formatAsSerialized)
  .then(ioUtils.writeToFileOrStdout.bind(ioUtils, argv.o));
