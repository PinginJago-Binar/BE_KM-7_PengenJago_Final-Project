import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedAirplanes = async () => {
  const airplanes = [
    {
      airplaneCode: "GA001",
      airlineId: 1,
      totalSeat: 200,
      baggage: 30,
      cabinBaggage: 7,
    },
    {
      airplaneCode: "LH002",
      airlineId: 2,
      totalSeat: 220,
      baggage: 25,
      cabinBaggage: 8,
    },
  ];

  await prisma.airplane.createMany({ data: airplanes });
  console.log("Airplanes seeded!");
};

export default seedAirplanes;
