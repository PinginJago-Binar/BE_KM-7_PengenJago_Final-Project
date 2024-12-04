import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const continents = [
  { name: "Africa" },
  { name: "Asia" },
  { name: "Europe" },
  { name: "North America" },
  { name: "South America" },
  { name: "Australia" },
  { name: "Antarctica" },
];

const seedContinents = async () => {
  console.log("Seeding Continents...");
  await prisma.continent.createMany({
    data: continents,
  });
  console.log("Continents Seeded!");
};

export default seedContinents;
