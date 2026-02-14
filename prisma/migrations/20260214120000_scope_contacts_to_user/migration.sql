-- Step 1: Add userId column as nullable first
ALTER TABLE "contact" ADD COLUMN "userId" TEXT;

-- Step 2: Backfill userId from the list relationship
-- Each contact is linked to lists via contact_list, and lists have a userId
-- Assign the userId from the first list the contact belongs to
UPDATE "contact" c
SET "userId" = (
  SELECT l."userId"
  FROM "contact_list" cl
  JOIN "list" l ON l."id" = cl."listId"
  WHERE cl."contactId" = c."id"
  LIMIT 1
);

-- Step 3: Delete orphan contacts that aren't linked to any list (no userId could be assigned)
DELETE FROM "contact" WHERE "userId" IS NULL;

-- Step 4: Make userId non-nullable
ALTER TABLE "contact" ALTER COLUMN "userId" SET NOT NULL;

-- Step 5: Drop the old unique constraint on email alone
DROP INDEX IF EXISTS "contact_email_key";

-- Step 6: Add new unique constraint on [email, userId]
CREATE UNIQUE INDEX "contact_email_userId_key" ON "contact"("email", "userId");

-- Step 7: Add index on userId for efficient filtering
CREATE INDEX "contact_userId_idx" ON "contact"("userId");

-- Step 8: Add foreign key constraint
ALTER TABLE "contact" ADD CONSTRAINT "contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
