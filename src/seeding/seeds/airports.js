import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const airports = [
  { name: "Soekarno-Hatta", iataCode: "CGK", cityId: 1 },
  { name: "John F. Kennedy", iataCode: "JFK", cityId: 2 },
  { name: "Berlin Brandenburg", iataCode: "BER", cityId: 3 },
  { name: "Galeão", iataCode: "GIG", cityId: 4 },
  { name: "Kingsford Smith", iataCode: "SYD", cityId: 5 },
  { name: "Husein Sastranegara", iataCode: "BDO", cityId: 6 },
  { name: "Termindung Airport", iataCode: "SRI", cityId: 7 },
  { name: "APT Pranoto Airport", iataCode: "AAP", cityId: 7 },
];

const seedAirports = async () => {
  console.log("Seeding Airports...");
  await prisma.airport.createMany({
    data: airports,
  });
  console.log("Airports Seeded!");
};

export default seedAirports;
