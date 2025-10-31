const { spawnSync } = require('child_process');
const path = require('path');

// Files to run in order
const seeds = [
  'seedSpecials.js',
  'seedAdmins.js',
  'seedDoctors.js'
];

const backendRoot = __dirname;

console.log('Running seed scripts from', backendRoot);
console.log('Using MONGODB_URI =', process.env.MONGODB_URI || '<not set - will use defaults in scripts>');

for (const file of seeds) {
  const full = path.join(backendRoot, file);
  console.log('\n===== Running', file, '=====');

  const result = spawnSync(process.execPath, [full], {
    stdio: 'inherit',
    env: process.env,
    cwd: backendRoot,
    shell: false
  });

  if (result.error) {
    console.error('Error executing', file, result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`${file} exited with code ${result.status}`);
    process.exit(result.status || 1);
  }
}

console.log('\nAll seed scripts completed successfully.');
