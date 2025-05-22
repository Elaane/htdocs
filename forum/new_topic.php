<?php
session_start();
include('config.php'); // Databasanslutning

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_SESSION['user_id'])) {
    $title = $_POST["title"];
    $user_id = $_SESSION['user_id'];

    $stmt = $conn->prepare("INSERT INTO topics (title, user_id) VALUES (?, ?)");
    $stmt->bind_param("si", $title, $user_id);
    $stmt->execute();
    echo "Tråden skapades!";
}
?>

<form action="new_topic.php" method="post">
    <h2>Skapa ny tråd</h2>
    <label for="title">Rubrik:</label>
    <input type="text" name="title" required><br>
    <input type="submit" value="Skapa tråd">
</form>
