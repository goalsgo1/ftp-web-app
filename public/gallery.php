<?php
session_start();

// 저장 경로 설정
$internalPath = '/var/www/uploads/photos'; // 리눅스 내부 저장소

// 외장 SSD 경로 설정 (Windows PC의 외장 SSD를 네트워크 공유로 마운트)
// Windows에서 외장 SSD 폴더를 공유한 후, 리눅스에서 다음과 같이 마운트:
// 
// 1. Windows에서 외장 SSD 폴더 공유 설정:
//    - 외장 SSD 폴더 우클릭 > 속성 > 공유 탭 > 고급 공유 > 공유 이름 설정
//
// 2. 리눅스에서 마운트:
//    sudo apt-get install cifs-utils  # CIFS 유틸리티 설치
//    sudo mkdir -p /mnt/external_hdd
//    sudo mount -t cifs //윈도우IP/공유폴더명 /mnt/external_hdd -o username=윈도우사용자명,password=비밀번호,uid=www-data,gid=www-data
//
// 3. 자동 마운트 설정 (/etc/fstab):
//    //172.30.1.42/외장SSD공유명 /mnt/external_hdd cifs username=사용자명,password=비밀번호,uid=www-data,gid=www-data 0 0
//
// 4. 마운트 후 photos 폴더 생성:
//    sudo mkdir -p /mnt/external_hdd/photos
//    sudo chmod 755 /mnt/external_hdd/photos
//
$externalPath = '/mnt/external_hdd/photos';

// 참고: 외장 SSD를 웹에서 접근하려면 다음 중 하나를 설정해야 합니다:
// 1. 심볼릭 링크: sudo ln -s /mnt/external_hdd/photos /var/www/external_hdd/photos
// 2. 웹 서버 설정에서 별도 경로 추가
// 3. 외장 SSD를 /var/www/ 아래에 직접 마운트

// 세션에서 저장 경로 가져오기 (기본값: 내부 저장소)
$storageType = $_SESSION['storage_type'] ?? 'internal';

// 저장 경로 변경 처리
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'change_storage') {
    $newType = $_POST['storage_type'] ?? 'internal';
    if (in_array($newType, ['internal', 'external'])) {
        $_SESSION['storage_type'] = $newType;
        $storageType = $newType;
        $messages[] = "✅ 저장 경로가 변경되었습니다.";
    }
}

// 현재 저장 경로 결정
$galleryDir = ($storageType === 'external') ? $externalPath : $internalPath;
$maxFileSize = 20 * 1024 * 1024; // 20MB
$messages = [];

// 디렉토리 생성 및 권한 확인
function ensureDirectory($path) {
    if (!is_dir($path)) {
        // 상위 디렉토리부터 생성
        $parent = dirname($path);
        if (!is_dir($parent)) {
            ensureDirectory($parent);
        }
        if (!@mkdir($path, 0755, true)) {
            return false;
        }
    }
    // 쓰기 권한 확인
    if (!is_writable($path)) {
        return false;
    }
    return true;
}

// 두 저장소 모두 확인 및 생성
if (!ensureDirectory($internalPath)) {
    $messages[] = "⚠️ 내부 저장소 경로를 생성하거나 쓰기 권한이 없습니다: {$internalPath}";
}
if (!ensureDirectory($externalPath)) {
    $messages[] = "⚠️ 외장 HDD 경로를 생성하거나 쓰기 권한이 없습니다: {$externalPath}";
}

function sanitizeFileName($name) {
    $name = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $name);
    return $name;
}

