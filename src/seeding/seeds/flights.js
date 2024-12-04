import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedFlights = async () => {

  let flights = [];
  
  const statuses = ["economy", "business"];

  const loopLength = 15;
  for (let i = 0; i < loopLength; i++) {
  
    const departureDate = new Date();
    const daysToAdd = i + 1;
    departureDate.setDate(departureDate.getDate() + daysToAdd);
  
    const arrivalDate = new Date();
    const daysToAddArrivalDate = (i + 1) % 2 === 0 ? i + 1 : i + 2;
    arrivalDate.setDate(arrivalDate.getDate() + daysToAddArrivalDate);
      
    const departureTime = new Date();
    departureTime.setHours(Math.floor(Math.random() * 24));
    departureTime.setMinutes(Math.floor(Math.random() * 60)); 
    departureTime.setSeconds(Math.floor(Math.random() * 60));
    
    const arrivalTime = new Date(departureTime);
    const additionalHours = Math.floor(Math.random() * 5) + 1;
    const additionalMinutes = Math.floor(Math.random() * 60);
    const additionalSeconds = Math.floor(Math.random() * 60);
    arrivalTime.setHours(arrivalTime.getHours() + additionalHours);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + additionalMinutes);
    arrivalTime.setSeconds(arrivalTime.getSeconds() + additionalSeconds);
    
    const priceInRupiah = Math.floor(Math.random() * 10 + 1) * 1000000;

    const departureAirportId = Math.floor(Math.random() * 8) + 1;
    const destinationAirportId = Math.floor(Math.random() * 8) + 1;
  

    flights.push({
      airplaneId: 1,
      departureAirportId,      
      destinationAirportId,
      departureDate: departureDate.toISOString(),
      departureTime: departureTime.toISOString(),
      arrivalDate: arrivalDate.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      class: statuses[Math.floor(Math.random() * statuses.length)],
      price: priceInRupiah,
    });
  }  

  await prisma.flight.createMany({ data: flights });
  console.log("Flights seeded!");
};

export default seedFlights;
