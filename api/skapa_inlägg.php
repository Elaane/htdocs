<?php require 'db.php'; ?>
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <title>Skapa Inlägg</title>
</head>
<body>
    <h1>Skapa ett nytt inlägg</h1>
    <form method="POST">
        Användarnamn: <input type="text" name="användarnamn" required><br>
        Ämne ID: <input type="number" name="ämne_id" required><br>
        Text:<br>
        <textarea name="text" required></textarea><br>
        <button type="submit">Skicka</button>
    </form>

    <?php
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $text = $_POST['text'];
        $användarnamn = $_POST['användarnamn'];
        $ämne_id = $_POST['ämne_id'];

        $stmt = $pdo->prepare("INSERT INTO inlägg (text, användarnamn, ämne_id, tidpunkt) VALUES (?, ?, ?, NOW())");
        $stmt->execute([$text, $användarnamn, $ämne_id]);
        echo "Inlägget sparades! <a href='index.php'>Tillbaka</a>";
    }
    ?>
</body>
</html>
