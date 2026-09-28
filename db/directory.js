import { DIRECTORY_ERROR_CODES } from "../constants/errorCodes.js";
import { prisma } from "./prisma.js";
import { decrementUserStorageUsed } from "./user.js";

async function getDirectoryWithChildren(id, userId) {
  const directory = await prisma.directory.findUnique({
    where: {
      id,
    },
    include: {
      children: true,
      files: true,
    },
  });

  if (!directory) {
    const error = new Error("Directory not found");
    error.code = DIRECTORY_ERROR_CODES.DIRECTORY_NOT_FOUND;
    throw error;
  }

  if (directory.userId !== userId) {
    const error = new Error("You are not allowed access");
    error.code = DIRECTORY_ERROR_CODES.DIRECTORY_ACCESS_DENIED;
    throw error;
  }

  const files = directory.files.filter((file) => !file.deletedAt);
  directory.files = files;

  return directory;
}

/**
 * Recursively collects the IDs of a directory and all its descendants.
 *
 * @param {string} rootId
 * @returns {Promise<string[]>}
 */
async function collectSubtreeIds(rootId) {
  const ids = [];
  const queue = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    ids.push(currentId);

    const children = await prisma.directory.findMany({
      where: { parentId: currentId },
      select: { id: true },
    });

    children.forEach((c) => queue.push(c.id));
  }

  return ids;
}

async function deleteDirectory(id, userId) {
  const directory = await prisma.directory.findUnique({
    where: { id },
    select: { id: true, parentId: true, userId: true },
  });

  if (!directory) {
    const error = new Error("Directory not found");
    error.code = DIRECTORY_ERROR_CODES.DIRECTORY_NOT_FOUND;
    throw error;
  }

  if (directory.parentId === null) {
    const error = new Error("Root directory cannot be deleted");
    error.code = DIRECTORY_ERROR_CODES.ROOT_DIRECTORY_CANNOT_BE_DELETED;
    throw error;
  }

  if (directory.userId !== userId) {
    const error = new Error("You are not allowed access");
    error.code = DIRECTORY_ERROR_CODES.DIRECTORY_ACCESS_DENIED;
    throw error;
  }

  const subtreeIds = await collectSubtreeIds(id);

  const softDeletedFiles = await prisma.file.updateMany({
    where: {
      directoryId: { in: subtreeIds },
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
    select: {
      size: true,
    },
  });

  const softDeletedFilesSize = softDeletedFiles.reduce(
    (acc, file) => acc + file.size,
    0
  );
  await decrementUserStorageUsed(userId, softDeletedFilesSize);

  const orderedIds = [...subtreeIds].reverse();
  for (const dirId of orderedIds) {
    await prisma.directory.delete({ where: { id: dirId } });
  }

  return directory;
}

async function updateDirectory(id, userId, name) {
  const directory = await prisma.directory.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      parentId: true,
    },
  });

  if (!directory) {
    const error = new Error("Directory not found");
    error.code = DIRECTORY_ERROR_CODES.DIRECTORY_NOT_FOUND;
    throw error;
  }

  if (directory.parentId === null) {
    const error = new Error("Cannot update root directory");
    error.code = DIRECTORY_ERROR_CODES.ROOT_DIRECTORY_CANNOT_BE_UPDATED;
    throw error;
  }

  if (directory.userId !== userId) {
    const error = new Error("You are not allowed access");
    error.code = DIRECTORY_ERROR_CODES.DIRECTORY_ACCESS_DENIED;
    throw error;
  }

  const updatedDirectory = await prisma.directory.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });

  return updatedDirectory;
}

async function createDirectory(name, userId, parentId) {
  const parentDirectory = await prisma.directory.findUnique({
    where: {
      id: parentId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!parentDirectory) {
    const error = new Error("Parent Directory does not exist");
    error.code = DIRECTORY_ERROR_CODES.PARENT_DIRECTORY_NOT_FOUND;
    throw error;
  }

  if (parentDirectory.userId !== userId) {
    const error = new Error("You are not allowed access");
    error.code = DIRECTORY_ERROR_CODES.DIRECTORY_ACCESS_DENIED;
    throw error;
  }

  const newDirectory = await prisma.directory.create({
    data: {
      parentId,
      userId,
      name,
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      parentId: true,
      name: true,
    },
  });

  return newDirectory;
}

async function getDirectoryBreadcrumbs(directoryId, userId) {
  const breadcrumbs = [];
  let currentId = directoryId;

  while (currentId) {
    const dir = await prisma.directory.findUnique({
      where: { id: currentId },
      select: { id: true, name: true, parentId: true, userId: true },
    });

    if (!dir || dir.userId !== userId) break;

    // Prepend to array so root ends up at index 0
    breadcrumbs.unshift({ id: dir.id, name: dir.name });
    currentId = dir.parentId;
  }

  return breadcrumbs;
}

async function canAllowFileUpload(userId, directoryId) {
  const directory = await prisma.directory.findUnique({
    where: {
      id: directoryId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!directory) {
    const error = new Error("Directory not found");
    error.code = DIRECTORY_ERROR_CODES.DIRECTORY_NOT_FOUND;
    throw error;
  }

  if (directory.userId !== userId) {
    const error = new Error("You are not allowed access");
    error.code = DIRECTORY_ERROR_CODES.DIRECTORY_ACCESS_DENIED;
    throw error;
  }

  return true;
}

export {
  canAllowFileUpload,
  getDirectoryWithChildren,
  getDirectoryBreadcrumbs,
  createDirectory,
  updateDirectory,
  deleteDirectory,
};
