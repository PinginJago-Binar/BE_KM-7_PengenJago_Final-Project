-- AlterTable
ALTER TABLE "flights" ALTER COLUMN "departure_time" SET DATA TYPE TIME,
ALTER COLUMN "arrival_time" SET DATA TYPE TIME;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "expired_filling" SET DATA TYPE TIME;
