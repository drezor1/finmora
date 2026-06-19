-- AlterTable
ALTER TABLE "SipPlan" ADD COLUMN "lastContributionAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SipContribution" (
    "id" TEXT NOT NULL,
    "sipPlanId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "grossIncome" INTEGER NOT NULL,
    "contributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SipContribution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SipContribution" ADD CONSTRAINT "SipContribution_sipPlanId_fkey" FOREIGN KEY ("sipPlanId") REFERENCES "SipPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
