const formatDate = (date) => {
    return new Date(date).toLocaleString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta', // Atur sesuai zona waktu Indonesia
    });
};


const drawSeparator = (doc) => {
    const yPosition = doc.y;
    doc.moveTo(20, yPosition + 10)
       .lineTo(800, yPosition + 10) // Increased the line width for landscape
       .strokeColor('#BDC3C7')
       .lineWidth(1)
       .stroke();
};

const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta', // Atur sesuai zona waktu Indonesia
    });
};

export {
    formatDate,
    formatTime,
    drawSeparator
}