// 파일 크기 포맷 함수
function formatBytes($bytes, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    if ($bytes == 0) return '0 B';
    $base = log($bytes, 1024);
    return round(pow(1024, $base - floor($base)), $precision) . ' ' . $units[floor($base)];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'upload') {
        if (isset($_FILES['photos'])) {
            foreach ($_FILES['photos']['name'] as $idx => $name) {
                if (!$_FILES['photos']['size'][$idx]) {
                    continue;
                }
                if ($_FILES['photos']['error'][$idx] !== UPLOAD_ERR_OK) {
                    $messages[] = "🚫 {$name} 업로드 실패 (에러 코드: {$_FILES['photos']['error'][$idx]})";
                    continue;
                }
                if ($_FILES['photos']['size'][$idx] > $maxFileSize) {
                    $messages[] = "🚫 {$name} 용량이 20MB를 초과합니다.";
                    continue;
                }
                $mime = mime_content_type($_FILES['photos']['tmp_name'][$idx]);
                if (strpos($mime, 'image/') !== 0) {
                    $messages[] = "🚫 {$name} 는 이미지 파일이 아닙니다.";
                    continue;
                }
                $ext = pathinfo($name, PATHINFO_EXTENSION);
                $base = pathinfo($name, PATHINFO_FILENAME);
                $safeName = sanitizeFileName($base) . '_' . time() . '.' . sanitizeFileName($ext);
                $target = rtrim($galleryDir, '/') . '/' . $safeName;
                
                // 디렉토리 재확인 및 생성
                if (!ensureDirectory($galleryDir)) {
                    $messages[] = "🚫 {$name} 업로드 실패: 저장 경로에 쓰기 권한이 없습니다. ({$galleryDir})";
                    continue;
                }
                
                // 디렉토리 존재 여부 재확인
                if (!is_dir($galleryDir)) {
                    $messages[] = "🚫 {$name} 업로드 실패: 저장 디렉토리가 존재하지 않습니다. ({$galleryDir})";
                    continue;
                }
                
                // 쓰기 권한 확인
                if (!is_writable($galleryDir)) {
                    $messages[] = "🚫 {$name} 업로드 실패: 저장 디렉토리에 쓰기 권한이 없습니다. ({$galleryDir})";
                    $messages[] = "💡 해결 방법: sudo chmod 755 {$galleryDir} 또는 sudo chown www-data:www-data {$galleryDir}";
                    continue;
                }
                
                $lastError = '';
                set_error_handler(function($errno, $errstr) use (&$lastError) {
                    $lastError = $errstr;
                    return true;
                });
                $moved = move_uploaded_file($_FILES['photos']['tmp_name'][$idx], $target);
                restore_error_handler();
                
                if ($moved) {
                    $messages[] = "✅ {$name} 업로드 성공 ({$galleryDir})";
                } else {
                    $errorMsg = $lastError ?: '알 수 없는 오류';
                    // 더 자세한 에러 정보 제공
                    if (strpos($errorMsg, 'Permission denied') !== false || strpos($errorMsg, 'permission') !== false) {
                        $errorMsg = '권한이 거부되었습니다. 디렉토리 권한을 확인하세요.';
                    } elseif (strpos($errorMsg, 'No such file') !== false || strpos($errorMsg, 'directory') !== false) {
                        $errorMsg = '디렉토리가 존재하지 않습니다.';
                    }
                    $messages[] = "🚫 {$name} 이동 실패: {$errorMsg}";
                    $messages[] = "💡 경로: {$target}";
                }
            }
        }
    } elseif ($action === 'delete' && isset($_POST['file'])) {
        $file = basename($_POST['file']);
        // 두 저장소 모두에서 찾아서 삭제
        $deleted = false;
        foreach ([$internalPath, $externalPath] as $dir) {
            $target = rtrim($dir, '/') . '/' . $file;
            if (is_file($target)) {
                if (unlink($target)) {
                    $messages[] = "🗑️ {$file} 삭제 완료";
                    $deleted = true;
                    break;
                }
            }
        }
        if (!$deleted) {
            $messages[] = "🚫 파일을 찾을 수 없습니다.";
        }
    } elseif ($action === 'delete_selected') {
        $files = isset($_POST['files']) && is_array($_POST['files']) ? $_POST['files'] : [];
        if (!$files) {
            $messages[] = "🚫 선택된 파일이 없습니다.";
        } else {
            $deleted = 0;
            foreach ($files as $file) {
                $base = basename($file);
                // 두 저장소 모두에서 찾아서 삭제
                foreach ([$internalPath, $externalPath] as $dir) {
                    $target = rtrim($dir, '/') . '/' . $base;
                    if (is_file($target) && unlink($target)) {
                        $deleted++;
                        break;
                    }
                }
            }
            if ($deleted > 0) {
                $messages[] = "🗑️ 총 {$deleted}개의 파일을 삭제했습니다.";
            } else {
                $messages[] = "🚫 파일 삭제에 실패했습니다.";
            }
        }
    }
}

$images = [];
$allowedExt = ['jpg','jpeg','png','gif','webp','bmp'];

