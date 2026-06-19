-- CreateEnum
CREATE TYPE "AdInquiryStatus" AS ENUM ('PENDING', 'CONTACTED', 'CONVERTED');

-- CreateTable
CREATE TABLE "AdInquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "package" TEXT,
    "status" "AdInquiryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdInquiry_pkey" PRIMARY KEY ("id")
);
