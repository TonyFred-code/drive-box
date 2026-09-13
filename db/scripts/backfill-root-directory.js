import { prisma } from "../prisma.js";

async function main() {
  await prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({
      where: {
        rootDirectoryId: null,
      },
      select: {
        id: true,
        email: true,
      },
    });

    for (const user of users) {
      const directory = await tx.directory.create({
        data: {
          name: "home",
          userId: user.id,
        },
      });

      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          rootDirectoryId: directory.id,
        },
      });

      console.log(
        `Created root directory for user ${user.email}: ${directory.id}`
      );
    }
  });
}

main()
  .then(async () => {
    console.log("Done!");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
  });
