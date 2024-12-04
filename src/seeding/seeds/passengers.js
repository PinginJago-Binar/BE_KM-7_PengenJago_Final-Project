import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedPassengers = async () => {
  const passengers = [
    {
      orderedId: 1,
      seatId: 1,
      title: "mr",
      fullname: "John Doe",
      passengerType: "adult",
      familyName: "Doe",
      birthDate: new Date("1980-01-01"),
      citizenship: "USA",
      identityNumber: "ID123456",
      publisherCountry: "USA",
      expiredAt: new Date("2030-01-01"),
    },
    {
      orderedId: 2,
      seatId: 2,
      title: "mrs",
      fullname: "Jane Smith",
      passengerType: "adult",
      familyName: "Smith",
      birthDate: new Date("1990-02-01"),
      citizenship: "Canada",
      identityNumber: "ID654321",
      publisherCountry: "Canada",
      expiredAt: new Date("2032-01-01"),
    },
  ];

  await prisma.passenger.createMany({ data: passengers });
  console.log("Passengers seeded!");
};

export default seedPassengers;
