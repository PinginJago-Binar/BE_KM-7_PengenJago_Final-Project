/*
  Warnings:

  - You are about to drop the column `numberPhone` on the `users` table. All the data in the column will be lost.
  - Added the required column `number_phone` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "amount_after_tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "expired_filling" TIMESTAMP(3),
ADD COLUMN     "expired_payment" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "numberPhone",
ADD COLUMN     "number_phone" VARCHAR(15) NOT NULL;
