<?php require 'db.php'; ?>
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <title>Forum</title>
</head>
<body>
    <h1>Inlägg</h1>
    <a href="skapa_inlagg.php">Skapa nytt inlägg</a>
    <ul>
        <?php
        $stmt = $pdo->query("SELECT * FROM inlägg ORDER BY tidpunkt DESC");
        while ($row = $stmt->fetch()) {
            echo "<li>";
            echo "<strong>{$row['användarnamn']}</strong>: " . htmlspecialchars($row['text']) . "<br>";
            echo "<a href='uppdatera_inlagg.php?id={$row['id']}'>Redigera</a> | ";
            echo "<a href='ta_bort_inlagg.php?id={$row['id']}'>Ta bort</a>";
            echo "</li>";
        }
        ?>
    </ul>
</body>
</html>
