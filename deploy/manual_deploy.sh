#!/bin/bash
# ===========================================
# 수동 배포 스크립트 (Git 없을 때 사용)
# FTP 또는 SCP로 파일을 받은 후 실행
# ===========================================

set -e

# 설정 변수
DEPLOY_QUEUE="$HOME/deploy_queue"
WEB_ROOT="/var/www/myapp/current/public"

# WEB_ROOT가 없는 경우 기본 경로 사용
if [ ! -d "$WEB_ROOT" ]; then
    WEB_ROOT="/var/www/html"
    log "⚠️  $WEB_ROOT가 없어 기본 경로 사용: $WEB_ROOT"
fi

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "📦 수동 배포 시작..."

# 배포 큐 디렉토리 확인
if [ ! -d "$DEPLOY_QUEUE" ]; then
    log "❌ 배포 큐 디렉토리가 없습니다: $DEPLOY_QUEUE"
    log "   디렉토리를 생성합니다..."
    mkdir -p "$DEPLOY_QUEUE"
fi

# 배포할 파일 찾기
files=$(find "$DEPLOY_QUEUE" -type f \( -name "*.html" -o -name "*.php" -o -name "*.css" -o -name "*.js" -o -name "*.jpg" -o -name "*.png" -o -name "*.gif" -o -name "*.svg" \) 2>/dev/null || true)

if [ -z "$files" ]; then
    log "❌ 배포할 파일이 없습니다: $DEPLOY_QUEUE"
    log "   FTP 또는 SCP로 파일을 $DEPLOY_QUEUE 디렉토리에 복사하세요."
    exit 0
fi

log "📋 배포할 파일 목록:"
echo "$files" | while read -r file; do
    filename=$(basename "$file")
    echo "   - $filename"
done

# 배포 실행
deploy_count=0
echo "$files" | while read -r file; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        
        # 서브디렉토리 구조 유지 (선택적)
        relative_path=$(echo "$file" | sed "s|$DEPLOY_QUEUE/||")
        target_dir="$WEB_ROOT/$(dirname "$relative_path")"
        
        # 서브디렉토리가 있으면 생성
        if [ "$target_dir" != "$WEB_ROOT/." ]; then
            sudo mkdir -p "$target_dir"
        else
            target_dir="$WEB_ROOT"
        fi
        
        target_file="$target_dir/$filename"
        
        log "   → 배포 중: $filename → $target_file"
        
        # 파일 복사
        sudo cp "$file" "$target_file" || {
            log "   ❌ 복사 실패: $filename"
            continue
        }
        
        # 권한 설정
        sudo chown www-data:www-data "$target_file" || sudo chown nginx:nginx "$target_file" || true
        sudo chmod 644 "$target_file"
        
        deploy_count=$((deploy_count + 1))
        log "   ✅ 완료: $filename"
    fi
done

log "📊 총 $deploy_count 개 파일 배포 완료"

# Nginx 재시작
log "🔄 Nginx 재시작 중..."
if sudo nginx -t 2>/dev/null; then
    sudo systemctl reload nginx || {
        log "❌ Nginx 재시작 실패"
        exit 1
    }
    log "✅ Nginx 재시작 완료"
else
    log "⚠️  Nginx 설정 테스트 실패 (계속 진행)"
fi

# 배포 큐 비우기
log "🧹 배포 큐 정리 중..."
rm -f "$DEPLOY_QUEUE"/*.html "$DEPLOY_QUEUE"/*.php "$DEPLOY_QUEUE"/*.css "$DEPLOY_QUEUE"/*.js 2>/dev/null || true

log "✅ 수동 배포 완료!"
log "📍 배포 위치: $WEB_ROOT"
