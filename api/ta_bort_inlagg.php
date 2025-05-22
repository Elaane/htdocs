<?php
require 'db.php';
$id = $_GET['id'];

$stmt = $pdo->prepare("DELETE FROM inlägg WHERE id = ?");
$stmt->execute([$id]);

echo "Inlägget togs bort. <a href='index.php'>Tillbaka</a>";
