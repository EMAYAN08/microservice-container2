const express = require('express');
const csv = require('csv-parser'); // REFERENCE: https://www.npmjs.com/package/csv-parser
const fs = require('fs'); // REFERENCE: https://www.npmjs.com/package/csv-parser
const path = require('path');

const app = express();
app.use(express.json());

// Endpoint to handle calculate requests
// Update the /calculate endpoint in container2/index.js
app.post('/calculate', (req, res) => {
  const { file, product } = req.body;

  if (!file || !product) {
    return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
  }

  const filePath = path.join('/Emayan_PV_dir', file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ file, error: 'File not found.' });
  }

  let headerFound = false;
  let fileError = false;
  const rows = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('headers', (headers) => {
      if (!headers.includes('product') || !headers.includes('amount')) {
        fileError = true;
      }
      headerFound = true;
    })
    .on('data', (row) => {
      if (headerFound) {
        if (!row.product || !row.amount || row.product.includes(',') || row.amount.includes(',')) {
          fileError = true;
        } else {
          rows.push(row);
        }
      }
    })
    .on('end', () => {
      if (!headerFound || fileError) {
        return res.status(200).json({ file, error: 'Input file not in CSV format.' });
      }

      const sum = rows
        .filter((row) => row.product === product)
        .reduce((total, row) => total + parseInt(row.amount), 0);

      return res.json({ file, sum });
    })
    .on('error', () => {
      return res.status(200).json({ file, error: 'Input file not in CSV format.' });
    });
});



const PORT = 7000;
app.listen(PORT, () => {
  console.log(`Container 2 listening on port ${PORT}`); //REFERENCE: https://www.w3schools.com/nodejs/met_server_listen.asp
});
