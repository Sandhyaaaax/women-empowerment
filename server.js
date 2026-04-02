const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./safeping.db', (err) => {
  if (err) {
    console.error("Failed to connect to database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    // Create tracking table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS journeys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      currentLocation TEXT NOT NULL,
      destination TEXT NOT NULL,
      vehicleNumber TEXT NOT NULL,
      driverName TEXT,
      shareContacts TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// POST endpoint to register a new journey
app.post('/api/track', (req, res) => {
  const { name, currentLocation, destination, vehicleNumber, driverName, shareContacts } = req.body;
  
  if (!name || !currentLocation || !destination || !vehicleNumber || !shareContacts) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const sql = `INSERT INTO journeys (name, currentLocation, destination, vehicleNumber, driverName, shareContacts) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [name, currentLocation, destination, vehicleNumber, driverName, shareContacts];

  db.run(sql, params, function(err) {
    if (err) {
      console.error("Error inserting data:", err.message);
      return res.status(500).json({ error: "Failed to register journey." });
    }
    console.log(`New journey registered for ${name} at ID ${this.lastID}`);
    res.status(201).json({ message: "Journey successfully registered!", id: this.lastID });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`SafePing Backend server running at http://localhost:${port}`);
  console.log(`Make sure you run "npm install express cors sqlite3" to install required dependencies.`);
});
