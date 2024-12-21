import { getCetakTiketById } from "../services/Transaction.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import PDFDocument from 'pdfkit';
import { drawSeparator, formatDate, formatTime } from "../utils/ticketHelpers.js";

const createTicket = asyncWrapper(async (req, res) => {
    const { transactionId } = req.params;
    const ticketData = await getCetakTiketById(transactionId);

    if (!ticketData) {
        return res.status(404).json({
            success: false,
            message: "Transaction not found"
        });
    }
    
    const buffers = [];
    const doc = new PDFDocument({
        size: 'A4', // Changed to A4 landscape
        layout: 'landscape', // Landscape orientation
        margin: 50
    });
    


    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', pdfData.length);
        res.setHeader('Content-Disposition', `attachment; filename=ticket-${ticketData.order.bookingCode}.pdf`);
        res.send(pdfData);
    });

    
    // Header with gradient 
    doc.fontSize(22).font('Times-Bold').fillColor('#f39c12').text('PengenJago', {  align: "center", baseline: "middle",continued: true});
    doc.fontSize(14).text('\nDengan E-Ticket Jadi Lebih Mudah', {align:"center"});
    drawSeparator(doc);

    doc.moveDown(2);
    doc.fontSize(12).fillColor('#2980b9').text('Booking Code:', { align: 'right' });
    doc.fontSize(12).fillColor('#34495e').text(`${ticketData.order?.bookingCode || 'N/A'}`, { align: 'right' });

    // Flight Info
    drawSeparator(doc);
    doc.moveDown(2);
    doc.fontSize(14).fillColor('#2980b9').text('Departure Flight', { align: 'center' });
    drawSeparator(doc);


    const departureFlight = ticketData.departureFlight;
    if (departureFlight) {
        doc.moveDown(2).fontSize(11).fillColor('#7f8c8d').text(`Airline: ${departureFlight.airplane?.airline?.name || 'Unknown'}`);
        doc.text(`Flight: ${departureFlight.airplane?.airplaneCode || 'Unknown'}`);
        doc.text(`Class: ${departureFlight.class || 'Unknown'}`);
        doc.moveDown().fontSize(13).text('Departure:', {  color: '#2c3e50' });

        // Departure info with futuristic typography
        doc.fontSize(11).fillColor('#7f8c8d').text(`Airport: ${departureFlight.departureAirport?.city?.name || 'Unknown'} (${departureFlight.departureAirport?.name || 'Unknown'})`);
        doc.text(`Date: ${formatDate(departureFlight.departureDate)}`);
        doc.text(`Time: ${departureFlight.departureTime ? formatTime(departureFlight.departureDate) : 'Unknown'} WIB`);
        if (departureFlight.departureTerminal?.name) {
            doc.text(`Terminal: ${departureFlight.departureTerminal.name}`);
        }
        // Arrival info with futuristic style
        doc.moveDown().fontSize(13).text('Arrival:', {  color: '#2c3e50' });
        doc.fontSize(11).fillColor('#7f8c8d').text(`Airport: ${departureFlight.destinationAirport?.city?.name || 'Unknown'} (${departureFlight.destinationAirport?.name || 'Unknown'})`);
        doc.text(`Date: ${formatDate(departureFlight.arrivalDate)}`);
        doc.text(`Time: ${departureFlight.arrivalTime ? formatTime(departureFlight.departureDate) : 'Unknown'} WIB`);       
        drawSeparator(doc);
    }

    // Return Flight with elegant design
    if (ticketData.returnFlight) {
        drawSeparator(doc);
        doc.moveDown(2);
        doc.fontSize(14).fillColor('#f39c12').text('Return Flight', { align: 'center' });
        drawSeparator(doc);

        const returnFlight = ticketData.returnFlight;
        doc.moveDown(2);
        doc.fontSize(11).fillColor('#7f8c8d').text(`Airline: ${returnFlight.airplane?.airline?.name || 'Unknown'}`);
        doc.text(`Flight: ${returnFlight.airplane?.airplaneCode || 'Unknown'}`);
        doc.text(`Class: ${returnFlight.class || 'Unknown'}`);
        doc.moveDown();
        doc.fontSize(13).text('Departure:', {  color: '#2c3e50' });
        doc.fontSize(11).fillColor('#7f8c8d').text(`Airport: ${returnFlight.departureAirport?.city?.name || 'Unknown'} (${returnFlight.departureAirport?.name || 'Unknown'})`);
        doc.text(`Date: ${formatDate(returnFlight.departureDate)}`);
        doc.text(`Time: ${returnFlight.departureTime ? formatTime(returnFlight.departureDate) : 'Unknown'} WIB`);  
        if (returnFlight.departureTerminal?.name) {
            doc.text(`Terminal: ${returnFlight.departureTerminal.name}`);
        }
        
        // Return Flight Arrival
        doc.moveDown().fontSize(13).text('Arrival:', { color: '#2c3e50' });
        doc.fontSize(11).fillColor('#7f8c8d').text(`Airport: ${returnFlight.destinationAirport?.city?.name || 'Unknown'} (${returnFlight.destinationAirport?.name || 'Unknown'})`);
        doc.text(`Date: ${formatDate(returnFlight.arrivalDate)}`);
        doc.text(`Time: ${returnFlight.arrivalTime ? formatTime(returnFlight.arrivalDate) : 'Unknown'} WIB`);  
        
        // Display Seat Information for Return Flight with glowing style
        if (returnFlight.pasengger && Array.isArray(returnFlight.pasengger)) {
            doc.moveDown();
            doc.fontSize(11).fillColor('#2c3e50').text('Return Flight Passenger Seats:', { underline: true });
            returnFlight.pasengger.forEach((passenger, index) => {
                doc.moveDown();
                doc.fontSize(11).fillColor('#7f8c8d').text(`${index + 1}. ${passenger?.title}. ${passenger?.fullname} ${passenger?.familyName}`).text(`Seat: ${passenger?.seat?.code || 'Not assigned'}`);
            });
        }

        drawSeparator(doc);
    }

    // Passenger Info - Modern table style
    drawSeparator(doc);
    doc.moveDown(2);
    doc.fontSize(14).fillColor('#2c3e50').text('Passenger Details:', );
    if (ticketData.order?.pasengger && Array.isArray(ticketData.order.pasengger)) {
        ticketData.order.pasengger.forEach((passenger, index) => {
            doc.moveDown();
            doc.fontSize(11).fillColor('#7f8c8d').text(`${index + 1}. ${passenger?.title}. ${passenger?.fullname} ${passenger?.familyName}`);
            doc.text(`Type: ${passenger?.passengerType || 'Unknown'}`);
            doc.text(`Seat: ${passenger?.seat?.code || 'Not assigned'}`);
        });
    }

    drawSeparator(doc);

    // Baggage Info with background for section
    doc.moveDown(2);
    doc.fontSize(14).fillColor('#2c3e50').text('Baggage Information:');
    if (departureFlight && departureFlight.airplane) {
        doc.fontSize(11).fillColor('#7f8c8d').text(`Checked Baggage: ${departureFlight.airplane.baggage || 'N/A'} kg`);
        doc.fontSize(11).fillColor('#7f8c8d').text(`Cabin Baggage: ${departureFlight.airplane.cabinBaggage || 'N/A'} kg`);
    }

    drawSeparator(doc);

    // Footer with rounded box
    doc.moveDown(2);
    doc.fontSize(13).fillColor('#2c3e50').text('Important Notes:');
    doc.fontSize(10).fillColor('#7f8c8d').text('1. Please arrive at the airport at least 2 hours before departure');
    doc.fontSize(10).fillColor('#7f8c8d').text('2. Present this e-ticket along with valid identification at check-in');
    doc.fontSize(10).fillColor('#7f8c8d').text('3. All times shown are in local airport time');

    drawSeparator(doc)
    doc.end();
});


export { createTicket };
