const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM posts");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM posts WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Post not found" });
        res.json(rows[0]);
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

module.exports = router;