import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const cities = [
  { name: "Jakarta", cityCode: "JKT", countryId: 1 },
  { name: "New York", cityCode: "NYC", countryId: 2 },
  { name: "Berlin", cityCode: "BER", countryId: 3 },
  { name: "Rio de Janeiro", cityCode: "RIO", countryId: 4 },
  { name: "Sydney", cityCode: "SYD", countryId: 5 },
  { name: "Bandung", cityCode: "BDOA", countryId: 1 },
  { name: "Samarinda", cityCode: "SRIA", countryId: 1 },
];

const seedCities = async () => {
  console.log("Seeding Cities...");
  await prisma.city.createMany({
    data: cities,
  });
  console.log("Cities Seeded!");
};

export default seedCities;
