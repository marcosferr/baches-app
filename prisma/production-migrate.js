// This script is used to run Prisma migrations in production
// It's designed to be run as part of the Heroku release phase

const { execSync } = require('child_process');

// Run Prisma migrations
try {
  console.log('Running Prisma migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('Prisma migrations completed successfully');
} catch (error) {
  console.error('Error running Prisma migrations:', error);
  process.exit(1);
}
