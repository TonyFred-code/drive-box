-- Create partial unique index for active files
CREATE UNIQUE INDEX "unique_active_file_name"
ON "File" ("name", "directoryId", "userId")
WHERE "deletedAt" IS NULL;