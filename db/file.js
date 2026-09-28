import { FILE_ERROR_CODES } from "../constants/errorCodes.js";
import { prisma } from "./prisma.js";

async function createFilePlaceholder(file, userId, directoryId) {
  const existingFile = await prisma.file.findFirst({
    where: {
      name: file.originalname,
      directoryId,
      userId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (existingFile) {
    const error = new Error("File already exists in this directory");
    error.code = FILE_ERROR_CODES.FILE_ALREADY_EXISTS;
    throw error;
  }

  const createdFile = await prisma.file.create({
    data: {
      name: file.originalname,
      originalName: file.originalname,
      storagePath: "", // placeholder — filled after Supabase upload
      mimeType: file.mimetype,
      size: file.size,
      directoryId,
      userId,
    },
    select: { id: true },
  });

  return createdFile;
}

/**
 * Updates a placeholder record with the real Supabase storage path.
 */
async function updateFileStorageDetails(fileId, storagePath) {
  return prisma.file.update({
    where: { id: fileId },
    data: { storagePath },
    select: { id: true },
  });
}

/**
 * Retrieves the total storage used by a specific user in bytes.
 * @param {string} userId The ID of the user.
 * @returns {Promise<number>} The total storage used by the user in bytes.
 */
async function getUserStorageUsed(userId) {
  const result = await prisma.file.aggregate({
    where: { userId, deletedAt: null },
    _sum: { size: true },
  });

  return result._sum.size || 0;
}

/**
 * Soft deletes a file (sets deletedAt). Returns full record so caller can
 * use storagePath to remove the object from Supabase Storage.
 */
async function softDeleteFile(fileId, userId) {
  const file = await prisma.file.findFirst({
    where: { id: fileId },
    select: { userId: true, storagePath: true },
  });

  if (!file) {
    const error = new Error("File not found");
    error.code = FILE_ERROR_CODES.FILE_NOT_FOUND;
    throw error;
  }

  if (file.userId !== userId) {
    const error = new Error("You are not authorized to delete this file");
    error.code = FILE_ERROR_CODES.UNAUTHORIZED;
    throw error;
  }

  return prisma.file.update({
    where: { id: fileId },
    data: { deletedAt: new Date() },
    select: { id: true, storagePath: true },
  });
}

/**
 * Hard deletes a file record from the database.
 * Caller is responsible for removing the object from Supabase Storage first.
 */
async function deleteFile(fileId, userId) {
  const file = await prisma.file.findFirst({
    where: { id: fileId },
    select: { userId: true },
  });

  if (!file) {
    const error = new Error("File not found");
    error.code = FILE_ERROR_CODES.FILE_NOT_FOUND;
    throw error;
  }

  if (file.userId !== userId) {
    const error = new Error("You are not authorized to delete this file");
    error.code = FILE_ERROR_CODES.UNAUTHORIZED;
    throw error;
  }

  return prisma.file.delete({
    where: { id: fileId },
  });
}

async function getFileForUser(fileId, userId) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId, deletedAt: null },
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      storagePath: true,
    },
  });

  if (!file) {
    const error = new Error("File not found");
    error.code = FILE_ERROR_CODES.FILE_NOT_FOUND;
    throw error;
  }

  return file;
}

async function updateFileName(fileId, name, userId) {
  const file = await prisma.file.findFirst({
    where: { id: fileId, deletedAt: null },
    select: { userId: true },
  });

  if (!file) {
    const error = new Error("File not found");
    error.code = FILE_ERROR_CODES.FILE_NOT_FOUND;
    throw error;
  }

  if (file.userId !== userId) {
    const error = new Error("You are not authorized to update this file");
    error.code = FILE_ERROR_CODES.UNAUTHORIZED;
    throw error;
  }

  return prisma.file.update({
    where: { id: fileId },
    data: { name },
    select: { id: true },
  });
}

async function getFilesStats(directoryIds, userId) {
  const files = await prisma.file.findMany({
    where: { directoryId: { in: directoryIds }, userId, deletedAt: null },
    select: { size: true },
  });

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return {
    fileCount: files.length,
    totalSize,
  };
}

async function multiSoftDeleteFilesByDirectoryId(directoryIds, userId) {
  const filesToDelete = await prisma.file.findMany({
    where: {
      directoryId: {
        in: directoryIds,
      },
      userId,
      deletedAt: null,
    },
    select: {
      size: true,
    },
  });

  await prisma.file.updateMany({
    where: {
      directoryId: {
        in: directoryIds,
      },
      userId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return filesToDelete;
}

export {
  createFilePlaceholder,
  updateFileStorageDetails,
  softDeleteFile,
  deleteFile,
  getFileForUser,
  updateFileName,
  getUserStorageUsed,
  getFilesStats,
  multiSoftDeleteFilesByDirectoryId,
};
