# Heroku Deployment Guide

This guide explains how to deploy the Baches App to Heroku with a Heroku Postgres database.

## Prerequisites

1. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
2. Heroku account
3. Git repository initialized

## Step 1: Create a Heroku App

```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-app-name

# Or if you want to add to an existing app
heroku git:remote -a your-app-name
```

## Step 2: Add Heroku Postgres Add-on

```bash
# Add Postgres add-on
heroku addons:create heroku-postgresql:mini
```

## Step 3: Add Buildpacks

The application requires the Node.js buildpack and the Heroku Postgres buildpack with PostGIS support:

```bash
# Add Node.js buildpack
heroku buildpacks:add heroku/nodejs

# Add Heroku Postgres buildpack with PostGIS
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-apt
```

Create an `Aptfile` in your project root with the following content:

```
postgis
```

## Step 4: Install PostGIS Extension

You can install the PostGIS extension in two ways:

### Option 1: Using the provided script

Run the setup script that will automatically install the PostGIS extension:

```bash
heroku run node prisma/setup-postgis.js
```

### Option 2: Manual installation

Connect to your Heroku Postgres database and install the PostGIS extension manually:

```bash
heroku pg:psql
```

Once connected to the database, run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Type `\q` to exit the PostgreSQL console.

## Step 5: Configure Environment Variables

Set the required environment variables:

```bash
# Set NEXTAUTH_URL to your Heroku app URL
heroku config:set NEXTAUTH_URL=https://your-app-name.herokuapp.com

# Set a strong NEXTAUTH_SECRET
heroku config:set NEXTAUTH_SECRET=your-strong-secret-key-here

# Disable auth debugging in production
heroku config:set DEBUG_DISABLE_AUTH=FALSE
```

## Step 6: Update Dependencies and Generate package-lock.json

Before deploying, you need to ensure your package.json and package-lock.json are in sync. Run the provided script:

```bash
node update-dependencies.js
```

This script will:

1. Update package.json with compatible versions of dependencies
2. Run npm install to generate a new package-lock.json file

## Step 7: Deploy to Heroku

```bash
# Commit your changes including package-lock.json
git add .
git commit -m "Configure for Heroku deployment with updated dependencies"

# Push to Heroku
git push heroku main
```

## Step 8: Run Database Migrations

The migrations will run automatically during the release phase, but you can also run them manually:

```bash
heroku run npx prisma migrate deploy
```

## Step 9: Seed the Database (Optional)

If you want to seed the database with initial data:

```bash
heroku run npm run prisma:seed
```

## Troubleshooting

### Dependency Issues

If you encounter dependency conflicts during deployment, you may need to update the package versions in your package.json file. The current configuration uses:

```json
"@auth/core": "0.38.0",
"@auth/prisma-adapter": "2.7.2",
"next-auth": "4.24.11"
```

### Package Lock Issues

Heroku uses `npm ci` for installation, which requires package-lock.json to be in sync with package.json. If you see errors like:

```
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync.
```

Run the provided script to update dependencies and generate a new package-lock.json file:

```bash
node update-dependencies.js
```

Then commit both files before deploying.

### Database Connection Issues

If you encounter database connection issues, check the following:

1. Verify your DATABASE_URL is correctly set:

   ```bash
   heroku config:get DATABASE_URL
   ```

2. Make sure the PostGIS extension is installed:
   ```bash
   heroku pg:psql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

### Application Errors

Check the logs for any application errors:

```bash
heroku logs --tail
```

## Useful Heroku Commands

```bash
# View app info
heroku info

# Open the app in browser
heroku open

# View running dynos
heroku ps

# Restart the app
heroku restart

# Run a one-off dyno
heroku run bash

# View database info
heroku pg:info

# Connect to the database
heroku pg:psql
```

## Scaling the App

To scale your app:

```bash
# Scale web dynos
heroku ps:scale web=1

# Scale to zero (to stop the app without removing it)
heroku ps:scale web=0
```

## Monitoring

Heroku provides basic monitoring through the dashboard. For more advanced monitoring, consider adding the New Relic add-on:

```bash
heroku addons:create newrelic:wayne
```
