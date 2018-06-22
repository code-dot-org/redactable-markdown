const expect = require('expect');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..', '..');
const dataDir = path.resolve(rootDir, 'test', 'integration', 'data');

describe("Command-Line Scripts", () => {
  fs.readdirSync(dataDir).forEach(example => {
    const sources = fs.readdirSync(path.resolve(dataDir, example)).filter(file => /^source.*$/.test(file));
    sources.forEach(source => {
      describe(example, () => {
        const extension = path.extname(source)
        const sourcePath = path.resolve(dataDir, example, source);
        const redactedPath = path.resolve(dataDir, example, 'redacted' + extension)
        const translatedPath = path.resolve(dataDir, example, 'translated' + extension)
        const restoredPath = path.resolve(dataDir, example, 'restored' + extension)

        if (!fs.existsSync(redactedPath)) {
          return;
        }

        describe("redact", () => {
          const expected = fs.readFileSync(redactedPath, 'utf8')

          it("redacts when given input as stdin", () => {
            const input = fs.readFileSync(sourcePath, 'utf8')
            const redact = spawnSync('babel-node', [path.resolve(rootDir, 'src/bin/redact.js')], {
              input
            });
            expect(redact.stdout.toString()).toEqual(expected);
          });

          it("redacts when given input as filepath", () => {
            const redact = spawnSync('babel-node', [path.resolve(rootDir, 'src/bin/redact.js'), sourcePath]);
            expect(redact.stdout.toString()).toEqual(expected);
          });
        });

        describe("restore", () => {
          it("restores", () => {
            // We sometimes want to be able to test special translation special cases,
            // so we support using special "translated" and "restored" data when they
            // are defined, but we generally just default to validating that the
            // restoration gets us back to the original
            const expected = fs.existsSync(restoredPath) ? restoredPath : sourcePath;
            const target = fs.existsSync(translatedPath) ? translatedPath : redactedPath;
            const restore = spawnSync('babel-node', [path.resolve(rootDir, 'src/bin/restore.js'), '-s', sourcePath, '-r', target]);
            expect(restore.stdout.toString()).toEqual(fs.readFileSync(expected, 'utf8'));
          });
        });
      });
    });
  });
});
