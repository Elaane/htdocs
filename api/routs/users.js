const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../db");


router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        
        const [result] = await db.query(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, hashedPassword]
        );

        res.status(201).json({ id: result.insertId, username });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});


router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM users");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

       
        const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = rows[0];


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

   
        res.json({ id: user.id, username: user.username });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
