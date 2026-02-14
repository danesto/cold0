-- Fix shared contacts: duplicate contact records for users who have
-- ContactList entries pointing to contacts they don't own.
--
-- For each contact_list entry where the contact's userId does NOT match
-- the list's userId, we need to:
--   1. Create a new contact record owned by the list's user (with fresh emailSent=false)
--   2. Update the contact_list entry to point to the new contact
--   3. Clean up any now-orphaned contact records

-- Step 1: Create new user-scoped contact copies for mismatched entries
-- Uses a CTE to insert new contacts and then update the contact_list references
WITH mismatched AS (
  SELECT
    cl."id" AS contact_list_id,
    cl."contactId" AS old_contact_id,
    cl."listId",
    l."userId" AS list_owner_id,
    c."email",
    c."firstName",
    c."lastName",
    c."company",
    c."jobTitle",
    c."website",
    c."phone",
    c."linkedInUrl",
    c."industry",
    c."companySize",
    c."numberOfEmployees",
    c."city",
    c."country",
    c."notes"
  FROM "contact_list" cl
  JOIN "contact" c ON c."id" = cl."contactId"
  JOIN "list" l ON l."id" = cl."listId"
  WHERE c."userId" != l."userId"
),
new_contacts AS (
  INSERT INTO "contact" (
    "id", "userId", "email", "firstName", "lastName",
    "company", "jobTitle", "website", "phone", "linkedInUrl",
    "industry", "companySize", "numberOfEmployees",
    "city", "country", "notes",
    "emailSent", "emailSentAt", "status",
    "createdAt", "updatedAt"
  )
  SELECT
    gen_random_uuid()::text,
    m.list_owner_id,
    m."email",
    m."firstName",
    m."lastName",
    m."company",
    m."jobTitle",
    m."website",
    m."phone",
    m."linkedInUrl",
    m."industry",
    m."companySize",
    m."numberOfEmployees",
    m."city",
    m."country",
    m."notes",
    false,        -- Reset emailSent for the new user's copy
    NULL,         -- Reset emailSentAt
    'PROSPECT',   -- Reset status to PROSPECT
    NOW(),
    NOW()
  FROM mismatched m
  -- Avoid creating duplicates if the user already has a contact with the same email
  WHERE NOT EXISTS (
    SELECT 1 FROM "contact" existing
    WHERE existing."email" = m."email"
      AND existing."userId" = m.list_owner_id
  )
  RETURNING "id", "userId", "email"
)
-- Step 2: Update contact_list entries to point to the newly created contacts
UPDATE "contact_list" cl
SET "contactId" = nc."id"
FROM new_contacts nc
JOIN mismatched m ON m."email" = nc."email" AND m.list_owner_id = nc."userId"
WHERE cl."id" = m.contact_list_id;

-- Step 3: For any remaining mismatched entries where the user already had the contact,
-- point to the existing user-owned contact instead
WITH still_mismatched AS (
  SELECT
    cl."id" AS contact_list_id,
    l."userId" AS list_owner_id,
    c."email"
  FROM "contact_list" cl
  JOIN "contact" c ON c."id" = cl."contactId"
  JOIN "list" l ON l."id" = cl."listId"
  WHERE c."userId" != l."userId"
)
UPDATE "contact_list" cl
SET "contactId" = existing."id"
FROM still_mismatched sm
JOIN "contact" existing ON existing."email" = sm."email" AND existing."userId" = sm.list_owner_id
WHERE cl."id" = sm.contact_list_id;

-- Step 4: Delete any contact_list entries that still point to contacts not owned by the list user
-- (safety net - should not happen after steps above)
DELETE FROM "contact_list" cl
USING "contact" c, "list" l
WHERE cl."contactId" = c."id"
  AND cl."listId" = l."id"
  AND c."userId" != l."userId";

-- Step 5: Delete orphaned contacts (contacts with no contact_list entries)
DELETE FROM "contact" c
WHERE NOT EXISTS (
  SELECT 1 FROM "contact_list" cl WHERE cl."contactId" = c."id"
);
