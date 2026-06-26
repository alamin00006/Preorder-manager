/*
  Warnings:

  - You are about to drop the column `status` on the `Preorder` table. All the data in the column will be lost.
  - Added the required column `statusId` to the `Preorder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Status" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Status_name_key" ON "Status"("name");

-- Insert default status values
INSERT INTO "Status" ("id", "name", "createdAt", "updatedAt") VALUES ('active-id', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO "Status" ("id", "name", "createdAt", "updatedAt") VALUES ('inactive-id', 'inactive', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add statusId column to Preorder table
ALTER TABLE "Preorder" ADD COLUMN "statusId" TEXT NOT NULL DEFAULT 'active-id';

-- Update existing records to have proper statusId
UPDATE "Preorder" SET "statusId" = 'active-id' WHERE "status" = 'active';
UPDATE "Preorder" SET "statusId" = 'inactive-id' WHERE "status" = 'inactive';

-- Add foreign key constraint
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Preorder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "statusId" TEXT NOT NULL,
    "preorderWhen" TEXT,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Preorder_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Preorder" ("createdAt", "customerName", "email", "endsAt", "id", "notes", "orderNumber", "preorderWhen", "price", "product", "quantity", "startsAt", "updatedAt", "statusId") SELECT "createdAt", "customerName", "email", "endsAt", "id", "notes", "orderNumber", "preorderWhen", "price", "product", "quantity", "startsAt", "updatedAt", "statusId" FROM "Preorder";
DROP TABLE "Preorder";
ALTER TABLE "new_Preorder" RENAME TO "Preorder";
CREATE UNIQUE INDEX "Preorder_orderNumber_key" ON "Preorder"("orderNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
