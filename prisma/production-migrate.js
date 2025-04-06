// This script is used to run Prisma migrations in production
// It's designed to be run as part of the Heroku release phase

const { execSync } = require("child_process");
const { Client } = require("pg");

// Setup PostGIS extension
async function setupPostGIS() {
  try {
    console.log("Setting up PostGIS extension...");

    // Create a new client using the DATABASE_URL environment variable
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for Heroku Postgres
      },
    });

    await client.connect();
    console.log("Connected to database successfully");

    // Create the PostGIS extension if it doesn't exist
    await client.query("CREATE EXTENSION IF NOT EXISTS postgis");
    console.log("PostGIS extension created successfully");

    await client.end();
    console.log("Database connection closed");

    return true;
  } catch (error) {
    console.error("Error setting up PostGIS extension:", error);
    return false;
  }
}

// Main function to run migrations
async function main() {
  try {
    // First setup PostGIS
    const postgisSetup = await setupPostGIS();
    if (!postgisSetup) {
      console.warn("PostGIS setup failed, but continuing with migrations...");
    }

    // Run Prisma migrations
    console.log("Running Prisma migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("Prisma migrations completed successfully");
  } catch (error) {
    console.error("Error running Prisma migrations:", error);
    process.exit(1);
  }
}

main();
