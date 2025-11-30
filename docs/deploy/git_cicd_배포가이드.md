# Git 연동 + CI/CD 자동 배포 가이드

리눅스 웹 서버(`/var/www/html` 등)에 매번 수동으로 파일을 올리는 대신, Git과 CI/CD를 이용해 코드를 자동으로 배포하는 전체 과정을 정리했습니다.

---

## 1. 준비 사항

| 구분 | 내용 |
|------|------|
| 로컬 개발 환경 | Git 설치, 소스코드 작업 |
| 원격 Git 저장소 | GitHub / GitLab / 사내 Git 등 |
| 리눅스 웹 서버 | Nginx + PHP/Node 등 실행 중, SSH 접속 가능 |
| 배포 계정 | `deploy` 사용자 등을 별도로 생성 권장 |

---

## 2. 리눅스 서버 준비

1. **배포 사용자 생성**
   ```bash
   sudo adduser deploy
   sudo usermod -aG sudo deploy
   ```

2. **SSH 키 등록 (무암호 접속용)**
   - 로컬 PC에서:
     ```bash
     ssh-keygen -t ed25519 -C "deploy@server"
     # ~/.ssh/id_ed25519.pub 내용을 복사
     ```
   - 리눅스 서버:
     ```bash
     sudo mkdir -p /home/deploy/.ssh
     sudo nano /home/deploy/.ssh/authorized_keys
     # 방금 복사한 공개키를 붙여넣기
     sudo chown -R deploy:deploy /home/deploy/.ssh
     sudo chmod 700 /home/deploy/.ssh
     sudo chmod 600 /home/deploy/.ssh/authorized_keys
     ```

3. **배포 디렉토리 생성**
   ```bash
   sudo mkdir -p /var/www/myapp/releases
   sudo mkdir -p /var/www/myapp/shared
   sudo chown -R deploy:deploy /var/www/myapp
   ```

4. **Nginx root 변경 (예: `/var/www/myapp/current/public`)**
   ```nginx
   server {
       listen 80;
       server_name _;
       root /var/www/myapp/current/public;
       index index.php index.html;
       ...
   }
   ```
   > 초기에는 `current` 심볼릭 링크가 없으므로 `sudo ln -s /var/www/myapp/releases/first /var/www/myapp/current` 형태로 첫 배포 후 연결합니다.

---

## 3. Git 저장소 구성

1. **로컬 프로젝트 초기화**
   ```bash
   cd ~/workspace/myapp
   git init
   git remote add origin git@github.com:username/myapp.git
   git add .
   git commit -m "init"
   git push -u origin main
   ```

2. **서버에 git 설치 및 초기 배포용 clone**
   ```bash
   sudo apt update && sudo apt install git -y
   sudo -u deploy git clone git@github.com:username/myapp.git /var/www/myapp/repo
   ```

3. **빌드/배포 스크립트 템플릿**
   - `/var/www/myapp/deploy.sh`
     ```bash
     #!/bin/bash
     set -e

     APP_DIR="/var/www/myapp"
     REPO_DIR="$APP_DIR/repo"
     RELEASES_DIR="$APP_DIR/releases"
     TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
     NEW_RELEASE="$RELEASES_DIR/$TIMESTAMP"

     cd "$REPO_DIR"
     git fetch origin
     git checkout main
     git pull origin main

     mkdir -p "$NEW_RELEASE"
     rsync -a --excluding=".git" "$REPO_DIR/" "$NEW_RELEASE/"

     ln -sfn "$NEW_RELEASE/public" "$APP_DIR/current"
     ```
   - 권한 부여:
     ```bash
     sudo chown deploy:deploy /var/www/myapp/deploy.sh
     sudo chmod +x /var/www/myapp/deploy.sh
     ```

---

## 4. CI/CD 파이프라인 (GitHub Actions 예시)

1. **서버 SSH 보안 키 발급 (배포 자동화용)**
   ```bash
   # 로컬에서 새 키 생성 (배포용)
   ssh-keygen -t ed25519 -f deploy_ci_cd_key -C "ci@server"
   # 공개키를 서버 /home/deploy/.ssh/authorized_keys 에 추가
   cat deploy_ci_cd_key.pub | ssh deploy@server "cat >> ~/.ssh/authorized_keys"
   ```

2. **GitHub 저장소 Secrets 등록**
   - `Settings` → `Secrets and variables` → `Actions`
   - `DEPLOY_HOST` = `서버 IP`
   - `DEPLOY_USER` = `deploy`
   - `DEPLOY_KEY` = `deploy_ci_cd_key` **개인키 전체 복사**
   - 추가로 필요하면 `DEPLOY_PATH` 등 정의

3. **`.github/workflows/deploy.yml` 작성**
   ```yaml
   name: Deploy to Server

   on:
     push:
       branches: [ "main" ]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3

         - name: Run remote deploy script
           uses: appleboy/ssh-action@v1.0.3
           with:
             host: ${{ secrets.DEPLOY_HOST }}
             username: ${{ secrets.DEPLOY_USER }}
             key: ${{ secrets.DEPLOY_KEY }}
             script: |
               cd /var/www/myapp
               ./deploy.sh
   ```

4. **테스트**
   - main 브랜치에 push → GitHub Actions에서 배포 로그 확인
   - 서버 `/var/www/myapp/releases/<timestamp>` 생성 여부 확인

---

## 5. 선택 기능

- **failover/rollback**: `ln -sfn` 의 이전 릴리즈 링크를 기억해두고, 문제가 생기면 이전 릴리즈에 링크 교체.
- **환경변수/민감정보 분리**: `/var/www/myapp/shared/.env` 등을 두고 배포 후 심볼릭 링크 연동.
- **서버 내 자동 빌드**: `deploy.sh` 에 `npm install && npm run build` 등 명령 추가.
- **Node/PHP Composer 등**: 빌드/설치 과정 포함 가능.
- **Zero-downtime**: `systemctl reload php-fpm`, `nginx -s reload` 등을 스크립트에 포함해 자동 재시작.

---

## 6. 전체 흐름 요약

1. 로컬에서 기능 개발 → `git push origin main`
2. GitHub Actions 트리거 → SSH로 서버 접속 → `deploy.sh` 실행
3. 서버에서 최신 코드로 새 릴리즈 생성 → 심볼릭 링크 교체
4. Nginx가 `current/public`을 바라보므로 새 버전이 즉시 배포

이 구조를 적용하면 파일을 직접 FTP로 옮길 필요가 없고, 프론트엔드/백엔드 어느 프로젝트든 일관된 방식으로 자동 배포할 수 있습니다.

