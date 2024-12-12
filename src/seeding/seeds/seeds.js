import seedContinents from "./continents.js";
import seedCountries from "./countries.js";
import seedCities from "./cities.js";
import seedAirports from "./airports.js";
import seedAirlines from "./airlines.js";
import { seedAirplanes } from "./airplanes.js";
import { seedTerminals } from "./terminals.js";
import seedSeats from "./seats.js";
import seedFlights from "./flights.js";
import seedOrderers from "./orderers.js";
import seedPassengers from "./passengers.js";
import seedPaymentDetails from "./paymentDetails.js";
import seedTransactions from "./transactions.js";
import seedNotification from "./notification.js";
import seedUsers from "./users.js";

const runAllSeeds = async () => {
  console.log("Starting Seeding Process...");
  await seedContinents();
  await seedCountries();
  await seedCities();
  await seedAirports();
  await seedAirlines();
  await seedAirplanes();
  await seedTerminals();
  await seedSeats();
  await seedFlights();  
  await seedOrderers();
  await seedPassengers();
  // await seedPaymentDetails();
  await seedNotification();
  await seedUsers();
  await seedTransactions();
  console.log("All Seeds Completed!");
};

export default runAllSeeds;
