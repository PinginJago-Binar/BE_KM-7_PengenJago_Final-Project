import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const airports = [
  { name: "Soekarno-Hatta", iataCode: "CGK", cityId: 1 },
  { name: "John F. Kennedy", iataCode: "JFK", cityId: 2 },
  { name: "Berlin Brandenburg", iataCode: "BER", cityId: 3 },
  { name: "Galeão", iataCode: "GIG", cityId: 4 },
  { name: "Kingsford Smith", iataCode: "SYD", cityId: 5 },
];

const seedAirports = async () => {
  console.log("Seeding Airports...");
  await prisma.airport.createMany({
    data: airports,
  });
  console.log("Airports Seeded!");
};

export default seedAirports;
