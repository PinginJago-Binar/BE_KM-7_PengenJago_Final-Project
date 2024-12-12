/*
  Warnings:

  - You are about to drop the column `card_holder_name` on the `payment_details` table. All the data in the column will be lost.
  - You are about to drop the column `card_number` on the `payment_details` table. All the data in the column will be lost.
  - You are about to drop the column `cvv` on the `payment_details` table. All the data in the column will be lost.
  - You are about to drop the column `expiry_date` on the `payment_details` table. All the data in the column will be lost.
  - You are about to drop the column `gopay_qr_code_url` on the `payment_details` table. All the data in the column will be lost.
  - You are about to drop the column `virtual_account_number` on the `payment_details` table. All the data in the column will be lost.
  - Changed the type of `payment_type` on the `payment_details` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "payment_details" DROP COLUMN "card_holder_name",
DROP COLUMN "card_number",
DROP COLUMN "cvv",
DROP COLUMN "expiry_date",
DROP COLUMN "gopay_qr_code_url",
DROP COLUMN "virtual_account_number",
DROP COLUMN "payment_type",
ADD COLUMN     "payment_type" TEXT NOT NULL;

-- DropEnum
DROP TYPE "PaymentType";
