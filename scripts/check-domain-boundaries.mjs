import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const domainRoot = path.resolve("src/domain");
const forbiddenImportPatterns = [
  /from\s+["'](?:react|react-native|expo(?:\/[^"']*)?|@supabase\/[^"']+)["']/,
  /from\s+["'](?:\.\.\/)+(?:data|ui)(?:\/[^"']*)?["']/,
  /from\s+["']@\/(?:data|ui)(?:\/[^"']*)?["']/
];

const sourceFiles = await collectTypeScriptFiles(domainRoot);
const violations = [];

for (const filePath of sourceFiles) {
  const source = await readFile(filePath, "utf8");
  const lines = source.split("\n");

  lines.forEach((line, index) => {
    if (forbiddenImportPatterns.some((pattern) => pattern.test(line))) {
      violations.push(`${path.relative(process.cwd(), filePath)}:${index + 1}: ${line.trim()}`);
    }
  });
}

if (violations.length > 0) {
  console.error("Domain boundary violations found:");
  console.error(violations.join("\n"));
  process.exit(1);
}

async function collectTypeScriptFiles(directory) {
  let files = [];
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(await collectTypeScriptFiles(entryPath));
    }

    if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(entryPath);
    }
  }

  return files;
}
