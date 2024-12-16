import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHistoryTransactionAndDetail } from '../../controllers/historyController.js';
import { getHistoryAndDetail } from '../../services/Transaction.js';
import { mockRequest, mockResponse } from '../../utils/mockHelpers.js';

vi.mock('../../services/Transaction.js');

describe('getHistoryController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("return 400 jika userId tidak memiliki history", async () => {
        const req = mockRequest({ params: { userId: "1" } });
        const res = mockResponse();

        getHistoryAndDetail.mockResolvedValueOnce([]);

        await getHistoryTransactionAndDetail(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Anda belum melakukan pemesanan penerbangan.",
        });
    });

    it("Mengembalikan data mapping dengan status 200", async () => {
        const req = mockRequest({ params: { userId: "1" } });
        const res = mockResponse();

        // Mock the service with example transaction data
        getHistoryAndDetail.mockResolvedValueOnce([
        {
            id: BigInt(1),
            status: "confirmed",
            amount: 1400000,
            amountAfterTax: 1450000,
            order: {
            id: BigInt(1),
            bookingCode: "BOOK123",
            pasengger: [
                { passengerType: "adult", fullname: "John", familyName: "Doe" },
                { passengerType: "child", fullname: "Johny", familyName: "Doe" },
                { passengerType: "baby", fullname: "Johnson", familyName: "Doe" },
            ],
            },
            departureFlight: {
            price: 500000,
            class: "economy",
            departureTerminal: { name: "Terminal 1" },
            airplane: {
                airplaneCode: "A320",
                airline: { name: "Airline A", logo: "logo.png" },
            },
            departureDate: "2024-12-15",
            departureTime: "10:00",
            arrivalDate: "2024-12-15",
            arrivalTime: "12:00",
            departureAirport: {
                name: "Airport A",
                city: { name: "City A" },
            },
            destinationAirport: {
                name: "Airport B",
                city: { name: "City B" },
            },
            },
            returnFlight: {
                price: 500000,
                class: "economy",
                departureTerminal: { name: "Terminal 2" },
                airplane: {
                    airplaneCode: "A321",
                    airline: { name: "Airline B", logo: "logo_b.png" },
                },
                departureDate: "2024-12-20",
                departureTime: "15:00",
                arrivalDate: "2024-12-20",
                arrivalTime: "17:00",
                departureAirport: {
                    name: "Airport B",
                    city: { name: "City B" },
                },
                destinationAirport: {
                    name: "Airport A",
                    city: { name: "City A" },
                },
            },
        },
        ]);

        await getHistoryTransactionAndDetail(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [
            {
            transactionId: 1,
            departureFlight: {
                status: "confirmed",
                bookingCode: "BOOK123",
                airlineName: "Airline A",
                airplaneCode: "A320",
                seatClass: "economy",
                logo: "logo.png",
                departure: {
                city: "City A",
                date: "2024-12-15",
                time: "10:00",
                airport: "Airport A",
                terminalName: "Terminal 1",
                },
                arrival: {
                city: "City B",
                date: "2024-12-15",
                time: "12:00",
                airport: "Airport B",
                },
            },
            returnFlight: {
                status: "confirmed",
                bookingCode: "BOOK123",
                airlineName: "Airline B",
                airplaneCode: "A321",
                seatClass: "economy",
                logo: "logo_b.png",
                departure: {
                    city: "City B",
                    date: "2024-12-20",
                    time: "15:00",
                    airport: "Airport B",
                    terminalName: "Terminal 2",
                },
                arrival: {
                    city: "City A",
                    date: "2024-12-20",
                    time: "17:00",
                    airport: "Airport A",
                },
            },
            priceDetails: {
                passenger: [
                    { type: "adult", count: 1, total: 500000, flightType: "departure" },
                    { type: "child", count: 1, total: 450000, flightType: "departure" },
                    { type: "baby", count: 1, total: 0, flightType: "departure" },
                    { type: "adult", count: 1, total: 500000, flightType: "return" },
                    { type: "child", count: 1, total: 450000, flightType: "return" },
                    { type: "baby", count: 1, total: 0, flightType: "return" },
                ],
                tax: 50000,
                totalPayAfterTax: 1450000,
            },
            ordererNames: [
                { id: 1, fullname: "John Doe" },
                { id: 1, fullname: "Johny Doe" },
                { id: 1, fullname: "Johnson Doe" },
            ],        
            },
        ],
        });
    });
});