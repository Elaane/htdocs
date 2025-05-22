<?php
$servername = "localhost";
$username = "root";  // Ditt användarnamn för databasen
$password = "";      // Ditt lösenord för databasen
$dbname = "forum";   // Namnet på din databas

// Skapa anslutning
$conn = new mysqli($servername, $username, $password, $dbname);

// Kontrollera anslutning
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
