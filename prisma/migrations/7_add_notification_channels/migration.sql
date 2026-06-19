-- AlterEnum
ALTER TYPE "NotificationChannel" ADD VALUE 'IN_APP';
ALTER TYPE "NotificationChannel" ADD VALUE 'BOTH';

-- AlterTable
ALTER TABLE "AdminNotification" ADD COLUMN "recipientCount" INTEGER NOT NULL DEFAULT 0;
