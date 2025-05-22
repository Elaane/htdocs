<?php
include('config.php'); // Din databasanslutning

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['lösernord'];
    $name = $_POST['name'];

    // Hasha lösenordet
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Förbered SQL-fråga för att lägga till användaren
    $stmt = $conn->prepare("INSERT INTO users (username, p_hash, name) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $password_hash, $name);
    $stmt->execute();

    echo "Registrering lyckades!";
}
?>

<form action="register.php" method="post">
    <label for="username">Användarnamn:</label>
    <input type="text" name="username" required><br>

    <label for="password">Lösenord:</label>
    <input type="password" name="password" required><br>

    <label for="name">Namn:</label>
    <input type="text" name="name" required><br>

    <input type="submit" value="Registrera">
</form>
