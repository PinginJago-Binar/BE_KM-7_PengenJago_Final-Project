import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
    createPassenger,
    getPassengerByOrdererId,
    groupPassengersByType,
    updatePassengers
} from "../../services/Passenger.js";
import { PrismaClient } from "@prisma/client";


vi.mock("@prisma/client", () => {
    const mockPrisma = {
      passenger: {
        groupBy: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        createMany: vi.fn(),
        create: vi.fn(),
      },
    };
    return { PrismaClient: vi.fn(() => mockPrisma) };
  });
  
  const prisma = new PrismaClient();
  
  describe("Passenger service", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create multiple passengers when isBulk is true', async () => {
        const passengersData = [
            { name: 'John Doe', age: 30 },
            { name: 'Jane Doe', age: 25 }
        ];
        const mockPassengers = [
            { id: 1, name: 'John Doe', age: 30 },
            { id: 2, name: 'Jane Doe', age: 25 }
        ];
        
        // Mock the createMany method to return the created passengers
        prisma.passenger.createMany.mockResolvedValue({
          count: 2,
        });
        
        const result = await createPassenger(true, passengersData);
        
        expect(result).toEqual({ count: 2 });
        expect(prisma.passenger.createMany).toHaveBeenCalledWith({ data: passengersData });
    });

    it('should create a single passenger when isBulk is false', async () => {
        const passengerData = { name: 'John Doe', age: 30 };
        const mockPassenger = { id: 1, name: 'John Doe', age: 30 };
        
        // Mock the create method to return the created passenger
        prisma.passenger.create.mockResolvedValue(mockPassenger);
        
        const result = await createPassenger(false, passengerData);
        
        expect(result).toEqual(mockPassenger);
        expect(prisma.passenger.create).toHaveBeenCalledWith({ data: passengerData });
    });
    
    
    it('should group passengers by passengerType and flightType and return the correct count', async () => {
        const ordererId = 1;
        const mockGroupedPassengers = [
          { passengerType: 'adult', flightType: 'one-way', _count: { passengerType: 2 } },
          { passengerType: 'child', flightType: 'round-trip', _count: { passengerType: 1 } },
        ];
        
        // Mock the groupBy method to return the grouped passengers
        prisma.passenger.groupBy.mockResolvedValue(mockGroupedPassengers);
        
        const result = await groupPassengersByType(ordererId);
        
        expect(result).toEqual(mockGroupedPassengers);
        expect(prisma.passenger.groupBy).toHaveBeenCalledWith({
            where: { orderedId: ordererId },
            by: ['passengerType', 'flightType'],
            _count: { passengerType: true },
        });
    });
    
    it('should update passengers correctly', async () => {
        const ordererId = 1;
        const passengersToUpdate = [
            { id: 1, flightType: 'one-way', name: 'John Doe', age: 30 },
            { id: 2, flightType: 'round-trip', name: 'Jane Doe', age: 25 }
        ];
        
        // Mock the update method to simulate successful updates
        prisma.passenger.update.mockResolvedValueOnce({ id: 1, name: 'John Doe', age: 30 })
        .mockResolvedValueOnce({ id: 2, name: 'Jane Doe', age: 25 });
        
        await updatePassengers(ordererId, passengersToUpdate);
        
        // Ensure update was called for each passenger
        expect(prisma.passenger.update).toHaveBeenCalledTimes(2);
        
        // Check that update was called with correct arguments for each passenger
        expect(prisma.passenger.update).toHaveBeenCalledWith({
            where: {
                id: 2,
                orderedId: ordererId,
                flightType: 'round-trip'
            },
            data: { name: 'Jane Doe', age: 25, flightType: 'round-trip', },
        });
        
        expect(prisma.passenger.update).toHaveBeenCalledWith({
            where: {
                id: 2,
                orderedId: ordererId,
                flightType: 'round-trip'
            },
            data: { name: 'Jane Doe', flightType: 'round-trip', age: 25 },
        });
    });
    
    it('should return the passengers for the given ordererId', async () => {
        const ordererId = 1;
        const mockPassengers = [
            { id: 1, name: 'John Doe', orderedId: ordererId, flightType: 'one-way' },
            { id: 2, name: 'Jane Doe', orderedId: ordererId, flightType: 'round-trip' }
        ];
    
        // Mock the findMany method to return mock passengers
        prisma.passenger.findMany.mockResolvedValue(mockPassengers);
        
        const result = await getPassengerByOrdererId(ordererId);
        
        expect(result).toEqual(mockPassengers);
        expect(prisma.passenger.findMany).toHaveBeenCalledWith({
            where: { orderedId: ordererId },
        });
    });
    
});