-- Check if Role enum exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'CITIZEN');
    END IF;
END $$;

-- Check if Severity enum exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Severity') THEN
        CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
    END IF;
END $$;

-- Check if Status enum exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Status') THEN
        CREATE TYPE "Status" AS ENUM ('SUBMITTED', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');
    END IF;
END $$;

-- Check if NotificationType enum exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
        CREATE TYPE "NotificationType" AS ENUM ('REPORT_STATUS', 'COMMENT', 'APPROVAL', 'PRIORITY');
    END IF;
END $$;

-- Check if User table exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User') THEN
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
    END IF;
END $$;

-- Check if Report table exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Report') THEN
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
    END IF;
END $$;

-- Check if Comment table exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Comment') THEN
        CREATE TABLE "Comment" (
            "id" TEXT NOT NULL,
            "text" TEXT NOT NULL,
            "reportId" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- Check if Notification table exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Notification') THEN
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
    END IF;
END $$;

-- Check if NotificationPreference table exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'NotificationPreference') THEN
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
    END IF;
END $$;

-- Check if User_email_key index exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_email_key') THEN
        CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
    END IF;
END $$;

-- Check if NotificationPreference_userId_key index exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'NotificationPreference_userId_key') THEN
        CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");
    END IF;
END $$;

-- Check if foreign keys exist before adding them
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Report_authorId_fkey') THEN
        ALTER TABLE "Report" ADD CONSTRAINT "Report_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Comment_reportId_fkey') THEN
        ALTER TABLE "Comment" ADD CONSTRAINT "Comment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Comment_userId_fkey') THEN
        ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Notification_userId_fkey') THEN
        ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'NotificationPreference_userId_fkey') THEN
        ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
