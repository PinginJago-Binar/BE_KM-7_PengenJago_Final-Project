import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedTerminals = async () => {
  const terminals = [
    { name: "Terminal A", airportId: 1 },
    { name: "Terminal A", airportId: 2 },
    { name: "Terminal A", airportId: 3 },
    { name: "Terminal B", airportId: 3 },
    { name: "Terminal B", airportId: 1 },
    { name: "Terminal C", airportId: 1 },
  ];

  await prisma.terminal.createMany({ data: terminals });
  console.log("Terminals seeded!");
};

export default seedTerminals;
