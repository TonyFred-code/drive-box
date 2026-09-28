import { deleteFile } from "../db/file.js";
import { prisma } from "../db/prisma.js";
import { deleteFromStorage } from "./storage.js";

const SWEEP_BATCH_SIZE = 10;

/**
 * Deletes Supabase storage objects for soft-deleted files, then removes
 * the DB rows. Processes records in batches so a large delete doesn't
 * saturate the Supabase API in one shot.
 *
 * Partial failures are logged but do not abort the batch — a file whose
 * storage delete fails retains its `storagePath` so the next sweep retry
 * can attempt it again. Once storage is confirmed gone the DB row is
 * hard-deleted.
 */
async function runStorageSweep() {
  let swept = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const files = await prisma.file.findMany({
      where: { deletedAt: { not: null } },
      select: { id: true, storagePath: true, originalName: true, userId: true },
      take: SWEEP_BATCH_SIZE,
    });

    if (files.length === 0) return;

    await Promise.allSettled(
      files.map(async (file) => {
        try {
          if (file.storagePath) {
            await deleteFromStorage(file.storagePath);
          } else {
            skipped++;
          }

          await deleteFile(file.id, file.userId).catch((err) => {
            console.error(
              `[sweep] Failed to delete DB record for "${file.originalName}" (id: ${file.id}):`,
              err.message
            );
            failed++;
          });
          swept++;
        } catch (err) {
          console.error(
            `[sweep] Failed to delete storage object for "${file.originalName}" (id: ${file.id}):`,
            err.message
          );
          failed++;
        }
      })
    );

    console.log(
      `[sweep] Completed — ${swept} deleted (${skipped} had no storage object), ${failed} failed (will retry next run)`
    );
  } catch (err) {
    console.error("[sweep] Sweep query failed:", err.message);
  }
}

/**
 * Starts the storage sweep on the given interval.
 *
 * @param {number} intervalMs - How often to run the sweep (default: 5 minutes)
 * @returns {NodeJS.Timeout} Timer handle — call clearInterval() to stop it
 */
function startStorageSweep(intervalMs = 5 * 60 * 1000) {
  console.log(`[sweep] Storage sweep scheduled every ${intervalMs / 1000}s`);

  runStorageSweep();
  return setInterval(runStorageSweep, intervalMs);
}

export { startStorageSweep, runStorageSweep };
