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

export { getUserByEmail, getUserById };
