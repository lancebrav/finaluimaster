<?php
/**
 * Central admin session security helpers.
 */

const ADMIN_SESSION_INACTIVITY_TIMEOUT = 1800; // 30 minutes
const ADMIN_SESSION_MAX_LIFETIME = 28800;      // 8 hours absolute cap

function init_secure_session(): void
{
    if (session_status() !== PHP_SESSION_NONE) {
        return;
    }

    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443);

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_name('BRGY663_ADMIN');
    session_start();
}

function send_no_cache_headers(): void
{
    if (headers_sent()) {
        return;
    }

    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, private');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
}

function build_session_fingerprint(): string
{
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';

    return hash('sha256', $userAgent . '|' . $remoteAddr);
}

function bind_admin_session(int $userId, string $username): void
{
    session_regenerate_id(true);

    $_SESSION['admin'] = true;
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    $_SESSION['login_time'] = time();
    $_SESSION['last_activity'] = time();
    $_SESSION['fingerprint'] = build_session_fingerprint();
}

function refresh_session_activity(): void
{
    $_SESSION['last_activity'] = time();
}

function is_admin_session_valid(): bool
{
    if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
        return false;
    }

    if (!isset($_SESSION['user_id'], $_SESSION['username'], $_SESSION['fingerprint'])) {
        return false;
    }

    if (!hash_equals((string) $_SESSION['fingerprint'], build_session_fingerprint())) {
        return false;
    }

    $now = time();

    if (isset($_SESSION['login_time']) && ($now - (int) $_SESSION['login_time']) > ADMIN_SESSION_MAX_LIFETIME) {
        return false;
    }

    if (
        isset($_SESSION['last_activity'])
        && ($now - (int) $_SESSION['last_activity']) > ADMIN_SESSION_INACTIVITY_TIMEOUT
    ) {
        return false;
    }

    return true;
}

function destroy_admin_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        init_secure_session();
    }

    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }

    session_destroy();
}

function redirect_to_login(string $reason = ''): void
{
    send_no_cache_headers();

    if ($reason !== '') {
        header('Location: ../pages/login.html?reason=' . urlencode($reason));
    } else {
        header('Location: ../pages/login.html');
    }

    exit;
}

function get_login_throttle_state(): array
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = 'login_throttle_' . hash('sha256', $ip);

    if (!isset($_SESSION[$key]) || !is_array($_SESSION[$key])) {
        return ['count' => 0, 'lock_until' => 0];
    }

    return $_SESSION[$key];
}

function register_failed_login_attempt(): void
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = 'login_throttle_' . hash('sha256', $ip);
    $state = get_login_throttle_state();

    $state['count'] = (int) ($state['count'] ?? 0) + 1;

    if ($state['count'] >= 5) {
        $state['lock_until'] = time() + 600; // 10 minutes
        $state['count'] = 0;
    }

    $_SESSION[$key] = $state;
}

function clear_login_throttle(): void
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = 'login_throttle_' . hash('sha256', $ip);
    unset($_SESSION[$key]);
}

function is_login_throttled(): ?string
{
    $state = get_login_throttle_state();
    $lockUntil = (int) ($state['lock_until'] ?? 0);

    if ($lockUntil > time()) {
        $minutes = (int) ceil(($lockUntil - time()) / 60);
        return "Too many failed attempts. Try again in {$minutes} minute(s).";
    }

    return null;
}

?>
