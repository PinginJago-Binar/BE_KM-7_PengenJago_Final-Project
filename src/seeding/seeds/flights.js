import { PrismaClient } from "@prisma/client";
import { terminals } from "./terminals.js";
const prisma = new PrismaClient();

const seedFlights = async () => {

  let flights = [];
  
  let terminalData = terminals.map((terminal, index) => ({ id: index + 1, airportId: terminal.airportId }));
  const statuses = ["economy", "business"];
  const loopLength = 200;
  let daysToAddGroup = 1; // Variabel untuk mengatur kelompok daysToAdd
  let iterationCount = 0; // Menghitung iterasi dalam kelompok
  
  for (let i = 0; i < loopLength; i++) {
    const departureDate = new Date();
    
    // Atur daysToAdd berdasarkan aturan kelompok
    let daysToAdd = daysToAddGroup;
  
    // Hitung iterasi dalam kelompok kelipatan lima
    iterationCount++;
    if (iterationCount > 5) {
      iterationCount = 1; // Reset iterasi
      daysToAddGroup++;   // Pindah ke kelompok berikutnya
    }
  
    departureDate.setDate(departureDate.getDate() + daysToAdd);
  
    const departureTime = new Date();
    departureTime.setHours(Math.floor(Math.random() * 24));
    departureTime.setMinutes(Math.floor(Math.random() * 60));
  
    // Set departureTime ke departureDate
    departureDate.setHours(departureTime.getHours());
    departureDate.setMinutes(departureTime.getMinutes());
  
    // Menghitung waktu kedatangan setelah departureDate
    const randomHours = Math.floor(Math.random() * (12 - 2 + 1)) + 2;  // Rentang 2 hingga 12 jam
    const arrivalDate = new Date(departureDate);
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
  
    const terminalIds = terminalData.filter(
      (terminal) => terminal.airportId == departureAirportId
    );
  
    const terminalId =
      terminalIds.length !== 0
        ? terminalIds[Math.floor(Math.random() * terminalIds.length)].id
        : null;
  
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
