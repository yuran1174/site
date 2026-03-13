import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve('.');
const tscEntry = resolve(root, 'laravel', 'node_modules', 'typescript', 'bin', 'tsc');
const tsConfig = resolve(root, 'tsconfig.season1.json');
const jsSource = resolve(root, 'js', 'season1');
const jsTarget = resolve(root, 'public', 'js', 'season1');
const cssSource = resolve(root, 'css', 'season1.css');
const cssTarget = resolve(root, 'public', 'css', 'season1.css');

if (!existsSync(tscEntry)) {
    console.error('TypeScript compiler not found. Run "cd laravel && npm install" first.');
    process.exit(1);
}

const compile = spawnSync(process.execPath, [tscEntry, '-p', tsConfig], {
    cwd: root,
    stdio: 'inherit',
});

if (compile.status !== 0) {
    process.exit(compile.status ?? 1);
}

mkdirSync(jsTarget, { recursive: true });
copyDirectory(jsSource, jsTarget);
copyFileSync(cssSource, cssTarget);

console.log('Season 1 runtime built and mirrored to public/.');

function copyDirectory(sourceDir, targetDir) {
    mkdirSync(targetDir, { recursive: true });

    for (const entry of readdirSync(sourceDir)) {
        const sourcePath = join(sourceDir, entry);
        const targetPath = join(targetDir, entry);
        const stats = statSync(sourcePath);

        if (stats.isDirectory()) {
            copyDirectory(sourcePath, targetPath);
            continue;
        }

        copyFileSync(sourcePath, targetPath);
    }
}
