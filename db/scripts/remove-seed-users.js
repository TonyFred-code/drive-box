import { prisma } from "../prisma.js";

const emailsToRemove = [
  "alice@example.com",
  "bob@example.com",
  "charlie@example.com",
];

async function main() {
  // Manual deletion of seeded user files from storage is required
  const userFiles = await prisma.file.deleteMany({
    where: {
      user: {
        email: {
          in: emailsToRemove,
        },
      },
    },
  });

  console.log(`Removed ${userFiles.count} user files successfully.`);

  const result = await prisma.user.deleteMany({
    where: {
      email: {
        in: emailsToRemove,
      },
    },
  });

  console.log(`Removed ${result.count} users successfully.`);
}

main()
  .catch((error) => {
    console.error("Error removing users:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
