import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedSeats = async () => {
  const seats = [
    { code: "1A", airplaneId: 1, status: "available" },
    { code: "1B", airplaneId: 1, status: "booked" },
    { code: "2A", airplaneId: 2, status: "available" },
  ];

  await prisma.seat.createMany({ data: seats });
  console.log("Seats seeded!");
};

export default seedSeats;
