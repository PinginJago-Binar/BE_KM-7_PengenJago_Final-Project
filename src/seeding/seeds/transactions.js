import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedTransactions = async () => {
  const transactions = [
    {
      userId: 1,
      ordererId: 1,
      departureFlightId: 1,
      returnFlightId: null,
      status: "unpaid",
      amount: 100.0,
      amountAfterTax: 110.0,
      expiredPayment: new Date("2024-12-15T23:59:59Z"),
      expiredFilling: new Date("2024-12-16T01:00:00Z"),
    },
    {
      userId: 2,
      ordererId: 2,
      departureFlightId: 2,
      returnFlightId: null,
      status: "issued",
      amount: 200.0,
      amountAfterTax: 220.0,
      expiredPayment: null,
      expiredFilling: null,
    },
  ];

  await prisma.transaction.createMany({ data: transactions });
  console.log("Transactions seeded!");
};

export default seedTransactions;
