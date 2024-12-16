-- CreateEnum
CREATE TYPE "FlightType" AS ENUM ('return', 'departure');

-- AlterTable
ALTER TABLE "passengers" ADD COLUMN     "flight_type" "FlightType";
