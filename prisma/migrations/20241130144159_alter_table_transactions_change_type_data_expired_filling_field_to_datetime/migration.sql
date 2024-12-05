/*
  Warnings:

  - The `expired_filling` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "expired_filling",
ADD COLUMN     "expired_filling" TIMESTAMP(3);
