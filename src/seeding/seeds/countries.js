import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const countries = [
  { name: "Indonesia", continentId: 2 },
  { name: "United States", continentId: 4 },
  { name: "Germany", continentId: 3 },
  { name: "Brazil", continentId: 5 },
  { name: "Australia", continentId: 6 },
  { name: "Nigeria", continentId: 1 },
  { name: "Aljazair", continentId: 1 },
];

const seedCountries = async () => {
  console.log("Seeding Countries...");
  await prisma.country.createMany({
    data: countries,
  });
  console.log("Countries Seeded!");
};

export default seedCountries;
