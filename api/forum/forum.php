
<?php
session_start();

// Anslut till databasen
try {
    $pdo = new PDO("mysql:host=localhost;dbname=forum;charset=utf8mb4", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Kunde inte ansluta till databasen: " . $e->getMessage());
}

// Hantera registrering
if (isset($_POST['register'])) {
    $username = $_POST['username'];
    $email = $_POST['email'];          // Lägg till e-post från formuläret
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO users (username, lösenord, epost, regestreringstid) VALUES (?, ?, ?, NOW())");
    try {
        $stmt->execute([$username, $password, $email]);
        echo "Registrerad! Logga in.";
    } catch (PDOException $e) {
        // T.ex. om användarnamn eller e-post redan finns
        echo "Registrering misslyckades: " . $e->getMessage();
    }
}

// Hantera inloggning
if (isset($_POST['login'])) {
    $loginInput = $_POST['username']; // kan vara användarnamn eller e-post
    $password = $_POST['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR epost = ?");
    $stmt->execute([$loginInput, $loginInput]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['lösenord'])) {
        $_SESSION['user_id'] = $user['id'];
        echo "Inloggad!";
    } else {
        echo "Felaktigt användarnamn, e-post eller lösenord.";
    }
}

// Logga ut
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: forum.php");
    exit;
}

// Hantera ny tråd
if (isset($_POST['new_topic']) && isset($_SESSION['user_id'])) {
    $title = $_POST['title'];
    $stmt = $pdo->prepare("INSERT INTO ämne (titel, skapad_av, skapad_kl) VALUES (?, ?, NOW())");
    $stmt->execute([$title, $_SESSION['user_id']]);
}

// Hantera nytt inlägg
if (isset($_POST['new_post']) && isset($_SESSION['user_id'])) {
    $topic_id = $_POST['topic_id'];
    $content = $_POST['content'];
    $stmt = $pdo->prepare("INSERT INTO inlägg (ämne_id, users_id, innehål, skapad_kl) VALUES (?, ?, ?, NOW())");
    $stmt->execute([$topic_id, $_SESSION['user_id'], $content]);
}


$pdo = new PDO("mysql:host=localhost;dbname=forum;charset=utf8mb4", "root", "");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if (isset($_GET['action']) && $_GET['action'] === 'show_all_posts') {

    // Hämta alla inlägg med tråd-titel och användarnamn
    $stmt = $pdo->prepare("
        SELECT i.innehål, i.skapad_kl, u.username, ä.titel
        FROM inlägg i
        JOIN users u ON i.users_id = u.id
        JOIN ämne ä ON i.ämne_id = ä.id
        ORDER BY i.skapad_kl DESC
    ");
    $stmt->execute();
    $posts = $stmt->fetchAll();

    echo "<h2>Alla inlägg i forumet</h2>";

    foreach ($posts as $post) {
        echo "<div style='border:1px solid #ccc; padding:10px; margin-bottom:10px;'>";
        echo "<h3>" . htmlspecialchars($post['titel']) . "</h3>";
        echo "<p><strong>" . htmlspecialchars($post['username']) . "</strong> skrev kl " . $post['skapad_kl'] . ":</p>";
        echo "<p>" . nl2br(htmlspecialchars($post['innehål'])) . "</p>";
        echo "</div>";
    }
}


// Inkludera din HTML-layout (forum_layout.html)
include("forum_layout.html");
?>

