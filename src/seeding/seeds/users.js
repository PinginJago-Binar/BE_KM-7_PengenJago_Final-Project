import { PrismaClient } from "@prisma/client";
import bycrypt from "bcrypt";
const prisma = new PrismaClient();

const seedUsers = async () => {
  const users = [
    {
      name: "John Doe",
      email: "johndoe@example.com",
      numberPhone: "1234567890",
      password: await bycrypt.hash("password123", 10),
    },
    {
      name: "Jane Smith",
      email: "janesmith@example.com",
      numberPhone: "0987654321",
      password: await bycrypt.hash("password456", 10),
    },
  ];

  await prisma.user.createMany({ data: users });
  console.log("Users seeded!");
};

export default seedUsers;
