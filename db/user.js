import { prisma } from "./prisma.js";

async function getUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: {
      id,
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
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
  });

  return user;
}

export { getUserByEmail, getUserById, checkEmailExists, createNewUser };
