require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// Databasanslutning
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

// API-dokumentation på root
app.get('/', (req, res) => {
    res.send(`
        <h1>API Documentation</h1>
        <ul>
            <li><b>GET /users</b>: Get all users.</li>
            <li><b>POST /users</b>: Add a new user. (Body: { "name": "John", "email": "john@example.com" })</li>
            <li><b>GET /users/:id</b>: Get a single user by ID.</li>
            <li><b>PUT /users/:id</b>: Update a user by ID. (Body: { "name": "New Name", "email": "new@example.com" })</li>
            <li><b>DELETE /users/:id</b>: Delete a user by ID.</li>
        </ul>
    `);
});

// Routes
// Get all users
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Get a single user
app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length === 0) {
            return res.status(404).send('User not found');
        }
        res.json(results[0]);
    });
});

// Add a new user
app.post('/users', (req, res) => {
    const { name, email } = req.body;
    db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).json({ id: results.insertId, name, email });
    });
});

// Update a user
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('User updated');
    });
});

// Delete a user
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('User deleted');
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
