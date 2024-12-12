import { Faker, id_ID } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const seedOrderers = async () => {

  let orderers = [];
  const faker = new Faker({ locale: id_ID });

  for (let index = 0; index < 3; index++) {
    const firstname = faker.person.firstName(); 
    const lastname = faker.person.lastName(); 
    
    orderers.push({
      fullname: faker.person.fullName(),
      familyName: lastname,
      numberPhone: "087666777888",
      email: faker.internet.email({ firstName: firstname, lastName: lastname, provider: 'gmail.com' }),
      bookingCode: faker.string.alphanumeric({ length: { min: 5, max: 10 } }),
    });       
  }
  
  await prisma.orderer.createMany({ data: orderers });
  console.log("Orderers seeded!");
};

export default seedOrderers;
