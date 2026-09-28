import { getUserStorageUsed } from "../file.js";
import { prisma } from "../prisma.js";

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      storageUsed: true,
      username: true,
    },
  });

  for (const user of users) {
    const storageUsed = await getUserStorageUsed(user.id);
    if (storageUsed !== user.storageUsed) {
      console.log(
        `User ${user.username} has storage used ${user.storageUsed}, but it should be ${storageUsed}`
      );
      await prisma.user.update({
        where: { id: user.id },
        data: { storageUsed },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error("Error updating user storage usage", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
