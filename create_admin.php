<?php
require_once 'db_config.php';

try {
    // Generate password hash
    $password = "admin123";
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Check if admin user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute(['admin']);

    if ($stmt->fetch()) {
        // Update existing admin password
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
        $stmt->execute([$hashed_password, 'admin']);
        echo "Admin password updated successfully!";
    } else {
        // Create new admin user
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
        $stmt->execute(['admin', $hashed_password, 'admin']);
        echo "Admin user created successfully!";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>