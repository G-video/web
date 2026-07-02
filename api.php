<?php
// ============================================
// GStream - REST API
// ============================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// ===== DATABASE (JSON) =====
const DB_FILE = 'db.json';
const VIDEOS_DIR = 'videos/';

// ===== INIT DATABASE =====
function initDB() {
    if (!file_exists(DB_FILE)) {
        $default = [
            'users' => [],
            'videos' => [
                [
                    'id' => '1',
                    'title' => 'ویدیو نمونه',
                    'description' => 'این یک ویدیو نمونه برای GStream است',
                    'filename' => 'sample.mp4',
                    'thumbnail' => '',
                    'views' => 0,
                    'date' => date('Y-m-d H:i:s'),
                    'user_id' => '1'
                ]
            ]
        ];
        file_put_contents(DB_FILE, json_encode($default, JSON_PRETTY_PRINT));
    }
}

// ===== READ DB =====
function getDB() {
    initDB();
    return json_decode(file_get_contents(DB_FILE), true);
}

// ===== WRITE DB =====
function saveDB($data) {
    return file_put_contents(DB_FILE, json_encode($data, JSON_PRETTY_PRINT));
}

// ===== GENERATE ID =====
function generateId() {
    return uniqid() . '_' . rand(1000, 9999);
}

// ===== GET VIDEOS =====
function getVideos() {
    $db = getDB();
    return $db['videos'] ?? [];
}

// ===== GET SINGLE VIDEO =====
function getVideo($id) {
    $videos = getVideos();
    foreach ($videos as $video) {
        if ($video['id'] == $id) {
            $video['views'] = ($video['views'] ?? 0) + 1;
            $db = getDB();
            foreach ($db['videos'] as &$v) {
                if ($v['id'] == $id) {
                    $v['views'] = $video['views'];
                    break;
                }
            }
            saveDB($db);
            return $video;
        }
    }
    return null;
}

// ===== REGISTER USER =====
function registerUser($name, $email, $password) {
    $db = getDB();

    foreach ($db['users'] as $user) {
        if ($user['email'] === $email) {
            return ['success' => false, 'message' => 'این ایمیل قبلاً ثبت شده است'];
        }
    }

    $user = [
        'id' => generateId(),
        'name' => $name,
        'email' => $email,
        'password' => password_hash($password, PASSWORD_DEFAULT),
        'created_at' => date('Y-m-d H:i:s')
    ];

    $db['users'][] = $user;
    saveDB($db);

    return ['success' => true, 'user' => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email']]];
}

// ===== LOGIN USER =====
function loginUser($email, $password) {
    $db = getDB();

    foreach ($db['users'] as $user) {
        if ($user['email'] === $email && password_verify($password, $user['password'])) {
            return ['success' => true, 'user' => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email']]];
        }
    }

    return ['success' => false, 'message' => 'ایمیل یا رمز عبور اشتباه است'];
}

// ===== ADD VIDEO =====
function addVideo($title, $description, $filename, $thumbnail = '') {
    $db = getDB();

    $video = [
        'id' => generateId(),
        'title' => $title,
        'description' => $description,
        'filename' => $filename,
        'thumbnail' => $thumbnail,
        'views' => 0,
        'date' => date('Y-m-d H:i:s'),
        'user_id' => '1'
    ];

    $db['videos'][] = $video;
    saveDB($db);

    return $video;
}

// ===== ROUTING =====
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'getVideos':
        echo json_encode(['success' => true, 'videos' => getVideos()]);
        break;

    case 'getVideo':
        $id = $_GET['id'] ?? '';
        if ($id) {
            $video = getVideo($id);
            if ($video) {
                echo json_encode(['success' => true, 'video' => $video]);
            } else {
                echo json_encode(['success' => false, 'message' => 'ویدیو یافت نشد']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'شناسه ویدیو وارد نشده']);
        }
        break;

    case 'register':
        $data = json_decode(file_get_contents('php://input'), true);
        $result = registerUser($data['name'] ?? '', $data['email'] ?? '', $data['password'] ?? '');
        echo json_encode($result);
        break;

    case 'login':
        $data = json_decode(file_get_contents('php://input'), true);
        $result = loginUser($data['email'] ?? '', $data['password'] ?? '');
        echo json_encode($result);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'درخواست نامعتبر']);
}
?>
