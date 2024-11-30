/*
  Warnings:

  - You are about to drop the column `class` on the `seats` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `seats` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "orderers_email_key";

-- AlterTable
ALTER TABLE "flights" ADD COLUMN     "class" "ClassSeat" NOT NULL DEFAULT 'economy',
ADD COLUMN     "price" DECIMAL NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "seats" DROP COLUMN "class",
DROP COLUMN "price";
