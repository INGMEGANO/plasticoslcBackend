-- CreateTable
CREATE TABLE "resolutions" (
    "id" SERIAL NOT NULL,
    "prefix" VARCHAR(10) NOT NULL,
    "currentNumber" INTEGER NOT NULL DEFAULT 0,
    "fromNumber" INTEGER NOT NULL,
    "toNumber" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resolutions_prefix_key" ON "resolutions"("prefix");
