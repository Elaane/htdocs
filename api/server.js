const express = require("express");
const app = express();
app.listen(3000);
console.log("🚀 Servern körs på port 3000");

const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "hemligkod123"; 

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "api", 
});

app.use(express.json());

// Skapa anvendare
app.post("/users", async (req, res) => {
  try {
    const tillåtnaFält = ["firstname", "lastname", "userId", "password"];
    if (!req.body.userId) {
      return res.status(400).send("userId krävs");
    }

    for (let fält in req.body) {
      if (!tillåtnaFält.includes(fält)) {
        return res.status(400).send("Otillåtet fält: " + fält);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);

    const sql = `INSERT INTO users (firstname, lastname, userId, password) VALUES (?, ?, ?, ?)`;
    db.query(
      sql,
      [req.body.firstname, req.body.lastname, req.body.userId, hash],
      (err, result) => {
        if (err) throw err;
        res.send({
          id: result.insertId,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          userId: req.body.userId,
        });
      }
    );
  } catch (err) {
    res.status(500).send("Fel: " + err.message);
  }
});

// Logga in
app.post("/login", (req, res) => {
  const sql = `SELECT * FROM users WHERE userId = ?`;

  db.query(sql, [req.body.userId], async (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.status(401).json({ error: "Felaktiga uppgifter" });
    }

    const lösenStämmer = await bcrypt.compare(
      req.body.password,
      result[0].password
    );

    if (lösenStämmer) {
      const token = jwt.sign(
        {
          id: result[0].id,
          userId: result[0].userId,
          firstname: result[0].firstname,
          lastname: result[0].lastname,
        },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      res.send({ token });
    } else {
      res.status(401).json({ error: "Felaktiga uppgifter" });
    }
  });
});

// Kontrolera token
function authMiddleware(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Ingen token" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Ogiltig token" });
    req.user = user;
    next();
  });
}

// Uppdatera anvendare
app.put("/users/:id", authMiddleware, (req, res) => {
  const sql = `UPDATE users SET firstname = ?, lastname = ? WHERE id = ?`;
  db.query(
    sql,
    [req.body.firstname, req.body.lastname, req.params.id],
    (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Användare finns inte" });
      }
      res.json({ message: "Uppdaterad!" });
    }
  );
});

// Radera anvandare
app.delete("/users/:id", authMiddleware, (req, res) => {
  const sql = `DELETE FROM users WHERE id = ?`;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) throw err;
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Användare saknas" });
    }
    res.json({ message: "Användare raderad" });
  });
});

// Hämta alla anvendare
app.get("/users", authMiddleware, (req, res) => {
  const sql = `SELECT id, firstname, lastname, userId FROM users`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Hämta en specifik anvandare
app.get("/users/:id", authMiddleware, (req, res) => {
  const sql = `SELECT id, firstname, lastname, userId FROM users WHERE id = ?`;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.status(404).json({ error: "Användare hittades ej" });
    }
    res.json(result[0]);
  });
});
