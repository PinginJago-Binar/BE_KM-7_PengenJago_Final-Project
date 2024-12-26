import { PrismaClient } from "@prisma/client";
import { airplanes } from "./airplanes.js";
const prisma = new PrismaClient();

const seedSeats = async () => {

  // const statuses = ["available", "booked"];

  const seats = [];

  const generateSeatCode = (index) => {
    let code = '';
    let quotient = index;
    
    // Menghasilkan kode seat, contohnya A, B, ..., Z, AA, AB, ..., AZ, BA, ...
    while (quotient >= 0) {
      code = String.fromCharCode((quotient % 26) + 65) + code; // 65 adalah kode ASCII untuk 'A'
      quotient = Math.floor(quotient / 26) - 1; // Mengurangi 1 karena huruf A dimulai dari 0
    }
    
    return code;
  };
  
  airplanes.forEach((airplane, airplaneIndex) => {    
    for (let i = 1; i <= airplane.totalSeat; i++) {
      seats.push({
        code: `${airplaneIndex + 1}${generateSeatCode(i - 1)}`, // Mulai dari 0, jadi i-1
        airplaneId: airplaneIndex + 1,
        status: "available",
      });
    }
  });  

  await prisma.seat.createMany({ data: seats });
  console.log("Seats seeded!");
};

export default seedSeats;
