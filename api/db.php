<?php
$host = 'localhost';
$db   = 'forum';
$user = 'root';
$pass = 'dittlösenord'; // byt till ditt riktiga lösenord

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Databasfel: " . $e->getMessage());
}
?>
