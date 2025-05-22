<?php
session_start();
include('config.php'); // Din databasanslutning

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['lösernord'];

    // Hämta användarens lösenord från databasen
    $stmt = $conn->prepare("SELECT id, lösernord_hash FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($id, $password_hash);
    $stmt->fetch();

    // Kontrollera lösenord
    if (password_verify($password, $password_hash)) {
        $_SESSION['user_id'] = $id;
        $_SESSION['username'] = $username;
        header("Location: index.php"); // Om inloggning lyckas
    } else {
        echo "Fel användarnamn eller lösenord.";
    }
}
?>

<form action="login.php" method="post">
    <label for="username">Användarnamn:</label>
    <input type="text" name="username" required><br>

    <label for="password">Lösenord:</label>
    <input type="password" name="password" required><br>

    <input type="submit" value="Logga in">
</form>

