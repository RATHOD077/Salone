import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

console.log('[build] Installing frontend dependencies...');
execSync('npm --prefix frontend install', { stdio: 'inherit' });

console.log('[build] Building frontend with vite...');
execSync('npm --prefix frontend run build', { stdio: 'inherit' });

const srcDist = path.resolve('frontend/dist');
const targetDist = path.resolve('dist');

if (fs.existsSync(srcDist)) {
  fs.cpSync(srcDist, targetDist, { recursive: true });
  fs.writeFileSync(path.join(targetDist, '_redirects'), '/*    /index.html   200\n', 'utf8');
  console.log('[build] Successfully synced build output to ./dist with _redirects');
}
