import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const workspace = process.cwd();
const buildRoot = path.join(workspace, 'dist', 'misvales');
const artifactRoot = fs.existsSync(path.join(buildRoot, 'browser'))
  ? path.join(buildRoot, 'browser')
  : buildRoot;
const manifestName = 'artifact-manifest.sha256';

if (!fs.existsSync(artifactRoot)) {
  process.stderr.write('ARTIFACT_HASH=FAIL\nNo existe dist/misvales.\n');
  process.exit(1);
}

const entries = filesUnder(artifactRoot)
  .filter((file) => path.basename(file) !== manifestName)
  .map((file) => {
    const relative = path.relative(artifactRoot, file).replaceAll('\\', '/');
    return `${sha256(fs.readFileSync(file))}  ${relative}`;
  })
  .sort();
const digest = sha256(Buffer.from(`${entries.join('\n')}\n`, 'utf8'));
const manifest = [`ARTIFACT_SHA256  ${digest}`, ...entries, ''].join('\n');

fs.writeFileSync(path.join(artifactRoot, manifestName), manifest, 'utf8');
process.stdout.write(`ARTIFACT_SHA256=${digest}\nARTIFACT_FILES=${entries.length}\n`);

function filesUnder(root) {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(absolute));
    else files.push(absolute);
  }
  return files;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
