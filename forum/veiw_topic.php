<?php
session_start();
include('config.php');

$topic_id = $_GET['id'];
$stmt = $conn->prepare("SELECT * FROM posts WHERE topic_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $topic_id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    echo "<div>";
    echo "<strong>{$row['username']}:</strong> " . htmlspecialchars($row["content"]) . "<br>";
    echo "<small><em>Postad den: " . $row["created_at"] . "</em></small>";
    echo "</div>";
}
?>
