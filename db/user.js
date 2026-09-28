import { USER_ERROR_CODES } from "../constants/errorCodes.js";
import { prisma } from "./prisma.js";

async function checkUsernameExists(username) {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });

  return !!user;
}

async function getUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
}

async function getUserByUsername(username) {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  return user;
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      username: true,
      rootDirectoryId: true,
      storageQuota: true,
      storageUsed: true,
    },
  });

  return user;
}

async function checkEmailExists(email) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
    },
  });

  return !!user;
  // Return True - User with email exists, False otherwise
}

async function createNewUser(email, username, hashedPassword) {
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    const ROOT_DIRECTORY_NAME = "home";

    const rootDirectory = await tx.directory.create({
      data: {
        name: ROOT_DIRECTORY_NAME,
        userId: user.id,
        parentId: null,
      },
      select: {
        id: true,
      },
    });

    const updatedUser = await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        rootDirectoryId: rootDirectory.id,
      },
      select: {
        id: true,
        rootDirectoryId: true,
        username: true,
        email: true,
        createdAt: true,
        storageQuota: true,
        storageUsed: true,
      },
    });

    return updatedUser;
  });

  return result;
}

async function incrementUserStorageUsed(userId, bytes) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        storageUsed: { increment: bytes },
      },
    });
  } catch (error) {
    console.error("Failed to increment user storage: ", error);
    const err = new Error("Failed to increment user storage");
    err.code = USER_ERROR_CODES.STORAGE_INCREMENT_FAILED;
    throw err;
  }
}

async function decrementUserStorageUsed(userId, bytes) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        storageUsed: { decrement: bytes },
      },
    });
  } catch (error) {
    console.error("Failed to decrement user storage: ", error);
    const err = new Error("Failed to decrement user storage");
    err.code = USER_ERROR_CODES.STORAGE_DECREMENT_FAILED;
    throw err;
  }
}

export {
  getUserByEmail,
  getUserById,
  checkEmailExists,
  createNewUser,
  checkUsernameExists,
  getUserByUsername,
  incrementUserStorageUsed,
  decrementUserStorageUsed,
};
