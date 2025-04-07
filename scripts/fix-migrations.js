// This script will help fix migration issues by directly interacting with the Prisma migration table
const { PrismaClient } = require("@prisma/client");

async function fixMigrations() {
  const prisma = new PrismaClient();

  try {
    console.log("Connecting to database...");

    // Check if _prisma_migrations table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '_prisma_migrations'
      );
    `;

    if (!tableExists[0].exists) {
      console.log("Creating _prisma_migrations table...");
      await prisma.$executeRaw`
        CREATE TABLE "_prisma_migrations" (
          "id" VARCHAR(36) NOT NULL,
          "checksum" VARCHAR(64) NOT NULL,
          "finished_at" TIMESTAMP WITH TIME ZONE,
          "migration_name" VARCHAR(255) NOT NULL,
          "logs" TEXT,
          "rolled_back_at" TIMESTAMP WITH TIME ZONE,
          "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY ("id")
        );
      `;
    }

    // Check if the first migration is already marked as applied
    const firstMigrationExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM _prisma_migrations
        WHERE migration_name = '20250406024152_add_submitted_status'
      );
    `;

    if (!firstMigrationExists[0].exists) {
      console.log("Marking first migration as applied...");
      await prisma.$executeRaw`
        INSERT INTO _prisma_migrations (
          id,
          checksum,
          finished_at,
          migration_name,
          logs,
          started_at,
          applied_steps_count
        ) VALUES (
          '00000000-0000-0000-0000-000000000001',
          'a7a0f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5',
          now(),
          '20250406024152_add_submitted_status',
          'Migration was applied manually',
          now(),
          1
        );
      `;
    } else {
      // If the migration exists but is marked as failed, update it
      const failedMigration = await prisma.$queryRaw`
        SELECT * FROM _prisma_migrations
        WHERE migration_name = '20250406024152_add_submitted_status'
        AND (finished_at IS NULL OR rolled_back_at IS NOT NULL);
      `;

      if (failedMigration.length > 0) {
        console.log("Fixing failed migration...");
        await prisma.$executeRaw`
          UPDATE _prisma_migrations
          SET
            finished_at = now(),
            rolled_back_at = NULL,
            applied_steps_count = 1,
            logs = 'Migration was fixed manually'
          WHERE migration_name = '20250406024152_add_submitted_status';
        `;
      }
    }

    // Check if the second migration is already marked as applied
    const secondMigrationExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM _prisma_migrations
        WHERE migration_name = '20250406033347_add_postgis_support'
      );
    `;

    if (!secondMigrationExists[0].exists) {
      console.log("Marking second migration as applied...");
      await prisma.$executeRaw`
        INSERT INTO _prisma_migrations (
          id,
          checksum,
          finished_at,
          migration_name,
          logs,
          started_at,
          applied_steps_count
        ) VALUES (
          '00000000-0000-0000-0000-000000000002',
          'b8b0f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5',
          now(),
          '20250406033347_add_postgis_support',
          'Migration was applied manually',
          now(),
          1
        );
      `;
    } else {
      // If the migration exists but is marked as failed, update it
      const failedMigration2 = await prisma.$queryRaw`
        SELECT * FROM _prisma_migrations
        WHERE migration_name = '20250406033347_add_postgis_support'
        AND (finished_at IS NULL OR rolled_back_at IS NOT NULL);
      `;

      if (failedMigration2.length > 0) {
        console.log("Fixing failed second migration...");
        await prisma.$executeRaw`
          UPDATE _prisma_migrations
          SET
            finished_at = now(),
            rolled_back_at = NULL,
            applied_steps_count = 1,
            logs = 'Migration was fixed manually'
          WHERE migration_name = '20250406033347_add_postgis_support';
        `;
      }
    }

    // Check if the required tables exist
    const reportTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Report'
      );
    `;

    // Check if PostGIS extension is installed
    const postgisExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'postgis'
      );
    `;

    if (!postgisExists[0].exists) {
      console.log("Installing PostGIS extension...");
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis;`;
    }

    // Check if location column exists in Report table
    const locationColumnExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Report'
        AND column_name = 'location'
      );
    `;

    if (!locationColumnExists[0].exists && reportTableExists[0].exists) {
      console.log("Adding location column to Report table...");
      // First add the column without a default value
      await prisma.$executeRaw`ALTER TABLE "Report" ADD COLUMN "location" geometry(Point, 4326);`;

      // Then update the column with the calculated values
      await prisma.$executeRaw`UPDATE "Report" SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326);`;

      // Create the index
      await prisma.$executeRaw`CREATE INDEX "location_idx" ON "Report" USING GIST ("location");`;
    }

    if (!reportTableExists[0].exists) {
      console.log("Creating required tables from first migration...");

      // Check if Role enum exists
      const roleEnumExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'Role'
        );
      `;

      if (!roleEnumExists[0].exists) {
        console.log("Creating Role enum...");
        await prisma.$executeRaw`CREATE TYPE "Role" AS ENUM ('ADMIN', 'CITIZEN');`;
      }

      // Check if Severity enum exists
      const severityEnumExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'Severity'
        );
      `;

      if (!severityEnumExists[0].exists) {
        console.log("Creating Severity enum...");
        await prisma.$executeRaw`CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');`;
      }

      // Check if Status enum exists
      const statusEnumExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'Status'
        );
      `;

      if (!statusEnumExists[0].exists) {
        console.log("Creating Status enum...");
        await prisma.$executeRaw`CREATE TYPE "Status" AS ENUM ('SUBMITTED', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');`;
      }

      // Check if NotificationType enum exists
      const notificationTypeEnumExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'NotificationType'
        );
      `;

      if (!notificationTypeEnumExists[0].exists) {
        console.log("Creating NotificationType enum...");
        await prisma.$executeRaw`CREATE TYPE "NotificationType" AS ENUM ('REPORT_STATUS', 'COMMENT', 'APPROVAL', 'PRIORITY');`;
      }

      // Create User table
      console.log("Creating User table...");
      await prisma.$executeRaw`
        CREATE TABLE "User" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "role" "Role" NOT NULL DEFAULT 'CITIZEN',
          "avatar" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        );
      `;

      // Create Report table
      console.log("Creating Report table...");
      await prisma.$executeRaw`
        CREATE TABLE "Report" (
          "id" TEXT NOT NULL,
          "picture" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "severity" "Severity" NOT NULL,
          "status" "Status" NOT NULL DEFAULT 'SUBMITTED',
          "latitude" DOUBLE PRECISION NOT NULL,
          "longitude" DOUBLE PRECISION NOT NULL,
          "address" TEXT,
          "authorId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
        );
      `;

      // Create Comment table
      console.log("Creating Comment table...");
      await prisma.$executeRaw`
        CREATE TABLE "Comment" (
          "id" TEXT NOT NULL,
          "text" TEXT NOT NULL,
          "reportId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
        );
      `;

      // Create Notification table
      console.log("Creating Notification table...");
      await prisma.$executeRaw`
        CREATE TABLE "Notification" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "type" "NotificationType" NOT NULL,
          "read" BOOLEAN NOT NULL DEFAULT false,
          "relatedId" TEXT,
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
        );
      `;

      // Create NotificationPreference table
      console.log("Creating NotificationPreference table...");
      await prisma.$executeRaw`
        CREATE TABLE "NotificationPreference" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "reportUpdates" BOOLEAN NOT NULL DEFAULT true,
          "comments" BOOLEAN NOT NULL DEFAULT true,
          "email" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
        );
      `;

      // Create indexes
      console.log("Creating indexes...");
      await prisma.$executeRaw`CREATE UNIQUE INDEX "User_email_key" ON "User"("email");`;
      await prisma.$executeRaw`CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");`;

      // Add foreign keys
      console.log("Adding foreign keys...");
      await prisma.$executeRaw`ALTER TABLE "Report" ADD CONSTRAINT "Report_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`;
      await prisma.$executeRaw`ALTER TABLE "Comment" ADD CONSTRAINT "Comment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`;
      await prisma.$executeRaw`ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`;
      await prisma.$executeRaw`ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`;
      await prisma.$executeRaw`ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`;
    }

    console.log(
      'Migration table and database schema fixed. You can now run "npx prisma migrate deploy" again.'
    );
  } catch (error) {
    console.error("Error fixing migrations:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigrations();
