-- CreateIndex
CREATE INDEX "idx_flight_airports" ON "flights"("departure_airport_id", "destination_airport_id");

-- CreateIndex
CREATE INDEX "idx_flight_schedule" ON "flights"("departure_date", "departure_time");

-- CreateIndex
CREATE INDEX "idx_orderer_contact" ON "orderers"("email", "number_phone");

-- CreateIndex
CREATE INDEX "idx_passenger_identity" ON "passengers"("identity_number", "citizenship");

-- CreateIndex
CREATE INDEX "idx_transaction_user_status" ON "transactions"("user_id", "status");

-- CreateIndex
CREATE INDEX "idx_transaction_flights" ON "transactions"("departure_flight_id", "return_flight_id");
