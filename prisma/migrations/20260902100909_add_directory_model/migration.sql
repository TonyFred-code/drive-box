/*
  Warnings:

  - A unique constraint covering the columns `[rootDirectoryId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rootDirectoryId" UUID;

-- CreateTable
CREATE TABLE "Directory" (
    "id" UUID NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "userId" UUID NOT NULL,
    "parentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Directory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Directory_userId_idx" ON "Directory"("userId");

-- CreateIndex
CREATE INDEX "Directory_parentId_idx" ON "Directory"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Directory_name_parentId_userId_key" ON "Directory"("name", "parentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_rootDirectoryId_key" ON "User"("rootDirectoryId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_rootDirectoryId_fkey" FOREIGN KEY ("rootDirectoryId") REFERENCES "Directory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Directory" ADD CONSTRAINT "Directory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Directory" ADD CONSTRAINT "Directory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Directory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
