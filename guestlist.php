
<?php
$servername = "localhost";
$username = "root";
$password = ""; // Lämna tomt om du inte har satt ett lösenord
$dbname = "your_database";

// Anslut till databasen
$conn = new mysqli($servername, $username, $password, $dbname);

// Kontrollera anslutning
if ($conn->connect_error) {
    die("Kunde inte ansluta till databasen: " . $conn->connect_error);
}

// Hämta data från formuläret
$name = $conn->real_escape_string($_POST["name"]);
$email = $conn->real_escape_string($_POST["email"]);
$homepage = $conn->real_escape_string($_POST["homepage"]);
$comment = $conn->real_escape_string($_POST["comment"]);

// Lägg till inlägget i databasen
$sql = "INSERT INTO Guestbook (name, email, homepage, comment, time) VALUES ('$name', '$email', '$homepage', '$comment', NOW())";

if ($conn->query($sql) === TRUE) {
    echo "Inlägget har lagts till i gästboken!<br><br>";
} else {
    echo "Ett fel uppstod: " . $conn->error;
}

// Visa tidigare inlägg
echo "<h2>Tidigare inlägg</h2>";

$sql = "SELECT name, email, homepage, comment, time FROM Guestbook ORDER BY time DESC";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "<div>";
        echo "<p><strong>Namn:</strong> " . htmlspecialchars($row['name']) . "</p>";
        echo "<p><strong>E-post:</strong> " . htmlspecialchars($row['email']) . "</p>";
        if (!empty($row['homepage'])) {
            echo "<p><strong>Hemsida:</strong> <a href='" . htmlspecialchars($row['homepage']) . "'>" . htmlspecialchars($row['homepage']) . "</a></p>";
        }
        echo "<p><strong>Kommentar:</strong> " . nl2br(htmlspecialchars($row['comment'])) . "</p>";
        echo "<p><em>" . $row['time'] . "</em></p>";
        echo "<hr></div>";
    }
} else {
    echo "Inga inlägg har gjorts ännu.";
}

$conn->close();
?>
