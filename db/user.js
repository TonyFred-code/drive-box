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
    const ROOT_DIRECTORY_ID = crypto.randomUUID();

    await tx.directory.create({
      data: {
        name: ROOT_DIRECTORY_NAME,
        userId: user.id,
        id: ROOT_DIRECTORY_ID,
        parentId: null,
      },
    });

    await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        rootDirectoryId: ROOT_DIRECTORY_ID,
      },
    });

    return user;
  });

  return result;
}

export {
  getUserByEmail,
  getUserById,
  checkEmailExists,
  createNewUser,
  checkUsernameExists,
  getUserByUsername,
};
