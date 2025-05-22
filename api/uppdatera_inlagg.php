<?php
require 'db.php';
$id = $_GET['id'];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nyText = $_POST['text'];
    $stmt = $pdo->prepare("UPDATE inlägg SET text = ? WHERE id = ?");
    $stmt->execute([$nyText, $id]);
    echo "Inlägget uppdaterades! <a href='index.php'>Tillbaka</a>";
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM inlägg WHERE id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();
?>
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <title>Uppdatera Inlägg</title>
</head>
<body>
    <h1>Redigera inlägg</h1>
    <form method="POST">
        Text:<br>
        <textarea name="text" required><?= htmlspecialchars($row['text']) ?></textarea><br>
        <button type="submit">Uppdatera</button>
    </form>
</body>
</html>
