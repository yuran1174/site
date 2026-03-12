import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const projectRoot = process.cwd();

async function loadConfig(configPath) {
  const contents = await readFile(configPath, 'utf8');
  return JSON.parse(contents);
}

async function collectFiles(patterns) {
  const files = new Set();

  for (const pattern of patterns) {
    const normalized = pattern.replace(/\\/g, '/');
    if (!normalized.endsWith('*.js')) {
      throw new Error(`Unsupported pattern: ${pattern}`);
    }

    const directory = normalized.slice(0, -4).replace(/\/$/, '');
    const absoluteDirectory = path.resolve(projectRoot, directory);
    const entries = await readdir(absoluteDirectory, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.js')) {
        continue;
      }

      files.add(path.join(absoluteDirectory, entry.name));
    }
  }

  return Array.from(files).sort();
}

function runNodeCheck(source, filePath) {
  try {
    new vm.Script(source, { filename: filePath });
    return {
      ok: true,
      error: '',
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

function buildRules(ruleDefinitions) {
  return ruleDefinitions.map((rule) => ({
    name: rule.name,
    regex: new RegExp(rule.pattern, rule.flags ?? 'g'),
  }));
}

function findViolations(source, rules) {
  const violations = [];

  for (const rule of rules) {
    const match = rule.regex.exec(source);
    if (!match) {
      continue;
    }

    const offset = match.index;
    const prefix = source.slice(0, offset);
    const line = prefix.split('\n').length;
    violations.push({
      name: rule.name,
      line,
      snippet: match[0],
    });
  }

  return violations;
}

async function lintFile(filePath, rules) {
  const source = await readFile(filePath, 'utf8');
  const syntax = runNodeCheck(source, filePath);
  const violations = findViolations(source, rules);

  return {
    filePath,
    syntax,
    violations,
  };
}

function formatRelative(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, '/');
}

async function main() {
  const config = await loadConfig(path.resolve(projectRoot, '.js-lint.json'));
  const rules = buildRules(config.forbiddenPatterns ?? []);
  const files = await collectFiles(config.include ?? []);

  if (files.length === 0) {
    console.log('JS lint: no files matched.');
    return;
  }

  const results = [];
  for (const filePath of files) {
    results.push(await lintFile(filePath, rules));
  }

  let hasErrors = false;
  for (const result of results) {
    const relativePath = formatRelative(result.filePath);

    if (!result.syntax.ok) {
      hasErrors = true;
      console.error(`[js-lint] ${relativePath}: syntax error`);
      if (result.syntax.error) {
        console.error(result.syntax.error);
      }
    }

    for (const violation of result.violations) {
      hasErrors = true;
      console.error(
        `[js-lint] ${relativePath}:${violation.line}: forbidden ${violation.name} (${violation.snippet})`
      );
    }
  }

  if (hasErrors) {
    process.exitCode = 1;
    return;
  }

  console.log(`JS lint passed for ${files.length} file(s).`);
}

main().catch((error) => {
  console.error('[js-lint] Failed to run:', error.message);
  process.exitCode = 1;
});
