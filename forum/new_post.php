<?php
session_start();
include('config.php');

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_SESSION['user_id'])) {
    $content = $_POST["content"];
    $topic_id = $_POST["topic_id"];
    $user_id = $_SESSION['user_id'];

    $stmt = $conn->prepare("INSERT INTO posts (content, user_id, topic_id) VALUES (?, ?, ?)");
    $stmt->bind_param("sii", $content, $user_id, $topic_id);
    $stmt->execute();
    echo "Inlägg publicerat!";
}
?>

<form action="new_post.php" method="post">
    <textarea name="content" required></textarea><br>
    <input type="hidden" name="topic_id" value="1"> 
    <input type="submit" value="Skriv inlägg">
</form>
