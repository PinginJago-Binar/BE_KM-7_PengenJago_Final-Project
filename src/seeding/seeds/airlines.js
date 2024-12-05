import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const airlines = [
  { name: "Garuda Indonesia", logo: "garuda.png" },
  { name: "American Airlines", logo: "american.png" },
  { name: "Lufthansa", logo: "lufthansa.png" },
  { name: "Qantas", logo: "qantas.png" },
  { name: "Air France", logo: "airfrance.png" },
  { name: "Batavia Air", logo: "batavia.png" },
  { name: "Batik Indonesia", logo: "batik.png" },
  { name: "Qatar Airways", logo: "qatar-airways.png" },
  { name: "Singapore Airlines", logo: "singapore-airlines.png" },
  { name: "AirAsia Japan", logo: "japan.png" },
];

const seedAirlines = async () => {
  console.log("Seeding Airlines...");
  await prisma.airline.createMany({
    data: airlines,
  });
  console.log("Airlines Seeded!");
};

export default seedAirlines;
