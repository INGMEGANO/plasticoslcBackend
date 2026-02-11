-- CreateTable
CREATE TABLE "invoices" (
    "status" CHAR(1) DEFAULT '0',
    "moduleId" TEXT,
    "createdAt" TIMESTAMP(0),
    "updatedAt" TIMESTAMP(0),
    "autoretencion" DECIMAL(10,5) DEFAULT 0.00000,
    "ciiu" INTEGER,
    "cufe" VARCHAR(100) DEFAULT '',
    "note" TEXT,
    "orderAmountPaid" DECIMAL(10,2) NOT NULL,
    "orderDate" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" INTEGER NOT NULL,
    "orderPrefix" VARCHAR(50) NOT NULL,
    "orderReceiverAddress" TEXT NOT NULL,
    "orderReceiverName" VARCHAR(250) NOT NULL,
    "orderReceiverNit" VARCHAR(50) NOT NULL,
    "orderReceiverPhone" VARCHAR(50) NOT NULL DEFAULT '',
    "orderResolution" VARCHAR(50),
    "orderSubtotalBeforeTax" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "orderTaxPer" VARCHAR(250) NOT NULL DEFAULT '19',
    "orderTotalAfterTax" DOUBLE PRECISION NOT NULL,
    "orderTotalAmountDue" DECIMAL(10,2),
    "orderTotalBeforeTax" DECIMAL(10,2) NOT NULL,
    "orderTotalDesc" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "orderTotalTax" DECIMAL(10,2) NOT NULL,
    "paymentForms" INTEGER DEFAULT 0,
    "paymentMethods" INTEGER DEFAULT 0,
    "plazoPago" VARCHAR(50) DEFAULT '0',
    "reteica" DECIMAL(10,5) DEFAULT 0.00000,
    "reteiva" DECIMAL(10,5) DEFAULT 0.00000,
    "retencion" VARCHAR(50) DEFAULT 'RTE00',
    "userId" TEXT NOT NULL,
    "vencimiento" VARCHAR(50) DEFAULT '0',
    "id" SERIAL NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices_details" (
    "order_item_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "orderPrefix" VARCHAR(50) NOT NULL DEFAULT '',
    "orderResolution" VARCHAR(50),
    "productId" TEXT,
    "itemCode" VARCHAR(500),
    "reference" VARCHAR(500),
    "itemName" TEXT,
    "descripcion" TEXT,
    "orderItemQuantity" DECIMAL(10,2),
    "orderItemPrice" DECIMAL(10,2),
    "orderItemIva" DECIMAL(10,2),
    "orderItemDesc" DECIMAL(10,2),
    "orderItemFinalAmount" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "invoices_details_pkey" PRIMARY KEY ("order_item_id")
);

-- AddForeignKey
ALTER TABLE "invoices_details" ADD CONSTRAINT "invoices_details_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices_details" ADD CONSTRAINT "invoices_details_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