// 두 저장소 모두 스캔
$directories = [
    ['path' => $internalPath, 'type' => 'internal', 'webPath' => 'uploads/photos/'],
    ['path' => $externalPath, 'type' => 'external', 'webPath' => 'external_hdd/photos/']
];

foreach ($directories as $dirInfo) {
    $dir = $dirInfo['path'];
    if (!is_dir($dir)) continue;
    
    $iterator = @scandir($dir);
    if ($iterator) {
        foreach ($iterator as $file) {
            if ($file === '.' || $file === '..') continue;
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExt)) continue;
            
            $filePath = rtrim($dir, '/') . '/' . $file;
            $fileSize = @filesize($filePath);
            $fileDate = @filemtime($filePath);
            
            if ($fileDate) {
                $dt = (new DateTime('@'.$fileDate))->setTimezone(new DateTimeZone('Asia/Seoul'));
                $dateFormatted = $dt->format('Y-m-d H:i:s');
            } else {
                $dateFormatted = '알 수 없음';
            }
            
            // 웹 접근 경로 (실제 웹 서버 설정에 맞게 수정 필요)
            // 외장 HDD의 경우 심볼릭 링크나 별도 설정이 필요할 수 있습니다
            $webPath = $dirInfo['webPath'] . $file;
            
            $images[] = [
                'name' => $file,
                'path' => $webPath,
                'fullPath' => $filePath,
                'storageType' => $dirInfo['type'],
                'storagePath' => $dir,
                'size' => $fileSize,
                'date' => $fileDate,
                'sizeFormatted' => $fileSize ? formatBytes($fileSize) : '알 수 없음',
                'dateFormatted' => $dateFormatted
            ];
        }
    }
}

