import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { DISCOUNT_FOR_CHILD, TAX_PAYMENT } from "../../config/constants.js"

const seedTransactions = async () => {

  const flights = await prisma.flight.findMany();  
  
  const status = ["unpaid", "issued", "cancelled"];
  const isPP = [false, true, false];
  const transactions = [];


  const loopTransaction = 3;
  for (let i = 0; i < loopTransaction; i++) {

    const ordererId = i + 1;

    const departureFlightId = i + 1;
    const departureFlight = await prisma.flight.findUnique({ where: { id: departureFlightId } });

    const returnFlightId = isPP[i] ? loopTransaction + 1 : null;
    const returnFlight = isPP[i] ? await prisma.flight.findUnique({ where: { id: returnFlightId } }) : null;

    let departurePrice = parseInt(departureFlight.price);
    let returnPrice = isPP[i] ? parseInt(returnFlight.price) : 0;

    const calculateAmount = async (price) => {
      const passengers = await prisma.passenger.findMany({ where: {orderedId: ordererId} });

      return passengers.reduce((accumulator, passenger) => {
        let priceTotal = 0;
        if (passenger.passengerType === 'adult') {
          priceTotal = price;
        } else if (passenger.passengerType === 'child') {
          priceTotal = price * (1 - DISCOUNT_FOR_CHILD);
        } 

        return accumulator + priceTotal;
      }, 0);

    }    

    const departureAmount = await calculateAmount(departurePrice);
    const returnAmount = isPP[i] ? await calculateAmount(returnPrice) : 0;
    const amount = departureAmount + returnAmount;

    const amountAfterTax = amount + (amount * TAX_PAYMENT);

    transactions.push({
      userId: 1,
      ordererId,
      departureFlightId,
      returnFlightId,
      status: status[i],
      amount,
      amountAfterTax,
      expiredPayment: new Date("2024-12-15T23:59:59Z"),
      expiredFilling: new Date("2024-12-16T01:00:00Z"),
    });
    
  }  

  await prisma.transaction.createMany({ data: transactions });
  console.log("Transactions seeded!");
};

export default seedTransactions;
