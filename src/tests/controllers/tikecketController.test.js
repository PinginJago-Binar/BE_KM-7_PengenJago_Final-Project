import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTicket } from '../../controllers/ticketController.js';
import { getTransactionById, getCetakTiketById } from '../../services/Transaction.js';
import { mockRequest, mockResponse } from '../../utils/mockHelpers.js';
import PDFDocument  from 'pdfkit';
import asyncWrapper from '../../utils/asyncWrapper.js';


vi.mock('../../services/Transaction', () => ({
    getTransactionById: vi.fn(),
    getCetakTiketById: vi.fn(),
}));
    

vi.mock("../../utils/asyncWrapper.js", () => {
    return {
        default: (fn) => fn,
    };
});


vi.mock('pdfkit', () => ({
    default: vi.fn(() => ({
        on: vi.fn((event, callback) => {
            if (event === 'data' || event === 'end') callback();
        }),
        moveTo: vi.fn().mockReturnThis(),
        text: vi.fn().mockReturnThis(),
        lineTo: vi.fn().mockReturnThis(),
        strokeColor: vi.fn().mockReturnThis(),
        fontSize: vi.fn().mockReturnThis(),
        font: vi.fn().mockReturnThis(),
        fillColor: vi.fn().mockReturnThis(),
        moveDown: vi.fn().mockReturnThis(),
        lineWidth: vi.fn().mockReturnThis(),
        stroke: vi.fn().mockReturnThis(),
        pipe: vi.fn(),
        end: vi.fn(),
    })),
}));

const doc = new PDFDocument({
    size: 'A4', // Changed to A4 landscape
    layout: 'landscape', // Landscape orientation
    margin: 50
});

