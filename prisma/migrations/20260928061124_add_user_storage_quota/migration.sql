-- AlterTable
ALTER TABLE "User" ADD COLUMN     "storageQuota" INTEGER NOT NULL DEFAULT 33554432,
ADD COLUMN     "storageUsed" INTEGER NOT NULL DEFAULT 0;

-- UPDATE PREV USERS STORAGE QUOTAS

UPDATE "User" AS u
SET "storageUsed" = COALESCE(
    (
        SELECT SUM(f."size")
        FROM "File" AS f
        WHERE f."userId" = u."id" AND f."deletedAt" IS NULL
    ),
    0
)::integer;