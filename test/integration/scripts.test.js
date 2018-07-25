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
        const normalizedPath = path.resolve(dataDir, example, 'normalized' + extension)
        const pluginPath = path.resolve(dataDir, example, 'plugin.js')

        if (!fs.existsSync(redactedPath)) {
          return;
        }

        describe("redact", () => {
          const expected = fs.readFileSync(redactedPath, 'utf8')

          it("redacts when given input as stdin", () => {
            const input = fs.readFileSync(sourcePath, 'utf8')
            const args = [path.resolve(rootDir, 'src/bin/redact.js')];
            if (fs.existsSync(pluginPath)) {
              args.push('-p', pluginPath);
            }
            const redact = spawnSync('node', args, {
              input
            });
            expect(redact.stdout.toString()).toEqual(expected);
          });

          it("redacts when given input as filepath", () => {
            const args = [path.resolve(rootDir, 'src/bin/redact.js'), sourcePath];
            if (fs.existsSync(pluginPath)) {
              args.push('-p', pluginPath);
            }
            const redact = spawnSync('node', args);
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
            const args = [path.resolve(rootDir, 'src/bin/restore.js'), '-s', sourcePath, '-r', target];
            if (fs.existsSync(pluginPath)) {
              args.push('-p', pluginPath);
            }
            const restore = spawnSync('node', args);
            expect(restore.stdout.toString()).toEqual(fs.readFileSync(expected, 'utf8'));
          });
        });

        describe("normalize", () => {
          const source = fs.readFileSync(sourcePath, 'utf8')
          let testname, expected;
          if (fs.existsSync(normalizedPath)) {
            testname = "normalization will format source";
            expected = fs.readFileSync(normalizedPath, 'utf8');
          } else {
            testname = "normalization doesn't change source";
            expected = source;
          }

          it(testname, () => {
            const args = [path.resolve(rootDir, 'src/bin/normalize.js')];
            if (fs.existsSync(pluginPath)) {
              args.push('-p', pluginPath);
            }
            const normalize = spawnSync('node', args, {
              input: source
            });
            expect(normalize.stdout.toString()).toEqual(expected);
          });
        });
      });
    });
  });
});