describe('createTicket', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    }); 
    
    it('should return 404 if transaction is not found', async () => {
        const req = mockRequest({ params: { transactionId: 'invalid-id' } });
        const res = mockResponse();
        
        getTransactionById.mockResolvedValueOnce(null);
        
        
        await createTicket(req, res);
        
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Transaction not found',
        });
    });      
        
    
    it('should generate a PDF and send it as a response', async () => {
        // Mock data
        const transactionId = '12345';
        const req = mockRequest({params : { transactionId }});
        const mockTransaction = { id: transactionId };
        const mockTicketData = {
            order: { bookingCode: 'ABC123', pasengger: [] },
            departureFlight: null,
            returnFlight: null,
        };
        
        const res = mockResponse();
        
        getTransactionById.mockResolvedValue(mockTransaction);
        getCetakTiketById.mockResolvedValue(mockTicketData);
        
        await createTicket(req, res);
        
        expect(getTransactionById).toHaveBeenCalledWith(transactionId);
        expect(getCetakTiketById).toHaveBeenCalledWith(transactionId);
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(res.setHeader).toHaveBeenCalledWith(
            'Content-Disposition',
            expect.stringContaining('ticket-ABC123.pdf')
            );
        expect(res.send).toHaveBeenCalled();
    });
    
    
    it('should include return flight details in the PDF', async () => {
        // Mock request params
        const transactionId = '12345';
        const req = mockRequest({params : { transactionId }});
        const res = mockResponse();
        
        // Mock data
        const mockTransaction = { id: transactionId };
        const mockTicketData = {
            order: { bookingCode: 'ABC123', pasengger: [] },
            departureFlight: null, // No departure flight for this test
            returnFlight: {
                airplane: {
                    airline: { name: 'Mock Airline' },
                    airplaneCode: 'MOCK123',
                    baggage: 20,
                    cabinBaggage: 7,
                },
                class: 'Economy',
                departureAirport: {
                    city: { name: 'Mock City' },
                    name: 'Mock Airport',
                },
                departureDate: '2024-12-25T10:00:00Z',
                departureTime: '10:00:00',
                departureTerminal: { name: 'Terminal 1' },
                destinationAirport: {
                    city: { name: 'Destination City' },
                    name: 'Destination Airport',
                },
                arrivalDate: '2024-12-25T13:00:00Z',
                arrivalTime: '13:00:00',
                pasengger: [
                    {
                        title: 'Mr',
                        fullname: 'John',
                        familyName: 'Doe',
                        seat: { code: '12A' },
                    },
                ],
            },
        };
        
        // Mock services
        getTransactionById.mockResolvedValue(mockTransaction);
        getCetakTiketById.mockResolvedValue(mockTicketData);
        
        // Call the function
        await createTicket(req, res);
        
        // Assertions
        expect(getTransactionById).toHaveBeenCalledWith(transactionId);
        expect(getCetakTiketById).toHaveBeenCalledWith(transactionId);
        
        // Ensure response headers are set
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(res.setHeader).toHaveBeenCalledWith(
            'Content-Disposition',
            expect.stringContaining('ticket-ABC123.pdf')
            );    
        // Ensure PDF was sent
        expect(res.send).toHaveBeenCalled();
        
        
        // Ensure PDF includes return flight details (if your mock PDF supports validation)
        expect(res.send.mock.calls[0][0]).toBeTruthy();
    });
    
    
    it('should handle missing departure airport and destination airport gracefully', async () => {
        
        const transactionId = '12345';
        const req = mockRequest({params : { transactionId }});
        const res = mockResponse();
        const mockTicketData = {
            order: { bookingCode: 'ABC123', pasengger: [] },
            departureFlight: {
                airplane: {
                    airline: { name: 'Airline A' },
                    airplaneCode: 'A123',
                },
                class: 'Economy',
                departureAirport: null, // Missing departure airport
                departureDate: '2024-12-25T10:00:00Z',
                departureTime: null, // Missing time
                departureTerminal: null, // Missing terminal
                destinationAirport: null, // Missing destination airport
                arrivalDate: '2024-12-25T13:00:00Z',
                arrivalTime: null, // Missing time
            },
        };
        
        getTransactionById.mockResolvedValue({ id: '12345' });
        getCetakTiketById.mockResolvedValue(mockTicketData);
        
        await createTicket(req, res);
        
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(res.send).toHaveBeenCalled();
    });
    
    it('should include all departure flight details in the PDF if all data is present', async () => {
        
        const transactionId = '12345';
        const req = mockRequest({params : { transactionId }});
        const res = mockResponse();
        const mockTicketData = {
            order: { bookingCode: 'ABC123', pasengger: [] },
            departureFlight: {
                airplane: {
                    airline: { name: 'Airline A' },
                    airplaneCode: 'A123',
                },
                class: 'Business',
                departureAirport: {
                    city: { name: 'City A' },
                    name: 'Airport A',
                },
                departureDate: '2024-12-25T10:00:00Z',
                departureTime: '10:00:00',
                departureTerminal: { name: 'Terminal 1' },
                destinationAirport: {
                    city: { name: 'City B' },
                    name: 'Airport B',
                },
                arrivalDate: '2024-12-25T13:00:00Z',
                arrivalTime: '13:00:00',
            },
        };
        
        getTransactionById.mockResolvedValue({ id: '12345' });
        getCetakTiketById.mockResolvedValue(mockTicketData);
        
        await createTicket(req, res);
        
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(res.send).toHaveBeenCalled();
    });
    
    
    it('should not include departure flight details if departureFlight is null', async () => {
        const transactionId = '12345';
        const req = mockRequest({params : { transactionId }});
        const res = mockResponse();
        
        const mockTicketData = {
            order: { bookingCode: 'ABC123', pasengger: [] },
            departureFlight: null, // No departure flight
        };
        
        getTransactionById.mockResolvedValue({ id: '12345' });
        getCetakTiketById.mockResolvedValue(mockTicketData);
        
        await createTicket(req, res);
        
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(res.send).toHaveBeenCalled();
    });
    
    it('should include passenger details if ticketData.order.pasengger is an array', async () => {
        
        const transactionId = '12345';
        const req = mockRequest({params : { transactionId }});
        const res = mockResponse();
        const mockTicketData = {
            order: {
                
                bookingCode: 'ABC123',
                pasengger: [
                    {
                        title: 'Mr',
                        fullname: 'John',
                        familyName: 'Doe',
                        passengerType: 'Adult',
                        seat: { code: '12A' },
                    },
                    {
                        title: 'Mrs',
                        fullname: 'Jane',
                        familyName: 'Smith',
                        passengerType: 'Child',
                        seat: null, // Missing seat assignment
                    },
                ],
            },
        };
        
        getTransactionById.mockResolvedValue({ id: '12345' });
        getCetakTiketById.mockResolvedValue(mockTicketData);
        
        await createTicket(req, res);
        
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(res.send).toHaveBeenCalled();
    });
});

    