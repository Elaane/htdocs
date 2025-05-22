<?php
session_start();
include('config.php');

$sql = "SELECT * FROM topics ORDER BY created_at DESC";
$result = $conn->query($sql);

while ($row = $result->fetch_assoc()) {
    echo "<h3><a href='view_topic.php?id={$row['id']}'>{$row['title']}</a></h3>";
}
?>
