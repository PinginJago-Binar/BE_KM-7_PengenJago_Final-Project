import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedFlights = async () => {
  const flights = [
    {
      airplaneId: 1,
      departureAirportId: 1,
      destinationAirportId: 2,
      departureDate: new Date(),
      departureTime: new Date(),
      arrivalDate: new Date(),
      arrivalTime: new Date(),
      class: "economy",
      price: 150.0,
    },
  ];

  await prisma.flight.createMany({ data: flights });
  console.log("Flights seeded!");
};

export default seedFlights;
