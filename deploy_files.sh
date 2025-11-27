#!/bin/bash
set -e

SRC_DIR="$HOME/deploy_queue"
DEST_DIR="/var/www/html"

shopt -s nullglob
files=("$SRC_DIR"/*.php "$SRC_DIR"/*.html)

if [ ${#files[@]} -eq 0 ]; then
  echo "배포할 파일이 없습니다. ($SRC_DIR)"
  exit 0
fi

for file in "${files[@]}"; do
  base=$(basename "$file")
  echo "배포 중: $base"

  sudo mv "$file" "$DEST_DIR/$base"
  sudo chown www-data:www-data "$DEST_DIR/$base"
  sudo chmod 644 "$DEST_DIR/$base"

  echo "완료: $DEST_DIR/$base"
done