$sort = $_GET['sort'] ?? 'date_desc';
if ($images) {
    usort($images, function($a, $b) use ($sort) {
        switch ($sort) {
            case 'name':
                return strcasecmp($a['name'], $b['name']);
            case 'date_asc':
                return ($a['date'] ?? 0) <=> ($b['date'] ?? 0);
            case 'date_desc':
            default:
                return ($b['date'] ?? 0) <=> ($a['date'] ?? 0);
        }
    });
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>사진 갤러리</title>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%);
            min-height: 100vh;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
        .container {
            width: 100%;
            max-width: 1200px;
            background: #fff;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { text-align:center; margin-bottom:30px; color:#6a1b9a; }
        .home-btn {
            display:inline-block;
            padding:10px 18px;
            background:#6a1b9a;
            color:#fff;
            border-radius:6px;
            text-decoration:none;
            box-shadow:0 4px 10px rgba(0,0,0,0.2);
            transition:background 0.3s;
            margin-bottom:20px;
        }
        .home-btn:hover { background:#8e24aa; }
        .drop-zone {
            border:2px dashed #9c27b0;
            background:#fce4ec;
            border-radius:15px;
            padding:40px;
            text-align:center;
            color:#6a1b9a;
            font-size:1.1em;
            margin-bottom:25px;
        }
        .drop-zone.dragover {
            background:#f8bbd0;
            border-color:#6a1b9a;
        }
        .gallery-grid {
            display:grid;
            grid-template-columns: repeat(auto-fit, minmax(180px,1fr));
            gap:20px;
        }
        .thumb {
            position:relative;
            cursor:pointer;
            background:#fff;
            border-radius:12px;
            padding:8px;
            box-shadow:0 4px 10px rgba(0,0,0,0.1);
            transition:transform 0.2s, box-shadow 0.2s;
        }
        .thumb:hover {
            transform:translateY(-3px);
            box-shadow:0 8px 20px rgba(0,0,0,0.2);
        }
        .thumb img {
            width:100%;
            height:150px;
            object-fit:cover;
            border-radius:8px;
            box-shadow:0 2px 8px rgba(0,0,0,0.1);
        }
        .thumb-info {
            margin-top:8px;
            padding:4px 0;
        }
        .thumb-name {
            font-size:0.85em;
            color:#555;
            font-weight:500;
            word-break:break-word;
            line-height:1.3;
            max-height:2.6em;
            overflow:hidden;
            text-overflow:ellipsis;
            display:-webkit-box;
            -webkit-line-clamp:2;
            -webkit-box-orient:vertical;
        }
        .gallery-count {
            text-align:center;
            margin:20px 0;
            padding:12px;
            background:#f3e5f5;
            border-radius:8px;
            color:#6a1b9a;
            font-size:1.1em;
            font-weight:600;
        }
        .modal {
            position:fixed;
            top:0; left:0;
            width:100%; height:100%;
            background:rgba(0,0,0,0.6);
            display:none;
            justify-content:center;
            align-items:center;
            padding:20px;
            z-index:1000;
        }
        .modal.active { display:flex; }
        .modal-content {
            position:relative;
            background:#fff;
            border-radius:15px;
            padding:20px;
            max-width:90%;
            max-height:90%;
            overflow-y:auto;
        }
        .modal-content img {
            max-width:100%;
            max-height:70vh;
            display:block;
            border-radius:10px;
            margin-bottom:15px;
        }
        .modal-info {
            background:#f5f5f5;
            padding:15px;
            border-radius:8px;
            margin-top:10px;
        }
        .modal-info-item {
            margin:8px 0;
            font-size:0.95em;
            color:#555;
        }
        .modal-info-label {
            font-weight:600;
            color:#6a1b9a;
            display:inline-block;
            min-width:80px;
        }
        .modal-info-value {
            color:#333;
        }
        .modal-close {
            position:absolute;
            top:10px;
            right:10px;
            background:#f44336;
            color:#fff;
            border:none;
            border-radius:50%;
            width:32px;
            height:32px;
            cursor:pointer;
        }
        .modal-delete {
            position:absolute;
            top:10px;
            right:50px;
            background:#ff9800;
            border:none;
            color:#fff;
            border-radius:20px;
            padding:6px 12px;
            cursor:pointer;
        }
        .messages {
            margin-bottom:20px;
        }
        .messages p {
            padding:8px 12px;
            border-radius:6px;
            margin-bottom:6px;
        }
        .messages.client { margin-top:-10px; }
        .messages .success { background:#e8f5e9; color:#2e7d32; }
        .messages .error { background:#ffebee; color:#c62828; }
        .sort-bar {
            display:flex;
            justify-content:flex-end;
            align-items:center;
            gap:10px;
            margin:15px 0 25px;
        }
        .sort-select {
            padding:8px 12px;
            border:1px solid #d1c4e9;
            border-radius:8px;
            font-size:0.95em;
            color:#6a1b9a;
            background:#f3e5f5;
        }
        .thumb-number {
            position:absolute;
            top:8px;
            left:8px;
            background:rgba(106,27,154,0.85);
            color:#fff;
            font-size:0.85em;
            padding:2px 8px;
            border-radius:12px;
        }
        .select-actions {
            display:flex;
            justify-content:flex-end;
            gap:10px;
            margin-bottom:15px;
        }
        .select-btn,
        .delete-selected-btn {
            padding:8px 16px;
            border:none;
            border-radius:8px;
            cursor:pointer;
            font-weight:600;
            box-shadow:0 4px 10px rgba(0,0,0,0.1);
            transition:background 0.2s;
        }
        .select-btn {
            background:#d1c4e9;
            color:#4527a0;
        }
        .select-btn.active {
            background:#b39ddb;
        }
        .delete-selected-btn {
            background:#f44336;
            color:#fff;
            display:none;
        }
        .gallery-grid.select-mode .delete-selected-btn {
            display:inline-block;
        }
        .thumb-checkbox {
            position:absolute;
            top:8px;
            right:8px;
            transform:scale(1.3);
            display:none;
        }
        .gallery-grid.select-mode .thumb-checkbox {
            display:block;
        }
        .storage-toggle {
            background:#fff;
            border:2px solid #9c27b0;
            border-radius:12px;
            padding:20px;
            margin-bottom:25px;
            box-shadow:0 4px 10px rgba(0,0,0,0.1);
        }
        .storage-toggle h3 {
            color:#6a1b9a;
            margin-bottom:15px;
            font-size:1.2em;
        }
        .toggle-container {
            display:flex;
            align-items:center;
            gap:15px;
            margin-bottom:10px;
        }
        .toggle-switch {
            position:relative;
            width:60px;
            height:30px;
            background:#ccc;
            border-radius:15px;
            cursor:pointer;
            transition:background 0.3s;
        }
        .toggle-switch.active {
            background:#9c27b0;
        }
        .toggle-slider {
            position:absolute;
            top:3px;
            left:3px;
            width:24px;
            height:24px;
            background:#fff;
            border-radius:50%;
            transition:transform 0.3s;
            box-shadow:0 2px 4px rgba(0,0,0,0.2);
        }
        .toggle-switch.active .toggle-slider {
            transform:translateX(30px);
        }
        .toggle-label {
            font-weight:600;
            color:#6a1b9a;
            font-size:1.1em;
        }
        .storage-path-info {
            margin-top:10px;
            padding:10px;
            background:#f3e5f5;
            border-radius:8px;
            font-size:0.9em;
            color:#6a1b9a;
        }
        .storage-path-info strong {
            color:#4527a0;
        }
        .thumb-storage-path {
            font-size:0.75em;
            color:#9c27b0;
            margin-top:4px;
            padding:2px 6px;
            background:#f3e5f5;
            border-radius:4px;
            display:inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <a class="home-btn" href="index.html">← 홈으로</a>
        <h1>사진 갤러리</h1>
        
        <div class="storage-toggle">
            <h3>📁 저장 위치 설정</h3>
            <form method="POST" id="storageForm">
                <input type="hidden" name="action" value="change_storage">
                <div class="toggle-container">
                    <span class="toggle-label">내부 저장소</span>
                    <div class="toggle-switch <?php echo $storageType === 'external' ? 'active' : ''; ?>" id="storageToggle">
                        <div class="toggle-slider"></div>
                    </div>
                    <span class="toggle-label">외장 HDD</span>
                </div>
                <input type="hidden" name="storage_type" id="storageTypeInput" value="<?php echo $storageType; ?>">
            </form>
            <div class="storage-path-info">
                <strong>현재 저장 경로:</strong> 
                <code><?php echo htmlspecialchars($galleryDir); ?></code>
                <br>
                <small>
                    <?php if ($storageType === 'external'): ?>
                        외장 HDD에 저장됩니다. (<?php echo htmlspecialchars($externalPath); ?>)
                        <?php if (!is_dir($externalPath) || !is_writable($externalPath)): ?>
                            <br><span style="color:#f44336;">⚠️ 경로에 접근할 수 없거나 쓰기 권한이 없습니다.</span>
                        <?php else: ?>
                            <br><span style="color:#4caf50;">✅ 경로 접근 가능</span>
                        <?php endif; ?>
                    <?php else: ?>
                        리눅스 내부 저장소에 저장됩니다. (<?php echo htmlspecialchars($internalPath); ?>)
                        <?php if (!is_dir($internalPath) || !is_writable($internalPath)): ?>
                            <br><span style="color:#f44336;">⚠️ 경로에 접근할 수 없거나 쓰기 권한이 없습니다.</span>
                        <?php else: ?>
                            <br><span style="color:#4caf50;">✅ 경로 접근 가능</span>
                        <?php endif; ?>
                    <?php endif; ?>
                </small>
            </div>
        </div>
        
        <?php if (count($images) > 0): ?>
        <div class="gallery-count">
            📸 총 <?php echo count($images); ?>개의 사진
        </div>
        <?php endif; ?>

        <?php if ($messages): ?>
        <div class="messages">
            <?php foreach ($messages as $msg): ?>
                <p class="<?php echo strpos($msg, '✅') !== false || strpos($msg,'🗑️') !== false ? 'success' : 'error'; ?>">
                    <?php echo htmlspecialchars($msg); ?>
                </p>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
        <div class="messages client" id="clientMessages" style="display:none;"></div>

        <?php if (count($images) > 0): ?>
        <form method="GET" class="sort-bar">
            <label for="sort" style="font-weight:600;color:#6a1b9a;">정렬:</label>
            <select id="sort" name="sort" class="sort-select" onchange="this.form.submit()">
                <option value="date_desc" <?php echo $sort === 'date_desc' ? 'selected' : ''; ?>>업로드 최신순</option>
                <option value="date_asc" <?php echo $sort === 'date_asc' ? 'selected' : ''; ?>>업로드 오래된 순</option>
                <option value="name" <?php echo $sort === 'name' ? 'selected' : ''; ?>>이름순</option>
            </select>
        </form>
        <div class="select-actions">
            <button type="button" class="select-btn" id="selectModeToggle">선택 삭제</button>
            <button type="button" class="delete-selected-btn" id="deleteSelectedBtn">선택한 사진 삭제</button>
        </div>
        <?php endif; ?>

        <form id="uploadForm" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="action" value="upload">
            <input type="file" id="fileInput" name="photos[]" accept="image/*" multiple style="display:none;">
            <div class="drop-zone" id="dropZone">
                여기로 이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요 (최대 20MB)
            </div>
        </form>

        <div class="gallery-grid" id="galleryGrid">
            <?php if (!$images): ?>
                <p>아직 업로드된 사진이 없습니다.</p>
            <?php else: ?>
                <?php foreach ($images as $idx => $img): ?>
                    <div class="thumb" data-file="<?php echo htmlspecialchars($img['name']); ?>" 
                         data-size="<?php echo htmlspecialchars($img['sizeFormatted']); ?>"
                         data-date="<?php echo htmlspecialchars($img['dateFormatted']); ?>">
                        <input type="checkbox" class="thumb-checkbox" value="<?php echo htmlspecialchars($img['name']); ?>">
                        <div class="thumb-number"><?php echo $idx + 1; ?></div>
                        <img src="<?php echo htmlspecialchars($img['path']); ?>" alt="<?php echo htmlspecialchars($img['name']); ?>">
                        <div class="thumb-info">
                            <div class="thumb-name" title="<?php echo htmlspecialchars($img['name']); ?>">
                                <?php echo htmlspecialchars($img['name']); ?>
                            </div>
                            <div class="thumb-storage-path" title="<?php echo htmlspecialchars($img['storagePath']); ?>">
                                <?php echo $img['storageType'] === 'external' ? '💾 외장 HDD' : '💿 내부 저장소'; ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>

    <div class="modal" id="modal">
        <div class="modal-content">
            <button class="modal-close" id="modalClose">✕</button>
            <button class="modal-delete" id="modalDelete">삭제</button>
            <img id="modalImage" src="" alt="미리보기">
            <div class="modal-info" id="modalInfo">
                <div class="modal-info-item">
                    <span class="modal-info-label">파일명:</span>
                    <span class="modal-info-value" id="modalFileName">-</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">크기:</span>
                    <span class="modal-info-value" id="modalFileSize">-</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">업로드일:</span>
                    <span class="modal-info-value" id="modalFileDate">-</span>
                </div>
            </div>
        </div>
    </div>

    <form id="deleteForm" method="POST" style="display:none;">
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="file" id="deleteFile">
    </form>
    <form id="bulkDeleteForm" method="POST" style="display:none;">
        <input type="hidden" name="action" value="delete_selected">
    </form>

    <script>
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const uploadForm = document.getElementById('uploadForm');
        const galleryGrid = document.getElementById('galleryGrid');
        const modal = document.getElementById('modal');
        const modalImage = document.getElementById('modalImage');
        const modalClose = document.getElementById('modalClose');
        const modalDelete = document.getElementById('modalDelete');
        const deleteFile = document.getElementById('deleteFile');
        const deleteForm = document.getElementById('deleteForm');
        const clientMessages = document.getElementById('clientMessages');
        const storageToggle = document.getElementById('storageToggle');
        const storageForm = document.getElementById('storageForm');
        const storageTypeInput = document.getElementById('storageTypeInput');
        const MAX_FILE_SIZE = <?php echo $maxFileSize; ?>;
        let currentFile = null;
        let selectMode = false;
        
        // 저장 경로 토글 기능
        if (storageToggle) {
            storageToggle.addEventListener('click', () => {
                const isActive = storageToggle.classList.contains('active');
                if (isActive) {
                    storageToggle.classList.remove('active');
                    storageTypeInput.value = 'internal';
                } else {
                    storageToggle.classList.add('active');
                    storageTypeInput.value = 'external';
                }
                if (confirm('저장 경로를 변경하면 새로 업로드하는 사진만 새로운 경로에 저장됩니다.\n기존 사진은 원래 경로에 그대로 남아있습니다.\n계속하시겠습니까?')) {
                    storageForm.submit();
                } else {
                    // 취소 시 원래 상태로 복구
                    storageToggle.classList.toggle('active');
                    storageTypeInput.value = '<?php echo $storageType; ?>';
                }
            });
        }

        function showClientMessage(text, type = 'error') {
            if (!clientMessages) return;
            clientMessages.style.display = 'block';
            clientMessages.innerHTML = `<p class="${type === 'success' ? 'success' : 'error'}">${text}</p>`;
        }

        function clearClientMessage() {
            if (!clientMessages) return;
            clientMessages.style.display = 'none';
            clientMessages.innerHTML = '';
        }

        function validateFiles(fileList) {
            const tooBig = [];
            for (const file of fileList) {
                if (file.size > MAX_FILE_SIZE) {
                    tooBig.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
                }
            }
            if (tooBig.length) {
                showClientMessage(`다음 파일은 20MB 제한을 초과하여 업로드할 수 없습니다: ${tooBig.join(', ')}`);
                return false;
            }
            clearClientMessage();
            return true;
        }

        dropZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', () => {
            if (validateFiles(fileInput.files)) {
                uploadForm.submit();
            } else {
                fileInput.value = '';
            }
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (!validateFiles(e.dataTransfer.files)) {
                return;
            }
            const dt = new DataTransfer();
            for (const file of e.dataTransfer.files) {
                dt.items.add(file);
            }
            fileInput.files = dt.files;
            uploadForm.submit();
        });

        galleryGrid.addEventListener('click', (e) => {
            const thumb = e.target.closest('.thumb');
            if (!thumb) return;
            const checkbox = thumb.querySelector('.thumb-checkbox');
            if (selectMode) {
                if (e.target === checkbox) {
                    e.stopPropagation();
                    return;
                }
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
                return;
            }
            const file = thumb.dataset.file;
            const img = thumb.querySelector('img');
            modalImage.src = img.src;
            currentFile = file;
            
            // 상세 정보 표시
            document.getElementById('modalFileName').textContent = file;
            document.getElementById('modalFileSize').textContent = thumb.dataset.size || '-';
            document.getElementById('modalFileDate').textContent = thumb.dataset.date || '-';
            
            modal.classList.add('active');
        });

        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
            modalImage.src = '';
            document.getElementById('modalFileName').textContent = '-';
            document.getElementById('modalFileSize').textContent = '-';
            document.getElementById('modalFileDate').textContent = '-';
        });

        modalDelete.addEventListener('click', () => {
            if (!currentFile) return;
            if (confirm('정말 삭제하시겠습니까?')) {
                deleteFile.value = currentFile;
                deleteForm.submit();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                modalImage.src = '';
                document.getElementById('modalFileName').textContent = '-';
                document.getElementById('modalFileSize').textContent = '-';
                document.getElementById('modalFileDate').textContent = '-';
            }
        });

        const selectModeToggle = document.getElementById('selectModeToggle');
        const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        const bulkDeleteForm = document.getElementById('bulkDeleteForm');

        if (selectModeToggle) {
            const exitSelectMode = () => {
                selectMode = false;
                galleryGrid.classList.remove('select-mode');
                selectModeToggle.classList.remove('active');
                selectModeToggle.textContent = '선택 삭제';
                deleteSelectedBtn.style.display = 'none';
                document.querySelectorAll('.thumb-checkbox').forEach(cb => cb.checked = false);
            };

            selectModeToggle.addEventListener('click', () => {
                selectMode = !selectMode;
                if (selectMode) {
                    galleryGrid.classList.add('select-mode');
                    selectModeToggle.classList.add('active');
                    selectModeToggle.textContent = '선택 취소';
                    deleteSelectedBtn.style.display = 'inline-block';
                    document.querySelectorAll('.thumb-checkbox').forEach(cb => {
                        cb.addEventListener('click', (ev) => ev.stopPropagation());
                    });
                } else {
                    exitSelectMode();
                }
            });

            deleteSelectedBtn.addEventListener('click', () => {
                const checked = Array.from(document.querySelectorAll('.thumb-checkbox:checked'));
                if (checked.length === 0) {
                    alert('삭제할 사진을 선택하세요.');
                    return;
                }
                if (!confirm(`${checked.length}개의 사진을 삭제하시겠습니까?`)) {
                    return;
                }
                bulkDeleteForm.querySelectorAll('input[name="files[]"]').forEach(el => el.remove());
                checked.forEach(cb => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'files[]';
                    input.value = cb.value;
                    bulkDeleteForm.appendChild(input);
                });
                bulkDeleteForm.submit();
            });
        }
    </script>
</body>
</html>

