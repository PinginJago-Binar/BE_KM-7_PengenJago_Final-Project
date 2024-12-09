import { faker, Faker, id_ID } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedPassengers = async () => {

  let passengers = [];
  const fakerID = new Faker({ locale: id_ID });  

  const ordererLoop = 3; // Loop berdasarkan banyaknya orderer yang di seed

  for (let i = 0; i < ordererLoop; i++) {
    const passengerLoop = Math.floor(Math.random() * 3) + 1;
  
    for (let j = 0; j < passengerLoop; j++) {
      // Pilih title secara acak dari 'mr', 'mrs', 'boy', 'girl'
      const titles = ['mr', 'mrs', 'boy', 'girl'];
      const title = titles[Math.floor(Math.random() * titles.length)];
  
      let passengerType = '';
      
      // Tentukan passengerType berdasarkan title
      if (title === 'mr' || title === 'mrs') {
        passengerType = 'adult';
      } else if (title === 'boy' || title === 'girl') {
        passengerType = 'child';
      } else if (title === 'baby') {
        passengerType = 'baby';
      }
      
      passengers.push({
        orderedId: i + 1,
        seatId: 1,
        title: title === 'baby' ? null : title, // Set title null jika 'baby'
        fullname: fakerID.person.fullName(),
        passengerType: passengerType,
        familyName: fakerID.person.lastName(),
        birthDate: fakerID.date.birthdate({ mode: 'age', min: 8, max: 40 }),
        citizenship: faker.location.country(),
        identityNumber: fakerID.commerce.isbn(10),
        publisherCountry: faker.location.country(),
        expiredAt: new Date("2030-01-01"),
      });
    }    
  }    

  await prisma.passenger.createMany({ data: passengers });
  console.log("Passengers seeded!");
};

export default seedPassengers;
