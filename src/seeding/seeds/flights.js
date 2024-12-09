import { PrismaClient } from "@prisma/client";
import { terminals } from "./terminals.js";
const prisma = new PrismaClient();

const seedFlights = async () => {

  let flights = [];
  
  let terminalData = terminals.map((terminal, index) => ({ id: index + 1, airportId: terminal.airportId }));
  const statuses = ["economy", "business"];
  const loopLength = 30;

  for (let i = 0; i < loopLength; i++) {
  
    const departureDate = new Date();
    let daysToAdd = i + 1;
    departureDate.setDate(departureDate.getDate() + daysToAdd);
  
    const departureTime = new Date();
    departureTime.setHours(Math.floor(Math.random() * 24));
    departureTime.setMinutes(Math.floor(Math.random() * 60));

    const arrivalDate = new Date(departureDate);   
    const randomHours = Math.floor(Math.random() * (24 - 2 + 1)) + 2; 
    arrivalDate.setHours(arrivalDate.getHours() + randomHours);      
    
    const arrivalTime = new Date(arrivalDate);    
    
    let priceInRupiah = Math.floor(Math.random() * (4000000 - 900000 + 1)) + 900000;
    priceInRupiah = Math.round(priceInRupiah / 100000) * 100000;

    const departureAirportId = Math.floor(Math.random() * 8) + 1;
    let destinationAirportId = Math.floor(Math.random() * 8) + 1;

    while (departureAirportId === destinationAirportId) {
      destinationAirportId = Math.floor(Math.random() * 8) + 1;
    }

    const airplaneId = Math.floor(Math.random() * 15) + 1;

    const terminalIds = terminalData.filter(terminal => terminal.airportId == departureAirportId);
    
    const terminalId = terminalIds.length !== 0 ? terminalIds[Math.floor(Math.random() * terminalIds.length)].id : null;
    

    flights.push({
      airplaneId: airplaneId,
      departureAirportId,      
      destinationAirportId,
      departureTerminalId: terminalId,
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
