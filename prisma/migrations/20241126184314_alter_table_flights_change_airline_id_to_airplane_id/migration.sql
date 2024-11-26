/*
  Warnings:

  - You are about to drop the column `airline_id` on the `flights` table. All the data in the column will be lost.
  - You are about to drop the column `publisherCountry` on the `passengers` table. All the data in the column will be lost.
  - Added the required column `airplane_id` to the `flights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publisher_country` to the `passengers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "flights" DROP CONSTRAINT "flights_airline_id_fkey";

-- AlterTable
ALTER TABLE "flights" DROP COLUMN "airline_id",
ADD COLUMN     "airplane_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "passengers" DROP COLUMN "publisherCountry",
ADD COLUMN     "publisher_country" VARCHAR(50) NOT NULL;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_airplane_id_fkey" FOREIGN KEY ("airplane_id") REFERENCES "airplanes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
