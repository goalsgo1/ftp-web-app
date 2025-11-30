# Git + CI/CD 자동 배포 설정 스크립트
# PowerShell에서 실행: .\배포_시작하기.ps1

Write-Host "🚀 Git + CI/CD 자동 배포 설정을 시작합니다..." -ForegroundColor Cyan
Write-Host ""

# 1단계: Git 설치 확인
Write-Host "1️⃣ Git 설치 확인 중..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git이 설치되어 있습니다: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "   다음 URL에서 Git을 다운로드하세요: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "   또는 Chocolatey로 설치: choco install git -y" -ForegroundColor Yellow
    exit 1
}

# 2단계: 프로젝트 구조 생성
Write-Host ""
Write-Host "2️⃣ 프로젝트 구조 생성 중..." -ForegroundColor Yellow

$directories = @(
    "public\css",
    "public\js",
    "public\images\icons",
    "public\images\thumbnails",
    "deploy",
    ".github\workflows"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "   ✓ 생성: $dir" -ForegroundColor Gray
    } else {
        Write-Host "   ○ 이미 존재: $dir" -ForegroundColor Gray
    }
}

# 3단계: 기존 파일을 public 디렉토리로 이동 (없는 경우에만)
Write-Host ""
Write-Host "3️⃣ 파일 구조 정리 중..." -ForegroundColor Yellow

$filesToMove = @{
    "index.html" = "public\index.html"
    "world_time.html" = "public\world_time.html"
    "disk_info.php" = "public\disk_info.php"
    "gallery.php" = "public\gallery.php"
}

foreach ($file in $filesToMove.GetEnumerator()) {
    if (Test-Path $file.Key) {
        if (-not (Test-Path $file.Value)) {
            Move-Item -Path $file.Key -Destination $file.Value -Force
            Write-Host "   ✓ 이동: $($file.Key) → $($file.Value)" -ForegroundColor Gray
        } else {
            Write-Host "   ○ 이미 존재: $($file.Value)" -ForegroundColor Gray
        }
    }
}

# 4단계: Git 저장소 초기화 확인
Write-Host ""
Write-Host "4️⃣ Git 저장소 확인 중..." -ForegroundColor Yellow

if (Test-Path ".git") {
    Write-Host "   ✓ Git 저장소가 이미 초기화되어 있습니다." -ForegroundColor Green
} else {
    Write-Host "   Git 저장소를 초기화합니다..." -ForegroundColor Yellow
    git init
    git branch -M main
    Write-Host "   ✓ Git 저장소 초기화 완료" -ForegroundColor Green
}

# 5단계: .gitignore 확인
Write-Host ""
Write-Host "5️⃣ .gitignore 파일 확인 중..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    Write-Host "   ✓ .gitignore 파일이 존재합니다." -ForegroundColor Green
} else {
    Write-Host "   ❌ .gitignore 파일이 없습니다. 생성이 필요합니다." -ForegroundColor Red
}

# 6단계: Git 사용자 정보 확인
Write-Host ""
Write-Host "6️⃣ Git 사용자 정보 확인 중..." -ForegroundColor Yellow
$gitUserName = git config user.name
$gitUserEmail = git config user.email

if ($gitUserName -and $gitUserEmail) {
    Write-Host "   ✓ 사용자: $gitUserName <$gitUserEmail>" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Git 사용자 정보가 설정되지 않았습니다." -ForegroundColor Yellow
    Write-Host "   다음 명령어로 설정하세요:" -ForegroundColor Yellow
    Write-Host "   git config --global user.name `"Your Name`"" -ForegroundColor Gray
    Write-Host "   git config --global user.email `"your.email@example.com`"" -ForegroundColor Gray
}

# 완료 메시지
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✅ 초기 설정이 완료되었습니다!" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "  1. '단계별_배포_가이드.md' 파일을 읽어보세요" -ForegroundColor White
Write-Host "  2. Git 사용자 정보를 설정하세요 (아직 설정하지 않은 경우)" -ForegroundColor White
Write-Host "  3. GitHub 저장소를 생성하고 연결하세요" -ForegroundColor White
Write-Host "  4. 첫 커밋을 생성하세요: git add . && git commit -m 'Initial commit'" -ForegroundColor White
Write-Host ""
Write-Host "자세한 내용은 '단계별_배포_가이드.md' 파일을 참고하세요!" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
