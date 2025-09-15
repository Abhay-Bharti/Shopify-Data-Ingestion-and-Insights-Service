-- CreateTable
CREATE TABLE "custom_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "customer_email" TEXT,
    "cart_token" TEXT,
    "checkout_token" TEXT,
    "total_value" DECIMAL(65,30),
    "items_count" INTEGER,
    "event_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_events_tenant_id_event_type_idx" ON "custom_events"("tenant_id", "event_type");

-- CreateIndex
CREATE INDEX "custom_events_customer_email_idx" ON "custom_events"("customer_email");

-- AddForeignKey
ALTER TABLE "custom_events" ADD CONSTRAINT "custom_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
