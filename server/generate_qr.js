const QRCode = require('qrcode');
const stands = require('./data/stands');

const BASE_URL = 'http://localhost:5173'; // Default Vite port

async function generateQRCodes() {
  console.log('Generating QR Codes for Taxi Stands...\n');

  for (const stand of stands) {
    // URL format: BASE_URL?standId=ID
    const url = `${BASE_URL}/?standId=${stand.id}`;
    
    console.log(`--- ${stand.name} (${stand.id}) ---`);
    console.log(`URL: ${url}`);
    
    try {
      // Print QR to terminal for easy testing
      const qrString = await QRCode.toString(url, { type: 'terminal' });
      console.log(qrString);
    } catch (err) {
      console.error(err);
    }
    console.log('\n');
  }
}

generateQRCodes();
