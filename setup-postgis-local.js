// Setup PostGIS for local development
const { Client } = require("pg");

async function setupPostGIS() {
  try {
    console.log("Connecting to database...");

    // Create a new client using the DATABASE_URL environment variable
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      // No SSL for local development
    });

    await client.connect();
    console.log("Connected to database successfully");

    // Create the PostGIS extension if it doesn't exist
    console.log("Creating PostGIS extension...");
    await client.query("CREATE EXTENSION IF NOT EXISTS postgis");
    console.log("PostGIS extension created successfully");

    await client.end();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error setting up PostGIS extension:", error);
    process.exit(1);
  }
}

setupPostGIS();
