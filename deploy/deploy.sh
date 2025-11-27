#!/bin/bash
set -e

# ===========================================
# 자동 배포 스크립트 (Git 기반)
# ===========================================

# 설정 변수 (서버 환경에 맞게 수정 필요)
APP_DIR="/var/www/myapp"
REPO_DIR="$APP_DIR/repo"
RELEASES_DIR="$APP_DIR/releases"
SHARED_DIR="$APP_DIR/shared"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
NEW_RELEASE="$RELEASES_DIR/$TIMESTAMP"
CURRENT_LINK="$APP_DIR/current"

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "🚀 배포 시작: $TIMESTAMP"

# ===========================================
# 1. Git 저장소 업데이트
# ===========================================
log "📥 Git 저장소 업데이트 중..."
cd "$REPO_DIR"

# 원격 저장소에서 최신 변경사항 가져오기
git fetch origin || {
    log "❌ Git fetch 실패"
    exit 1
}

# main 브랜치로 전환
git checkout main || {
    log "❌ 브랜치 전환 실패"
    exit 1
}

# 최신 변경사항 가져오기
git pull origin main || {
    log "❌ Git pull 실패"
    exit 1
}

# 현재 커밋 해시 기록
CURRENT_COMMIT=$(git rev-parse --short HEAD)
log "📍 현재 커밋: $CURRENT_COMMIT"

# ===========================================
# 2. 새 릴리즈 디렉토리 생성
# ===========================================
log "📦 새 릴리즈 디렉토리 생성: $NEW_RELEASE"
mkdir -p "$NEW_RELEASE" || {
    log "❌ 릴리즈 디렉토리 생성 실패"
    exit 1
}

# ===========================================
# 3. 파일 복사 (public 디렉토리)
# ===========================================
log "📋 파일 복사 중..."

if [ -d "$REPO_DIR/public" ]; then
    rsync -a --exclude=".git" "$REPO_DIR/public/" "$NEW_RELEASE/" || {
        log "❌ 파일 복사 실패"
        exit 1
    }
else
    log "⚠️  public 디렉토리가 없습니다. 전체 프로젝트를 복사합니다."
    rsync -a --exclude=".git" --exclude="releases" --exclude="shared" \
        "$REPO_DIR/" "$NEW_RELEASE/" || {
        log "❌ 파일 복사 실패"
        exit 1
    }
fi

# ===========================================
# 4. 공유 파일/디렉토리 링크 (필요시)
# ===========================================
if [ -d "$SHARED_DIR/uploads" ]; then
    log "🔗 공유 디렉토리 링크 생성..."
    rm -rf "$NEW_RELEASE/uploads" 2>/dev/null || true
    ln -s "$SHARED_DIR/uploads" "$NEW_RELEASE/uploads"
fi

if [ -d "$SHARED_DIR/images" ]; then
    log "🔗 공유 이미지 디렉토리 링크 생성..."
    rm -rf "$NEW_RELEASE/images/uploads" 2>/dev/null || true
    mkdir -p "$NEW_RELEASE/images"
    ln -s "$SHARED_DIR/images" "$NEW_RELEASE/images/uploads"
fi

# ===========================================
# 5. 의존성 설치 (필요시)
# ===========================================

# PHP Composer 설치
if [ -f "$REPO_DIR/composer.json" ]; then
    log "📦 Composer 의존성 설치 중..."
    cd "$NEW_RELEASE"
    if command -v composer &> /dev/null; then
        composer install --no-dev --optimize-autoloader --no-interaction || {
            log "⚠️  Composer 설치 실패 (계속 진행)"
        }
    else
        log "⚠️  Composer가 설치되어 있지 않습니다."
    fi
fi

# ===========================================
# 6. 파일 권한 설정
# ===========================================
log "🔒 파일 권한 설정 중..."
chmod -R 755 "$NEW_RELEASE"
find "$NEW_RELEASE" -type f -exec chmod 644 {} \;
find "$NEW_RELEASE" -type d -exec chmod 755 {} \;

# PHP 파일에 실행 권한이 필요한 경우
# find "$NEW_RELEASE" -name "*.php" -exec chmod 755 {} \;

# ===========================================
# 7. 심볼릭 링크 교체 (원자적 배포)
# ===========================================
log "🔄 심볼릭 링크 교체 중..."

# 이전 릴리즈 경로 백업
PREVIOUS_RELEASE=$(readlink -f "$CURRENT_LINK" 2>/dev/null || echo "")

# 새 릴리즈로 심볼릭 링크 교체
ln -sfn "$NEW_RELEASE" "$CURRENT_LINK" || {
    log "❌ 심볼릭 링크 생성 실패"
    exit 1
}

log "✅ 새 릴리즈 활성화: $NEW_RELEASE"

# ===========================================
# 8. 서비스 재시작
# ===========================================

# PHP-FPM 재시작
if systemctl is-active --quiet php8.1-fpm || systemctl is-active --quiet php-fpm; then
    log "🔄 PHP-FPM 재시작 중..."
    sudo systemctl reload php8.1-fpm 2>/dev/null || \
    sudo systemctl reload php-fpm 2>/dev/null || {
        log "⚠️  PHP-FPM 재시작 실패 (계속 진행)"
    }
fi

# Nginx 재시작
log "🔄 Nginx 설정 확인 및 재시작 중..."
if sudo nginx -t 2>/dev/null; then
    sudo systemctl reload nginx || {
        log "❌ Nginx 재시작 실패"
        exit 1
    }
    log "✅ Nginx 재시작 완료"
else
    log "❌ Nginx 설정 오류"
    exit 1
fi

# ===========================================
# 9. 이전 릴리즈 정리
# ===========================================
log "🧹 오래된 릴리즈 정리 중..."
cd "$RELEASES_DIR"

# 최근 5개 릴리즈만 유지
KEEP_COUNT=5
RELEASE_COUNT=$(ls -1 | wc -l)

if [ "$RELEASE_COUNT" -gt "$KEEP_COUNT" ]; then
    ls -t | tail -n +$((KEEP_COUNT + 1)) | while read -r old_release; do
        log "   🗑️  삭제: $old_release"
        rm -rf "$old_release"
    done
else
    log "   ℹ️  유지할 릴리즈 수가 충분합니다."
fi

# ===========================================
# 배포 완료
# ===========================================
log "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "="
log "✅ 배포 완료!"
log "📍 릴리즈: $NEW_RELEASE"
log "📍 커밋: $CURRENT_COMMIT"
log "📍 타임스탬프: $TIMESTAMP"
if [ -n "$PREVIOUS_RELEASE" ]; then
    log "📍 이전 릴리즈: $PREVIOUS_RELEASE"
fi
log "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "="
