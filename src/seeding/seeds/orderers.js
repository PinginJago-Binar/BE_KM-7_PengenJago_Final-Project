import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedOrderers = async () => {
  const orderers = [
    {
      fullname: "John Doe",
      familyName: "Doe",
      numberPhone: "1234567890",
      email: "johndoe@example.com",
      bookingCode: "BOOK123",
    },
    {
      fullname: "Jane Smith",
      familyName: "Smith",
      numberPhone: "0987654321",
      email: "janesmith@example.com",
      bookingCode: "BOOK456",
    },
  ];

  await prisma.orderer.createMany({ data: orderers });
  console.log("Orderers seeded!");
};

export default seedOrderers;
