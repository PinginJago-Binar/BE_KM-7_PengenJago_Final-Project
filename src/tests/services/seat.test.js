import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
    getAvailableTickets,
    markSeatsAsAvailable,
    markSeatsAsBooked,
    getSeatByIds
} from "../../services/Seat.js";
import { PrismaClient } from "@prisma/client";

vi.mock("@prisma/client", () => {
    const mockPrismaClient = {
        seat: {
            count: vi.fn(),
            findMany: vi.fn(),
            updateMany: vi.fn(),
        },
    };
    return { PrismaClient: vi.fn(() => mockPrismaClient) };
});

const prisma = new PrismaClient();

describe("seat Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    
    it('should return the correct count of available tickets', async () => {
        const airplaneId = 1;
        const availableTickets = 10;
        
        // Mock the count method to return a specific number
        prisma.seat.count.mockResolvedValue(availableTickets);
        
        const result = await getAvailableTickets(airplaneId);
        
        expect(result).toBe(availableTickets);
        expect(prisma.seat.count).toHaveBeenCalledWith({
            where: { airplaneId, status: 'available' },
        });
    });
    
    it('should update the status of the given seats to "booked" and return the count of updated rows', async () => {
        const seatIds = [1, 2, 3];
        const updatedSeats = { count: 3 };
        
        // Mock the updateMany method to return the number of updated rows
        prisma.seat.updateMany.mockResolvedValue(updatedSeats);
        
        const result = await markSeatsAsBooked(seatIds);
        
        expect(result).toBe(updatedSeats.count);
        expect(prisma.seat.updateMany).toHaveBeenCalledWith({
            where: { id: { in: seatIds } },
            data: { status: 'booked' },
        });
    });
    
    it('should update the status of the given seats to "available" and return the count of updated rows', async () => {
        const seatIds = [1, 2, 3];
        const updatedSeats = { count: 3 };
        
        // Mock the updateMany method to return the number of updated rows
        prisma.seat.updateMany.mockResolvedValue(updatedSeats);
        
        const result = await markSeatsAsAvailable(seatIds);
        
        expect(result).toBe(updatedSeats.count);
        expect(prisma.seat.updateMany).toHaveBeenCalledWith({
            where: { id: { in: seatIds } },
            data: { status: 'available' },
        });
    });
    
    it('should return the correct seats based on the given ids', async () => {
        const seatIds = [1, 2, 3];
        const mockSeats = [
            { id: 1, status: 'available' },
            { id: 2, status: 'booked' },
            { id: 3, status: 'available' }
        ];
        
        // Mock the findMany method to return the mock seats
        prisma.seat.findMany.mockResolvedValue(mockSeats);
        
        const result = await getSeatByIds(seatIds);
        
        expect(result).toEqual(mockSeats);
        expect(prisma.seat.findMany).toHaveBeenCalledWith({
            where: { id: { in: seatIds } },
        });
    });
        
});
