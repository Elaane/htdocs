const express = require("express");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(helmet());  // Säkerhetsheaders
app.use(cors());    // Tillåt CORS - justera vid behov

const JWT_SECRET = "din_superhemliga_jwt_nyckel"; // Byt till miljövariabel i produktion

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "forum",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
const db = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1); // Avsluta appen om db ej fungerar
  }
  console.log("Connected to MySQL database!");
  connection.release();
});

// Middleware för att verifiera JWT-token och skydda routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ error: "Token saknas" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token ogiltig" });
    req.user = user;
    next();
  });
}

// REGISTER med validering och hashning
app.post(
  "/register",
  [
    body("username").isLength({ min: 3 }),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;

    try {
      const [existingUser] = await db.query(
        "SELECT id FROM users WHERE username = ?",
        [username]
      );
      if (existingUser.length > 0)
        return res.status(409).json({ error: "Användarnamn upptaget" });

      const hashed = await bcrypt.hash(password, 10);
      await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [
        username,
        hashed,
      ]);
      res.status(201).json({ message: "Registrerad!" });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// LOGIN och JWT-token generering
app.post(
  "/login",
  [
    body("username").notEmpty(),
    body("password").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
        username,
      ]);
      if (rows.length === 0)
        return res.status(404).json({ error: "Användare finns inte" });

      const match = await bcrypt.compare(password, rows[0].password);
      if (!match) return res.status(401).json({ error: "Fel lösenord" });

      // Skapa JWT-token
      const token = jwt.sign(
        { id: rows[0].id, username: rows[0].username },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.json({ message: "Inloggad", token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// EXEMPEL: skyddad route - hämta egna inlägg (kräver token)
app.get("/mina-inlägg", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM inlägg WHERE users_id = ?", [
      req.user.id,
    ]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Hämta alla ämnen 
app.get("/ämnen", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM ämne");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching ämnen:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Lägg till ämne token
app.post(
  "/ämnen",
  authenticateToken,
  [
    body("titel").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { titel } = req.body;

    try {
      const [result] = await db.query(
        "INSERT INTO ämne (titel, användarnamn) VALUES (?, ?)",
        [titel, req.user.username]
      );
      res.status(201).json({ id: result.insertId, titel, användarnamn: req.user.username });
    } catch (error) {
      console.error("Error creating ämne:", error);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// Lägg till inlägg (kräver token)
app.post(
  "/inlägg",
  authenticateToken,
  [
    body("text").notEmpty(),
    body("ämne_id").isInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { text, ämne_id } = req.body;

    try {
      const [result] = await db.query(
        "INSERT INTO inlägg (innehål, users_id, ämne_id, skapad_kl) VALUES (?, ?, ?, NOW())",
        [text, req.user.id, ämne_id]
      );
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      console.error("Error adding inlägg:", error);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// Gilla inlägg (kräver token)
app.post(
  "/gilla",
  authenticateToken,
  [
    body("inlägg_id").isInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { inlägg_id } = req.body;

    try {
      await db.query(
        "INSERT INTO gilla (inlägg_id, användarnamn) VALUES (?, ?)",
        [inlägg_id, req.user.username]
      );
      res.json({ message: "Gillat!" });
    } catch (error) {
      console.error("Error liking inlägg:", error);
      res.status(500).json({ error: "Database error" });
    }
  }
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
