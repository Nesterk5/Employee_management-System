<?php
session_start();
require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $_SESSION['error'] = 'Please enter both username and password';
        header('Location: login.php');
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            header('Location: index.php');
            exit;
        } else {
            $_SESSION['error'] = 'Invalid username or password';
            header('Location: login.php');
            exit;
        }
    } catch (PDOException $e) {
        $_SESSION['error'] = 'Login failed. Please try again.';
        header('Location: login.php');
        exit;
    }
} else {
    header('Location: login.php');
    exit;
}
?>