-- AlterTable
ALTER TABLE "User" ADD COLUMN "isDemoAccount" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "User_isDemoAccount_idx" ON "User"("isDemoAccount");

