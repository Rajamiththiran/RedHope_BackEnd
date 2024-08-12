// File: C:\Users\Mithiran\Documents\RedHope_BackEnd\redHope\test\run-all-tests.js

const { readdirSync, statSync } = require("fs");
const { join } = require("path");
const { run } = require("node:test");

function getTestFiles(dir) {
  let files = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getTestFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".test.js")) {
      files.push(fullPath);
    }
  }

  return files;
}

const testDir = join(__dirname, "routes", "api", "main", "v1");
const testFiles = getTestFiles(testDir);

console.log("Test files found:", testFiles);

run({
  files: testFiles,
  concurrency: true,
}).catch((error) => {
  console.error("Error running tests:", error);
  process.exit(1);
});
