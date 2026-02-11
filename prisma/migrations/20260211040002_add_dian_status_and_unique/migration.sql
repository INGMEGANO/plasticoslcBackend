/*
  Warnings:

  - A unique constraint covering the columns `[orderPrefix,orderId]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "dianStatus" VARCHAR(20) DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "invoices_orderPrefix_orderId_key" ON "invoices"("orderPrefix", "orderId");
