const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const app = express();
app.use(express.json());

// Endpoint to handle calculate requests
app.post('/calculate', (req, res) => {
  const { file, product } = req.body;

  if (!file) {
    return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
  }

  // Get the absolute path of the file
  const filePath = path.join('/Emayan_PV_dir', file);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ file, error: 'File not found.' });
  }

  let headerFound = false; // Variable to track if the header is found
  let fileError = false; // Variable to track if any error is found

  const rows = [];

  fs.createReadStream(filePath)
    .pipe(csv.parse({ headers: true, trim: true })) // Parse CSV with headers and trim whitespace
    .on('error', () => {
      return res.status(200).json({ file, error: 'Input file not in CSV format.' });
    })
    .on('data', (row) => {
      if (!headerFound) {
        // Check if the header is present
        if (!row.product || !row.amount) {
          headerFound = true; // Set headerFound to true to prevent sending multiple responses
          fileError = true;
        }
        headerFound = true;
      } else {
        // Check if any row is missing a value
        if (!row.product || !row.amount) {
          fileError = true;
        }
      }

      rows.push(row);
    })
    .on('end', () => {
      if (!headerFound || fileError) {
        return res.status(200).json({ file, error: 'Input file not in CSV format.' });
      }

      const sum = rows
        .filter((row) => row.product === product)
        .reduce((total, row) => total + parseInt(row.amount), 0);

      return res.json({ file, sum: sum.toString() });
    });
});

const PORT = 7000;
app.listen(PORT, () => {
  console.log(`Container 2 listening on port ${PORT}`);
});

