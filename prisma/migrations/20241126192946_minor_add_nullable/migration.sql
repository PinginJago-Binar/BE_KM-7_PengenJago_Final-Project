-- DropForeignKey
ALTER TABLE "passengers" DROP CONSTRAINT "passengers_ordered_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_orderer_id_fkey";

-- AlterTable
ALTER TABLE "orderers" ALTER COLUMN "booking_code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "passengers" ALTER COLUMN "ordered_id" DROP NOT NULL,
ALTER COLUMN "fullname" DROP NOT NULL,
ALTER COLUMN "birth_date" DROP NOT NULL,
ALTER COLUMN "citizenship" DROP NOT NULL,
ALTER COLUMN "identity_number" DROP NOT NULL,
ALTER COLUMN "publisher_country" DROP NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "orderer_id" DROP NOT NULL,
ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "amount_after_tax" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_ordered_id_fkey" FOREIGN KEY ("ordered_id") REFERENCES "orderers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_orderer_id_fkey" FOREIGN KEY ("orderer_id") REFERENCES "orderers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
