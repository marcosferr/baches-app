// This script updates package.json and generates a new package-lock.json file
// Run with: node update-dependencies.js

const fs = require("fs");
const { execSync } = require("child_process");

// Ensure .npmrc file exists with correct settings
const npmrcContent = `legacy-peer-deps=true
package-lock=true
strict-peer-dependencies=false
`;
fs.writeFileSync("./.npmrc", npmrcContent);
console.log("Created/updated .npmrc file with correct settings");

// Read the current package.json
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

// Update specific dependencies to compatible versions
packageJson.dependencies["@auth/core"] = "0.38.0";
packageJson.dependencies["@auth/prisma-adapter"] = "2.7.2";
packageJson.dependencies["next-auth"] = "4.24.11";
packageJson.dependencies["pg"] = "^8.11.3";

// Write the updated package.json
fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));
console.log("Updated package.json with compatible versions");

// Run npm install to generate a new package-lock.json
console.log("Running npm install to generate a new package-lock.json...");
try {
  execSync("npm install", { stdio: "inherit" });
  console.log("Successfully generated new package-lock.json");
} catch (error) {
  console.error("Error during npm install:", error.message);
  console.log("Trying with --legacy-peer-deps flag...");
  try {
    execSync("npm install --legacy-peer-deps", { stdio: "inherit" });
    console.log(
      "Successfully generated new package-lock.json with --legacy-peer-deps"
    );
  } catch (innerError) {
    console.error("Failed to generate package-lock.json:", innerError.message);
    process.exit(1);
  }
}

console.log("\nNext steps:");
console.log("1. Commit both package.json and package-lock.json");
console.log("2. Push to Heroku: git push heroku main");
