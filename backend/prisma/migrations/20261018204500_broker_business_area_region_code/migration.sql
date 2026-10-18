-- AlterTable
ALTER TABLE "BrokerBusinessArea" ADD COLUMN IF NOT EXISTS "regionCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BrokerBusinessArea_brokerId_regionCode_key" ON "BrokerBusinessArea"("brokerId", "regionCode");
