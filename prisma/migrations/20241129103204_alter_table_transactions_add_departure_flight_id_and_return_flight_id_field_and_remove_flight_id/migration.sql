/*
  Warnings:

  - You are about to drop the column `flight_id` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `departure_flight_id` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_flight_id_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "flight_id",
ADD COLUMN     "departure_flight_id" BIGINT NOT NULL,
ADD COLUMN     "return_flight_id" BIGINT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_departure_flight_id_fkey" FOREIGN KEY ("departure_flight_id") REFERENCES "flights"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_return_flight_id_fkey" FOREIGN KEY ("return_flight_id") REFERENCES "flights"("id") ON DELETE SET NULL ON UPDATE CASCADE;
