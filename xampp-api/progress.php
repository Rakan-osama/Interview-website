<?php
declare(strict_types=1);

// Local-only API used by the Vinext development server (normally localhost:5173).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin) !== 1) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Origin is not allowed']);
    exit;
}

if ($origin !== '') {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $pdo = new PDO(
        'mysql:host=127.0.0.1;port=3306;dbname=interview_website;charset=utf8mb4',
        'root',
        '',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $statement = $pdo->prepare('SELECT progress_json, updated_at FROM user_progress WHERE profile_id = ?');
        $statement->execute(['default']);
        $row = $statement->fetch();

        // Keep the stored JSON document verbatim so empty JavaScript objects remain
        // objects (PHP otherwise re-encodes an empty associative array as []).
        $progressJson = $row ? $row['progress_json'] : 'null';
        $updatedAtJson = json_encode($row['updated_at'] ?? null, JSON_THROW_ON_ERROR);
        echo '{"progress":' . $progressJson . ',"updatedAt":' . $updatedAtJson . '}';
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $body = file_get_contents('php://input');
        if ($body === false || strlen($body) > 5 * 1024 * 1024) {
            throw new InvalidArgumentException('Request body is missing or too large');
        }

        $payload = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        $progress = $payload['progress'] ?? null;
        if (!is_array($progress)
            || !isset($progress['attempts'], $progress['drafts'], $progress['last'], $progress['bookmarks'])
            || !is_array($progress['attempts'])
            || !is_array($progress['drafts'])
            || !is_string($progress['last'])
            || !is_array($progress['bookmarks'])) {
            throw new InvalidArgumentException('Invalid progress document');
        }

        // attempts and drafts are JavaScript maps, not lists. Preserve their
        // shape when either map is empty so the client-side validator accepts it.
        if ($progress['attempts'] === []) $progress['attempts'] = (object) [];
        if ($progress['drafts'] === []) $progress['drafts'] = (object) [];

        $json = json_encode($progress, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $statement = $pdo->prepare(
            'INSERT INTO user_progress (profile_id, progress_json) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE progress_json = VALUES(progress_json), updated_at = CURRENT_TIMESTAMP'
        );
        $statement->execute(['default', $json]);

        echo json_encode(['saved' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (InvalidArgumentException | JsonException $error) {
    http_response_code(400);
    echo json_encode(['error' => $error->getMessage()]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database API is unavailable']);
}
