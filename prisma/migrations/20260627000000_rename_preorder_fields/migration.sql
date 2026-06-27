PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Preorder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "products" INTEGER NOT NULL,
    "statusId" TEXT NOT NULL,
    "preorderWhen" TEXT,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Preorder_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Preorder" (
    "id",
    "orderNumber",
    "name",
    "products",
    "statusId",
    "preorderWhen",
    "startsAt",
    "endsAt",
    "notes",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "orderNumber",
    "customerName",
    "quantity",
    "statusId",
    "preorderWhen",
    "startsAt",
    "endsAt",
    "notes",
    "createdAt",
    "updatedAt"
FROM "Preorder";

DROP TABLE "Preorder";
ALTER TABLE "new_Preorder" RENAME TO "Preorder";
CREATE UNIQUE INDEX "Preorder_orderNumber_key" ON "Preorder"("orderNumber");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
