const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  app.get('/budget', (req, res) => {
    const filePath = path.join(__dirname, 'budget.json');
  
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading budget.json:', err);
        return res.status(500).json({ error: 'Failed to read budget data' });
      }
  
      try {
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
        res.status(500).json({ error: 'Invalid JSON format in budget.json' });
      }
    });
  });

app.listen(port, () => {
console.log('API served at http://localhost:3000');
});