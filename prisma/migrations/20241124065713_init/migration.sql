-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'buyer');

-- CreateEnum
CREATE TYPE "StatusSeat" AS ENUM ('available', 'booked');

-- CreateEnum
CREATE TYPE "ClassSeat" AS ENUM ('economy', 'business');

-- CreateEnum
CREATE TYPE "PassengerType" AS ENUM ('adult', 'child', 'baby');

-- CreateEnum
CREATE TYPE "TitlePassenger" AS ENUM ('mr', 'mrs', 'boy', 'girl');

-- CreateEnum
CREATE TYPE "StatusTransaction" AS ENUM ('issued', 'unpaid', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('gopay', 'virtual_account', 'credit_card');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(125) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "numberPhone" VARCHAR(15) NOT NULL,
    "gender" "Gender",
    "password" VARCHAR(100) NOT NULL,
    "otp" VARCHAR(6),
    "role" "Role" NOT NULL DEFAULT 'buyer',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "continents" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "continents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" BIGSERIAL NOT NULL,
    "continent_id" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" BIGSERIAL NOT NULL,
    "country_id" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "city_code" VARCHAR(5) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airports" (
    "id" BIGSERIAL NOT NULL,
    "city_id" BIGINT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "iata_code" VARCHAR(5) NOT NULL,

    CONSTRAINT "airports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terminals" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(125) NOT NULL,
    "airport_id" BIGINT NOT NULL,

    CONSTRAINT "terminals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airlines" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(125) NOT NULL,

    CONSTRAINT "airlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airplanes" (
    "id" BIGSERIAL NOT NULL,
    "airline_id" BIGINT NOT NULL,
    "airplane_code" VARCHAR(10) NOT NULL,
    "total_seat" INTEGER NOT NULL,
    "baggage" INTEGER NOT NULL,
    "cabin_baggage" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "airplanes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" BIGSERIAL NOT NULL,
    "airplane_id" BIGINT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "status" "StatusSeat" NOT NULL DEFAULT 'available',
    "class" "ClassSeat" NOT NULL,
    "price" DECIMAL NOT NULL,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flights" (
    "id" BIGSERIAL NOT NULL,
    "airline_id" BIGINT NOT NULL,
    "departure_airport_id" BIGINT NOT NULL,
    "departure_terminal_id" BIGINT,
    "destination_airport_id" BIGINT NOT NULL,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "arrival_date" TIMESTAMP(3) NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orderers" (
    "id" BIGSERIAL NOT NULL,
    "fullname" VARCHAR(125) NOT NULL,
    "family_name" VARCHAR(125),
    "number_phone" VARCHAR(15) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "booking_code" VARCHAR(15) NOT NULL,

    CONSTRAINT "orderers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passengers" (
    "id" BIGSERIAL NOT NULL,
    "ordered_id" BIGINT NOT NULL,
    "seat_id" BIGINT,
    "title" "TitlePassenger",
    "fullname" VARCHAR(125) NOT NULL,
    "passenger_type" "PassengerType" NOT NULL,
    "family_name" VARCHAR(125),
    "birth_date" TIMESTAMP(3) NOT NULL,
    "citizenship" VARCHAR(50) NOT NULL,
    "identity_number" VARCHAR(25) NOT NULL,
    "publisherCountry" VARCHAR(50) NOT NULL,
    "expired_at" TIMESTAMP(3),

    CONSTRAINT "passengers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "orderer_id" BIGINT NOT NULL,
    "flight_id" BIGINT NOT NULL,
    "status" "StatusTransaction" NOT NULL DEFAULT 'unpaid',
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_details" (
    "id" BIGSERIAL NOT NULL,
    "transaction_id" BIGINT NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "gopay_qr_code_url" VARCHAR(255),
    "virtual_account_number" VARCHAR(50),
    "card_number" VARCHAR(20),
    "card_holder_name" VARCHAR(100),
    "expiry_date" VARCHAR(7),
    "cvv" VARCHAR(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "payment_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "orderers_email_key" ON "orderers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "orderers_booking_code_key" ON "orderers"("booking_code");

-- CreateIndex
CREATE UNIQUE INDEX "payment_details_transaction_id_key" ON "payment_details"("transaction_id");

-- AddForeignKey
ALTER TABLE "countries" ADD CONSTRAINT "countries_continent_id_fkey" FOREIGN KEY ("continent_id") REFERENCES "continents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airports" ADD CONSTRAINT "airports_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminals" ADD CONSTRAINT "terminals_airport_id_fkey" FOREIGN KEY ("airport_id") REFERENCES "airports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airplanes" ADD CONSTRAINT "airplanes_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "airlines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_airplane_id_fkey" FOREIGN KEY ("airplane_id") REFERENCES "airplanes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "airlines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_departure_airport_id_fkey" FOREIGN KEY ("departure_airport_id") REFERENCES "airports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_destination_airport_id_fkey" FOREIGN KEY ("destination_airport_id") REFERENCES "airports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flights" ADD CONSTRAINT "flights_departure_terminal_id_fkey" FOREIGN KEY ("departure_terminal_id") REFERENCES "terminals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_ordered_id_fkey" FOREIGN KEY ("ordered_id") REFERENCES "orderers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_orderer_id_fkey" FOREIGN KEY ("orderer_id") REFERENCES "orderers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flights"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_details" ADD CONSTRAINT "payment_details_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
