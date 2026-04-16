const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function test() {
    try {
        console.log('PDFParse exists:', !!PDFParse);
        // We don't have a real PDF buffer here to test easily without a file, 
        // but we can check if we can instantiate it.
        const parser = new PDFParse({ data: Buffer.from('%PDF-1.4...') });
        console.log('Parser instantiated');
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
