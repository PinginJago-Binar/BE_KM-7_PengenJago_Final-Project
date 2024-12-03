import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedTerminals = async () => {
  const terminals = [
    { name: "Terminal 1", airportId: 1 },
    { name: "Terminal 2", airportId: 2 },
    { name: "Terminal 3", airportId: 3 },
  ];

  await prisma.terminal.createMany({ data: terminals });
  console.log("Terminals seeded!");
};

export default seedTerminals;
