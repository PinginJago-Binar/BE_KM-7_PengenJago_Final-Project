import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const airlines = [
  { name: "Garuda Indonesia", logo: "https://ik.imagekit.io/dztvhjdtp/garuda-indonesia.png?updatedAt=1733410987468" },
  { name: "American Airlines", logo: "https://ik.imagekit.io/dztvhjdtp/american-airlines.png?updatedAt=1733410987554" },
  { name: "Lufthansa", logo: "https://ik.imagekit.io/dztvhjdtp/lufthansa.png?updatedAt=1733410987694" },
  { name: "Qantas", logo: "https://ik.imagekit.io/dztvhjdtp/qatar-airways.png?updatedAt=1733410987374" },
  { name: "Air France", logo: "https://ik.imagekit.io/dztvhjdtp/airfrance.png?updatedAt=1733410987857" },
  { name: "Batavia Air", logo: "https://ik.imagekit.io/dztvhjdtp/batavia-air.png?updatedAt=1733410987412" },
  { name: "Batik Indonesia", logo: "https://ik.imagekit.io/dztvhjdtp/batik-air.png?updatedAt=1733410988064" },
  { name: "Qatar Airways", logo: "https://ik.imagekit.io/dztvhjdtp/qatar-airways.png?updatedAt=1733410987374" },
  { name: "Singapore Airlines", logo: "https://ik.imagekit.io/dztvhjdtp/singapore-airlines.png?updatedAt=1733410987565" },
  { name: "AirAsia Japan", logo: "https://ik.imagekit.io/dztvhjdtp/airasia.png?updatedAt=1733410987528" },
];

const seedAirlines = async () => {
  console.log("Seeding Airlines...");
  await prisma.airline.createMany({
    data: airlines,
  });
  console.log("Airlines Seeded!");
};

export default seedAirlines;
