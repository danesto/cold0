-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('PROSPECT', 'CONTACTED', 'OPENED', 'REPLIED', 'INTERESTED', 'NOT_INTERESTED', 'BOUNCED', 'UNSUBSCRIBED');

-- CreateTable
CREATE TABLE "list" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "linkedInUrl" TEXT,
    "industry" TEXT,
    "companySize" TEXT,
    "numberOfEmployees" INTEGER,
    "city" TEXT,
    "country" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "status" "ContactStatus" NOT NULL DEFAULT 'PROSPECT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_list" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_list_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "list_userId_idx" ON "list"("userId");

-- CreateIndex
CREATE INDEX "contact_email_idx" ON "contact"("email");

-- CreateIndex
CREATE INDEX "contact_company_idx" ON "contact"("company");

-- CreateIndex
CREATE INDEX "contact_status_idx" ON "contact"("status");

-- CreateIndex
CREATE INDEX "contact_emailSent_idx" ON "contact"("emailSent");

-- CreateIndex
CREATE UNIQUE INDEX "contact_email_key" ON "contact"("email");

-- CreateIndex
CREATE INDEX "contact_list_contactId_idx" ON "contact_list"("contactId");

-- CreateIndex
CREATE INDEX "contact_list_listId_idx" ON "contact_list"("listId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_list_contactId_listId_key" ON "contact_list"("contactId", "listId");

-- AddForeignKey
ALTER TABLE "list" ADD CONSTRAINT "list_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_list" ADD CONSTRAINT "contact_list_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_list" ADD CONSTRAINT "contact_list_listId_fkey" FOREIGN KEY ("listId") REFERENCES "list"("id") ON DELETE CASCADE ON UPDATE CASCADE;
