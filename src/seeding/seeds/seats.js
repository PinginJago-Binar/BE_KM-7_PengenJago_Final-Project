import { PrismaClient } from "@prisma/client";
import { airplanes } from "./airplanes.js";
const prisma = new PrismaClient();

const seedSeats = async () => {

  const statuses = ["available", "booked"];

  const seats = [];
  airplanes.forEach((airplane, airplaneIndex) => {    
    for (let i = 1; i <= airplane.totalSeat; i++) {
      seats.push({
        code: `${airplaneIndex + 1}${String.fromCharCode(64 + i)}`,
        airplaneId: airplaneIndex + 1,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }    
  });
  

  await prisma.seat.createMany({ data: seats });
  console.log("Seats seeded!");
};

export default seedSeats;
