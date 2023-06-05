const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
// const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

// Endpoint to handle calculate requests
app.post('/calculate', (req, res) => {
  const { file, product } = req.body;

  if (!file || !product) {
    return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
  }

  // Create the absolute path of the file
  const filePath = path.join('/Emayan_PV_dir', file); // Replace "xxxx" with your first name

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ file, error: 'File not found.' });
    }

    let headerFound = false; // Variable to track if the header is found
    let fileError = false; // Variable to track if any error is found

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (!headerFound) {
          // Check if the header is present
          if (!row.product || !row.amount) {
            headerFound = true; // Set headerFound to true to prevent sending multiple responses
            fileError = true;
          }
          headerFound = true;
        } else {
          // Check if any row is missing a comma
          if (!row.product || !row.amount || row.product.includes(',') || row.amount.includes(',')) {
            fileError = true;
          }
        }
      })
      .on('end', () => {
        if (!headerFound || fileError) {
          return res
            .status(200)
            .json({ file, error: 'Input file not in CSV format.' });
        }

        const rows = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            rows.push(row);
          })
          .on('end', () => {
            const sum = rows
              .filter((row) => row.product === product)
              .reduce((total, row) => total + parseInt(row.amount), 0);

            return res.json({ file, sum });
          })
          .on('error', () => {
            return res
              .status(200)
              .json({ file, error: 'Input file not in CSV format.' });
          });
      });
  });
});

const PORT = 7000;
app.listen(PORT, () => {
  console.log(`Container 2 is running on port ${PORT}`);
});
