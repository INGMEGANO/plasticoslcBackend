-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PRODUCT', 'SERVICE', 'RAW_MATERIAL', 'FINISHED_PRODUCT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InventoryType" ADD VALUE 'PURCHASE';
ALTER TYPE "InventoryType" ADD VALUE 'SALE';
ALTER TYPE "InventoryType" ADD VALUE 'TRANSFORM_IN';
ALTER TYPE "InventoryType" ADD VALUE 'TRANSFORM_OUT';
ALTER TYPE "InventoryType" ADD VALUE 'ADJUSTMENT';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'PRODUCT';
