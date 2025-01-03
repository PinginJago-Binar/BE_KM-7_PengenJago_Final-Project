import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const airplanes = [
  {
    airplaneCode: "GA001",
    airlineId: 1,
    totalSeat: 12,
    baggage: 30,
    cabinBaggage: 7
  },
  {
    airplaneCode: "AA001",
    airlineId: 2,
    totalSeat: 18,
    baggage: 25,
    cabinBaggage: 8
  },
  {
    airplaneCode: "LH001",
    airlineId: 3,
    totalSeat: 12,
    baggage: 20,
    cabinBaggage: 10
  },
  {
    airplaneCode: "QT001",
    airlineId: 4,
    totalSeat: 18,
    baggage: 25,
    cabinBaggage: 7
  },
  {
    airplaneCode: "AF001",
    airlineId: 5,
    totalSeat: 18,
    baggage: 30,
    cabinBaggage: 8
  },
  {
    airplaneCode: "BA001",
    airlineId: 6,
    totalSeat: 12,
    baggage: 20,
    cabinBaggage: 7
  },
  {
    airplaneCode: "BI001",
    airlineId: 7,
    totalSeat: 12,
    baggage: 25,
    cabinBaggage: 8
  },
  {
    airplaneCode: "QA001",
    airlineId: 8,
    totalSeat: 12,
    baggage: 35,
    cabinBaggage: 10
  },
  {
    airplaneCode: "SA001",
    airlineId: 9,
    totalSeat: 12,
    baggage: 30,
    cabinBaggage: 7
  },
  {
    airplaneCode: "AJ001",
    airlineId: 10,
    totalSeat: 18,
    baggage: 25,
    cabinBaggage: 7
  },
  {
    airplaneCode: "GA002",
    airlineId: 1,
    totalSeat: 12,
    baggage: 40,
    cabinBaggage: 12
  },
  {
    airplaneCode: "AA002",
    airlineId: 2,
    totalSeat: 12,
    baggage: 30,
    cabinBaggage: 10
  },
  {
    airplaneCode: "LH002",
    airlineId: 3,
    totalSeat: 12,
    baggage: 25,
    cabinBaggage: 7
  },
  {
    airplaneCode: "QT002",
    airlineId: 4,
    totalSeat: 12,
    baggage: 20,
    cabinBaggage: 8
  },
  {
    airplaneCode: "AF002",
    airlineId: 5,
    totalSeat: 12,
    baggage: 35,
    cabinBaggage: 10
  }
];

const seedAirplanes = async () => {
  await prisma.airplane.createMany({ data: airplanes });
  console.log("Airplanes seeded!");
};

export {
  seedAirplanes,
  airplanes
};
