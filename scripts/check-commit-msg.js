#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const msgFile = process.argv[2] || path.join('.git', 'COMMIT_EDITMSG');
let msg = '';
try {
  msg = fs.readFileSync(msgFile, 'utf8');
} catch (e) {
  console.error(`Could not read commit message file: ${msgFile}`);
  process.exit(1);
}

const first = msg.split(/\r?\n/)[0] || '';
// Accept: "feat:", "fix:", "feat(scope):", "fix(scope):" (case-insensitive), optionally leading whitespace
const ok = /^\s*(feat|fix)(\(|:)/i.test(first);
if (!ok) {
  console.error('Invalid commit message format.');
  console.error('Commit message must start with `feat:` or `fix:` (e.g. "feat: add login" or "fix(auth): handle expired token").');
  process.exit(1);
}
process.exit(0);
