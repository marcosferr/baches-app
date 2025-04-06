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

## Step 4: Configure Environment Variables

Set the required environment variables:

```bash
# Set NEXTAUTH_URL to your Heroku app URL
heroku config:set NEXTAUTH_URL=https://your-app-name.herokuapp.com

# Set a strong NEXTAUTH_SECRET
heroku config:set NEXTAUTH_SECRET=your-strong-secret-key-here

# Disable auth debugging in production
heroku config:set DEBUG_DISABLE_AUTH=FALSE
```

## Step 5: Deploy to Heroku

```bash
# Commit your changes
git add .
git commit -m "Configure for Heroku deployment"

# Push to Heroku
git push heroku main
```

## Step 6: Run Database Migrations

The migrations will run automatically during the release phase, but you can also run them manually:

```bash
heroku run npx prisma migrate deploy
```

## Step 7: Seed the Database (Optional)

If you want to seed the database with initial data:

```bash
heroku run npm run prisma:seed
```

## Troubleshooting

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
