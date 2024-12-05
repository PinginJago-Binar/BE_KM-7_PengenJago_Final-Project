import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedPaymentDetails = async () => {
  const paymentDetails = [
    {
      transactionId: 1,
      paymentType: "credit_card",
      cardNumber: "4111111111111111",
      cardHolderName: "John Doe",
      expiryDate: "12/26",
      cvv: "123",
    },
    {
      transactionId: 2,
      paymentType: "gopay",
      gopayQrCodeUrl: "https://gopay.example.com/qr123",
    },
  ];

  await prisma.paymentDetail.createMany({ data: paymentDetails });
  console.log("Payment Details seeded!");
};

export default seedPaymentDetails;
