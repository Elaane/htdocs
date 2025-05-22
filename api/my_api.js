const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "dittlösenord",
    database: "forum",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();

const express = require( "express");
const router = express.Router();
const db = require ( "../db");
const bcrypt = require("bcrypt");

// Testa anslutningen
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database!");
    connection.release();
});

// hämta alla ämnen
router.get("/ämnen", async (req, res) =>{
   try {
        const [rows] = await db.query("SELECT * FROM ämne");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
}});

// lägg till nya ämnen
router.post("/ämnen", async (req, res) =>{
    const { title, användarnamn } = req.body;
    if (!titel || !användarnamn) return res.status(400).json({error: "Titel och användarnamn Krävs"});
    try {
        const [result] = await db.query("INSERT INTO ämne (titel, användarnamn) VALUES (?, ?)", [titel, användarnamn]);
        res.status(201).json({ id: result.insertId, titel, användarnamn });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});
   
// hämta inlägg för x ämne
router.get("/inlägg/:ämneId", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM inlägg WHERE ämne_id = ?", [req.params.ämneId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});


// gilla inlägg
router.post("/gilla", async (req, res) => {
    const { inlägg_id, användarnamn } = req.body;
    if (!inlägg_id || !användarnamn) return res.status(400).json({ error: "Fält saknas" });

    try {
        await db.query("INSERT INTO gilla (inlägg_id, användarnamn) VALUES (?, ?)", [inlägg_id, användarnamn]);
        res.json({ message: "Gillat!" });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// Nytt inlägg
router.post("/inlägg", async (req, res) => {
    const { text, användarnamn, ämne_id } = req.body;
    if (!text || !användarnamn || !ämne_id) return res.status(400).json({ error: "Alla fält krävs" });

    try {
        const [result] = await db.query("INSERT INTO inlägg (text, användarnamn, ämne_id, tidpunkt) VALUES (?, ?, ?, NOW())", [text, användarnamn, ämne_id]);
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) return res.status(400).json({ error: "Title and content required" });

        const [result] = await db.query("INSERT INTO posts (title, content) VALUES (?, ?)", [title, content]);
        res.status(201).json({ id: result.insertId, title, content });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) return res.status(400).json({ error: "Title and content required" });

        const [result] = await db.query("UPDATE posts SET title = ?, content = ? WHERE id = ?", [title, content, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Post not found" });

        res.json({ id: req.params.id, title, content });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Post not found" });

        res.json({ message: "Post deleted" });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// Ny användare
router.post("/register", async (req, res) => {
   
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Fält saknas" });

    try {
        const hashed = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed]);
        res.status(201).json({ message: "Registrerad!" });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// logga in
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Fält saknas" });

    try {
        const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0) return res.status(404).json({ error: "Användare finns inte" });

        const match = await bcrypt.compare(password, rows[0].password);
        if (!match) return res.status(401).json({ error: "Fel lösenord" });

        res.json({ message: "Inloggad", användare: { id: rows[0].id, username: rows[0].username } });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});
       
module.exports = router;

