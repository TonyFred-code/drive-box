import { hashPassword } from "../../lib/passwordUtils.js";
import { prisma } from "../prisma.js";

const usersToCreateRawData = [
  {
    username: "alice_w",
    email: "alice@example.com",
    password: "hashed_password_123", // Always store hashed passwords in production
  },
  {
    username: "bob_dev",
    email: "bob@example.com",
    password: "hashed_password_456",
  },
  {
    username: "charlie_k",
    email: "charlie@example.com",
    password: "hashed_password_789",
  },
];

async function main() {
  const usersToCreate = await Promise.all(
    usersToCreateRawData.map(async (user) => {
      const plaintextPassword = user.password;
      const hashedPassword = await hashPassword(plaintextPassword);

      return {
        ...user,
        password: hashedPassword,
      };
    })
  );

  const result = await prisma.user.createMany({
    data: usersToCreate,
    skipDuplicates: true, // Prevents errors if usernames or emails already exist
  });

  console.log(`Created ${result.count} users successfully.`);
}

main()
  .catch((error) => {
    console.error("Error creating users:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
