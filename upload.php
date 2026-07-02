<?php
// ============================================
// GStream - Upload Handler
// ============================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// ===== CONFIG =====
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
const UPLOAD_DIR = 'videos/';

// ===== CREATE UPLOAD DIRECTORY =====
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0777, true);
}

// ===== CHECK REQUEST =====
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die(json_encode(['success' => false, 'message' => 'روش درخواست مجاز نیست']));
}

// ===== VALIDATE FILE =====
if (!isset($_FILES['videoFile']) || $_FILES['videoFile']['error'] !== UPLOAD_ERR_OK) {
    die(json_encode(['success' => false, 'message' => 'خطا در آپلود فایل']));
}

$file = $_FILES['videoFile'];
$fileSize = $file['size'];
$fileType = $file['type'];
$fileTmp = $file['tmp_name'];

// Check size
if ($fileSize > MAX_FILE_SIZE) {
    die(json_encode(['success' => false, 'message' => 'حجم فایل بیش از حد مجاز (حداکثر ۵۰۰MB)']));
}

// Check type
if (!in_array($fileType, ALLOWED_VIDEO_TYPES)) {
    die(json_encode(['success' => false, 'message' => 'فرمت فایل پشتیبانی نمی‌شود']));
}

// ===== GENERATE FILENAME =====
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('gstream_') . '.' . $extension;
$filePath = UPLOAD_DIR . $filename;

// ===== MOVE FILE =====
if (!move_uploaded_file($fileTmp, $filePath)) {
    die(json_encode(['success' => false, 'message' => 'خطا در ذخیره فایل']));
}

// ===== GET FORM DATA =====
$title = $_POST['title'] ?? 'بدون عنوان';
$description = $_POST['description'] ?? '';

// ===== HANDLE THUMBNAIL =====
$thumbnail = '';
if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
    $thumbExt = pathinfo($_FILES['thumbnail']['name'], PATHINFO_EXTENSION);
    $thumbName = 'thumb_' . uniqid() . '.' . $thumbExt;
    $thumbPath = UPLOAD_DIR . 'thumbnails/';

    if (!is_dir($thumbPath)) {
        mkdir($thumbPath, 0777, true);
    }

    if (move_uploaded_file($_FILES['thumbnail']['tmp_name'], $thumbPath . $thumbName)) {
        $thumbnail = 'videos/thumbnails/' . $thumbName;
    }
}

// ===== SAVE TO DATABASE =====
require_once 'api.php';

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

// ===== RESPONSE =====
echo json_encode([
    'success' => true,
    'message' => 'ویدیو با موفقیت آپلود شد',
    'video' => $video
]);
?>
