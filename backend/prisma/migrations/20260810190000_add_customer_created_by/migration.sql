-- Add createdBy column to customers if not exists with a placeholder default
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "createdBy" TEXT NOT NULL DEFAULT 'placeholder';

-- Update the placeholder with actual admin user ID
UPDATE "customers"
SET "createdBy" = (SELECT "id" FROM "users" WHERE "role" = 'ADMIN' LIMIT 1)
WHERE "createdBy" = 'placeholder';

-- Add foreign key constraint
ALTER TABLE "customers" ADD CONSTRAINT "customers_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
