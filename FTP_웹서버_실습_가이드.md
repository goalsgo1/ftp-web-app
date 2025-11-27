# FTP & 웹 서버 실습 가이드

## 📋 실습 목표
- 윈도우에서 HTML 파일 생성
- FTP 서버를 통한 파일 전송
- 리눅스에서 파일 수신 및 웹 서버 설정
- 웹 브라우저를 통한 페이지 확인

---

## 🖥️ 실습 환경
- **윈도우**: FTP 서버 실행 및 HTML 파일 생성
- **리눅스**: FTP 클라이언트 및 웹 서버 (Nginx)

---

## 📝 실습 단계

### 1단계: 윈도우에서 HTML 파일 생성

#### 1-1. HTML 파일 확인
- 파일 위치: `C:\FTP\index.html`
- 파일이 이미 생성되어 있어야 합니다.

#### 1-2. FTP 서버 홈 디렉토리 확인
- Home FTP Server에서 사용자 설정 확인
- 홈 디렉토리: `C:\WFTP` (또는 설정한 경로)

#### 1-3. HTML 파일을 FTP 서버 디렉토리로 복사
**방법 1: 명령 프롬프트 사용**
```cmd
copy C:\FTP\index.html C:\WFTP\index.html
```

**방법 2: 파일 탐색기 사용**
- `C:\FTP\index.html` 파일을 복사
- `C:\WFTP` 폴더에 붙여넣기

---

### 2단계: 윈도우에서 FTP 서버 실행

#### 2-1. Home FTP Server 실행
1. Home FTP Server 프로그램 실행
2. 사용자 계정 확인/생성
   - 사용자명: `need`
   - 비밀번호: `need`
   - 홈 디렉토리: `C:\WFTP`
3. "Start Server" 버튼 클릭
4. 서버 상태 확인: 하단에 "Running" 표시 확인

#### 2-2. FTP 서버 정보 확인
- 서버 IP 주소 확인 (예: `172.30.1.42`)
- 포트 번호 확인 (기본: 21)

---

### 3단계: 리눅스에서 FTP 접속 및 파일 다운로드

#### 3-1. FTP 서버 접속
```bash
ftp <윈도우_IP주소>
# 예시: ftp 172.30.1.42
```

#### 3-2. 로그인
```
Name (172.30.1.42:testadmin): need
Password: need
```

#### 3-3. 파일 목록 확인
```bash
ftp> ls
```

**확인 사항:**
- `index.html` 파일이 목록에 보여야 합니다.
- 파일 크기: 약 5642 bytes

#### 3-4. 파일 다운로드
```bash
ftp> get index.html
```

**성공 메시지 예시:**
```
226 Closing data connection.
5642 bytes received in 00:00 (10.09 MiB/s)
```

#### 3-5. FTP 세션 종료
```bash
ftp> quit
```

#### 3-6. 다운로드 확인
```bash
ls -l ~/index.html
```

**확인 사항:**
- 파일이 홈 디렉토리(`/home/testadmin/`)에 있는지 확인
- 파일 크기가 5642 bytes인지 확인

---

### 3-7. 여러 파일 전송하기 (고급)

**상황:** HTML 페이지가 여러 개이고, CSS, JavaScript, 이미지 파일 등이 많은 경우

#### 방법 1: FTP에서 디렉토리 전체 전송 (권장)

**윈도우에서:**
1. 웹사이트 파일들을 하나의 폴더에 정리
   - 예: `C:\FTP\website\` 폴더에 모든 파일 저장
   - 구조 예시:
     ```
     C:\FTP\website\
     ├── index.html
     ├── about.html
     ├── contact.html
     ├── css/
     │   └── style.css
     ├── js/
     │   └── script.js
     └── images/
         └── logo.png
     ```

2. FTP 서버 홈 디렉토리에 폴더 복사
   ```cmd
   xcopy C:\FTP\website C:\WFTP\website /E /I
   ```

**리눅스에서 FTP 접속:**
```bash
ftp <윈도우_IP주소>
# 로그인 후

# 디렉토리 구조 확인
ftp> ls
ftp> cd website
ftp> ls

# 재귀적으로 모든 파일 다운로드 (mget 사용)
ftp> binary
ftp> prompt off
ftp> mget *
ftp> cd css
ftp> mget *
ftp> cd ../js
ftp> mget *
ftp> cd ../images
ftp> mget *
```

#### 방법 2: 압축 파일로 전송 (가장 효율적) ⭐

**윈도우에서:**
1. 웹사이트 폴더를 ZIP으로 압축
   ```cmd
   # PowerShell에서
   Compress-Archive -Path C:\FTP\website -DestinationPath C:\FTP\website.zip
   
   # 또는 파일 탐색기에서 우클릭 → 보내기 → 압축 폴더
   ```

2. ZIP 파일을 FTP 서버 디렉토리로 복사
   ```cmd
   copy C:\FTP\website.zip C:\WFTP\website.zip
   ```

**리눅스에서:**
```bash
# FTP 접속
ftp <윈도우_IP주소>
# 로그인 후

# ZIP 파일 다운로드
ftp> get website.zip
ftp> quit

# ZIP 파일 압축 해제
unzip website.zip

# 또는
unzip website.zip -d website

# 압축 해제된 파일 확인
ls -R website/

# 웹 서버 디렉토리로 전체 복사
sudo cp -r website/* /var/www/html/
# 또는
sudo mv website/* /var/www/html/
```

#### 방법 3: wget으로 디렉토리 전체 다운로드

```bash
# FTP 디렉토리 전체 다운로드 (재귀적)
wget -r ftp://need:need@<윈도우_IP주소>/website/

# 또는 특정 파일만
wget -r -A "*.html,*.css,*.js" ftp://need:need@<윈도우_IP주소>/website/
```

#### 방법 4: SCP/SFTP 사용 (SSH가 활성화된 경우)

```bash
# 리눅스에서 윈도우로 파일 전송 (SSH 필요)
scp -r user@윈도우_IP:/path/to/website /home/testadmin/

# 또는 SFTP 사용
sftp user@윈도우_IP
sftp> get -r website
```

#### 방법 5: rsync 사용 (동기화 도구)

```bash
# rsync 설치
sudo apt install rsync

# FTP 대신 rsync로 동기화 (SSH 필요)
rsync -avz user@윈도우_IP:/path/to/website/ /var/www/html/
```

---

### 4단계: 리눅스에서 Nginx 웹 서버 설치

#### 4-1. 패키지 목록 업데이트
```bash
sudo apt update
```

#### 4-2. Nginx 설치
```bash
sudo apt install nginx -y
```

#### 4-3. Nginx 서비스 시작
```bash
sudo systemctl start nginx
```

#### 4-4. 부팅 시 자동 시작 설정
```bash
sudo systemctl enable nginx
```

#### 4-5. Nginx 상태 확인
```bash
sudo systemctl status nginx
```

**정상 상태 확인:**
- `Active: active (running)` 표시 확인
- `enabled` 상태 확인

---

### 5단계: HTML 파일을 웹 서버 디렉토리로 이동

#### 5-1. 단일 파일 이동
```bash
sudo mv ~/index.html /var/www/html/
```

#### 5-2. 여러 파일/폴더 전체 이동 (권장)

**방법 1: 디렉토리 전체 복사**
```bash
# 압축 해제된 website 폴더가 있는 경우
sudo cp -r ~/website/* /var/www/html/

# 또는 디렉토리 구조 유지하며 이동
sudo cp -r ~/website /var/www/html/
```

**방법 2: 특정 파일만 선택적으로 복사**
```bash
# HTML 파일만 복사
sudo cp ~/website/*.html /var/www/html/

# HTML, CSS, JS 파일 복사
sudo cp ~/website/*.{html,css,js} /var/www/html/

# 하위 디렉토리 포함 모든 파일 복사
sudo cp -r ~/website/css /var/www/html/
sudo cp -r ~/website/js /var/www/html/
sudo cp -r ~/website/images /var/www/html/
```

**방법 3: 기존 파일 덮어쓰기**
```bash
# 기존 파일이 있어도 덮어쓰기
sudo cp -r ~/website/* /var/www/html/

# 또는 기존 파일 백업 후 복사
sudo mv /var/www/html/index.html /var/www/html/index.html.bak
sudo cp ~/website/* /var/www/html/
```

#### 5-3. 파일 위치 및 구조 확인
```bash
# 단일 파일 확인
ls -l /var/www/html/index.html

# 전체 디렉토리 구조 확인
ls -R /var/www/html/

# 또는 트리 구조로 확인 (tree 명령어 설치 필요)
sudo apt install tree
tree /var/www/html/
```

#### 5-4. 파일 권한 설정 (중요!)

**단일 파일:**
```bash
sudo chmod 644 /var/www/html/index.html
```

**여러 파일/폴더 전체:**
```bash
# 모든 파일에 읽기 권한 부여
sudo find /var/www/html -type f -exec chmod 644 {} \;

# 모든 디렉토리에 실행 권한 부여
sudo find /var/www/html -type d -exec chmod 755 {} \;

# 또는 한 번에
sudo chmod -R 644 /var/www/html/
sudo find /var/www/html -type d -exec chmod 755 {} \;
```

**권한 설명:**
- `644`: 파일 - 소유자 읽기/쓰기, 그룹/기타 읽기
- `755`: 디렉토리 - 소유자 읽기/쓰기/실행, 그룹/기타 읽기/실행

#### 5-5. 소유자 변경 (선택사항)
```bash
# www-data 사용자로 소유자 변경 (Nginx 기본 사용자)
sudo chown -R www-data:www-data /var/www/html/
```

---

### 6단계: 방화벽 설정 (필요한 경우)

#### 6-0. 방화벽 필요 여부 확인

**방화벽이 실행 중인지 확인:**
```bash
# UFW 방화벽 상태 확인
sudo ufw status
```

**결과에 따른 판단:**
- `Status: active` → 방화벽이 실행 중이므로 설정 필요 (6-1로 진행)
- `Status: inactive` → 방화벽이 비활성화되어 있으므로 설정 불필요 (6단계 건너뛰기)
- `ufw: command not found` → UFW가 설치되지 않았으므로 설정 불필요 (6단계 건너뛰기)

**다른 방화벽 확인 (iptables 사용 시):**
```bash
# iptables 규칙 확인
sudo iptables -L -n | grep 80
```

**방화벽이 없는 경우:**
- 로컬 네트워크에서만 접속하는 경우 방화벽 설정이 필요 없을 수 있습니다.
- 외부에서 접속해야 하는 경우에만 방화벽 설정이 필요합니다.

#### 6-1. UFW 방화벽 사용 시
```bash
# HTTP 포트 (80) 허용
sudo ufw allow 'Nginx Full'
# 또는
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

#### 6-2. 방화벽 설정 후 확인
```bash
# 방화벽 상태 확인
sudo ufw status

# 특정 포트가 열려있는지 확인
sudo ufw status | grep 80
```

---

### 7단계: 웹 서버 접속 확인

#### 7-1. 리눅스 서버 IP 주소 확인
```bash
hostname -I
```

**중요:** 
- 출력된 IP 주소를 정확히 기록하세요.
- 예시: `192.168.73.136`
- **브라우저에서 접속할 때 이 IP 주소를 사용해야 합니다!**

**여러 IP 주소가 표시되는 경우:**
- 첫 번째 IP 주소를 사용하거나
- `ip addr show` 명령어로 네트워크 인터페이스별 IP 확인

#### 7-2. 로컬에서 테스트
```bash
curl http://localhost
```

**성공 시:**
- HTML 소스 코드가 출력됩니다.
- 이 단계가 성공하면 Nginx는 정상 작동 중입니다.

#### 7-3. 브라우저에서 접속
- **리눅스 서버에서 직접 접속:**
  - `http://localhost`
  - `http://127.0.0.1`

- **다른 컴퓨터(윈도우)에서 접속:**
  - `http://리눅스_IP주소` (7-1에서 확인한 IP 주소 사용)
  - 예: `http://192.168.73.136` (실제 IP 주소 사용)
  - ❌ 잘못된 예: `http://172.30.1.43` (다른 IP 주소)

**접속 시 주의사항:**
- IP 주소 앞에 `http://`를 반드시 붙여야 합니다.
- 포트 번호는 기본 80번이므로 생략 가능합니다.
- `https://`가 아닌 `http://`를 사용해야 합니다.

**확인 사항:**
- "FTP & 웹 서버 학습" 페이지가 정상적으로 표시되는지 확인
- 실시간 서버 시간이 표시되는지 확인

---

## 🔧 문제 해결

### 문제 1: FTP 접속 실패
**해결 방법:**
- 윈도우 방화벽에서 FTP 포트 허용 확인
- FTP 서버가 실행 중인지 확인
- IP 주소가 올바른지 확인

### 문제 2: index.html 파일이 FTP 서버에 보이지 않음
**해결 방법:**
- 파일이 `C:\WFTP` 디렉토리에 있는지 확인
- FTP 서버 홈 디렉토리 설정 확인
- 파일을 올바른 디렉토리로 복사

### 문제 3: Nginx가 시작되지 않음
**해결 방법:**
```bash
# Nginx 설정 파일 테스트
sudo nginx -t

# 에러 로그 확인
sudo tail -f /var/log/nginx/error.log

# Nginx 재시작
sudo systemctl restart nginx
```

### 문제 4: 웹 페이지가 표시되지 않음
**해결 방법:**
```bash
# 파일이 올바른 위치에 있는지 확인
ls -l /var/www/html/index.html

# Nginx 상태 확인
sudo systemctl status nginx

# 로컬에서 접속 테스트 (방화벽과 무관)
curl http://localhost

# 방화벽 설정 확인
sudo ufw status

# 방화벽이 활성화되어 있고 포트가 막혀있는 경우
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/error.log
```

**방화벽 문제 진단:**
- `curl http://localhost` → 성공: Nginx는 정상, 방화벽 문제 가능성
- `curl http://localhost` → 실패: Nginx 설정 문제
- 외부에서 접속 불가 + 로컬 접속 성공 → 방화벽 문제 확실

### 문제 5: ERR_CONNECTION_TIMED_OUT 오류 (연결 시간 초과)

**오류 메시지:**
- 브라우저에서 `사이트에 연결할 수 없음`
- `172.30.1.43에서 응답하는 데 시간이 너무 오래 걸립니다`
- `ERR_CONNECTION_TIMED_OUT`

**단계별 진단 방법:**

#### 1단계: 리눅스 서버에서 로컬 접속 테스트
```bash
# 리눅스 서버에서 직접 접속 테스트
curl http://localhost

# 또는
curl http://127.0.0.1
```

**결과 해석:**
- ✅ **성공 (HTML 출력)**: Nginx는 정상 작동 중 → 방화벽 또는 네트워크 문제
- ❌ **실패**: Nginx 문제 → 문제 3 참조

#### 2단계: Nginx 상태 확인
```bash
sudo systemctl status nginx
```

**확인 사항:**
- `Active: active (running)` 여부 확인
- 실행 중이 아니면: `sudo systemctl start nginx`

#### 3단계: 방화벽 확인 및 설정
```bash
# 방화벽 상태 확인
sudo ufw status

# 방화벽이 active인 경우 포트 허용
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 방화벽 규칙 확인
sudo ufw status numbered
```

#### 4단계: 리눅스 서버 IP 주소 확인
```bash
# IP 주소 확인
hostname -I

# 또는
ip addr show
```

**확인 사항:**
- 브라우저에서 입력한 IP 주소와 일치하는지 확인
- **중요:** `hostname -I`로 확인한 IP 주소를 정확히 사용해야 합니다!
- 예: 출력이 `192.168.73.136`이면 브라우저에서도 `http://192.168.73.136` 사용
- ❌ 잘못된 IP 주소 사용 시 연결 시간 초과 오류 발생

**일반적인 실수:**
- FTP 서버 IP와 웹 서버 IP를 혼동
- 이전에 사용했던 IP 주소를 그대로 사용
- **해결:** 항상 `hostname -I`로 현재 IP 주소를 확인하세요!

#### 5단계: 리눅스 서버에서 포트 리스닝 확인
```bash
# 80번 포트가 열려있는지 확인
sudo netstat -tlnp | grep :80

# 또는
sudo ss -tlnp | grep :80
```

**정상 결과 예시:**
```
tcp  0  0  0.0.0.0:80  0.0.0.0:*  LISTEN  1782/nginx
```

#### 6단계: 윈도우에서 포트 연결 테스트
**윈도우 명령 프롬프트에서:**
```cmd
# 포트 연결 테스트
telnet 172.30.1.43 80
```

**또는 PowerShell에서:**
```powershell
Test-NetConnection -ComputerName 172.30.1.43 -Port 80
```

**결과 해석:**
- ✅ **연결 성공**: 포트는 열려있음 → 브라우저 캐시 문제 가능성
- ❌ **연결 실패**: 방화벽 또는 네트워크 문제

#### 7단계: 리눅스 서버 방화벽 완전 비활성화 (테스트용)
```bash
# 임시로 방화벽 비활성화 (테스트용)
sudo ufw disable

# 테스트 후 다시 활성화
sudo ufw enable
```

**주의:** 테스트 후에는 반드시 다시 활성화하고 필요한 포트만 열어야 합니다.

#### 8단계: Nginx 설정 확인
```bash
# Nginx 설정 파일 문법 확인
sudo nginx -t

# Nginx 기본 설정 확인
cat /etc/nginx/sites-available/default | grep -A 5 "listen"
```

**해결 방법 요약:**
1. ✅ Nginx가 실행 중인지 확인 → `sudo systemctl start nginx`
2. ✅ 방화벽에서 80번 포트 허용 → `sudo ufw allow 80/tcp`
3. ✅ IP 주소가 올바른지 확인 → `hostname -I`
4. ✅ 포트가 리스닝 중인지 확인 → `sudo netstat -tlnp | grep :80`
5. ✅ 브라우저 캐시 삭제 후 재시도

---

## 📚 주요 명령어 요약

### FTP 관련
```bash
# FTP 접속
ftp <IP주소>

# 파일 목록
ls

# 파일 다운로드
get <파일명>

# FTP 종료
quit
```

### Nginx 관련
```bash
# Nginx 설치
sudo apt install nginx -y

# Nginx 시작
sudo systemctl start nginx

# Nginx 자동 시작 설정
sudo systemctl enable nginx

# Nginx 상태 확인
sudo systemctl status nginx

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 중지
sudo systemctl stop nginx
```

### 파일 관리
```bash
# 단일 파일 이동
sudo mv ~/index.html /var/www/html/

# 여러 파일/폴더 전체 복사
sudo cp -r ~/website/* /var/www/html/

# 파일 확인
ls -l /var/www/html/index.html

# 디렉토리 구조 확인
ls -R /var/www/html/

# 파일 권한 변경 (단일 파일)
sudo chmod 644 /var/www/html/index.html

# 여러 파일 권한 일괄 변경
sudo find /var/www/html -type f -exec chmod 644 {} \;
sudo find /var/www/html -type d -exec chmod 755 {} \;

# 소유자 변경
sudo chown -R www-data:www-data /var/www/html/
```

### 여러 파일 전송 (FTP)
```bash
# FTP에서 여러 파일 다운로드
ftp <IP주소>
ftp> binary
ftp> prompt off
ftp> mget *

# 압축 파일 다운로드 및 압축 해제
ftp> get website.zip
ftp> quit
unzip website.zip
sudo cp -r website/* /var/www/html/

# wget으로 디렉토리 전체 다운로드
wget -r ftp://user:password@<IP주소>/website/
```

---

## ✅ 실습 체크리스트

- [ ] 윈도우에서 HTML 파일 생성 완료
- [ ] HTML 파일을 FTP 서버 디렉토리로 복사 완료
- [ ] FTP 서버 실행 및 접속 확인 완료
- [ ] 리눅스에서 FTP 접속 성공
- [ ] index.html 파일 다운로드 완료
- [ ] Nginx 설치 완료
- [ ] Nginx 서비스 시작 및 자동 시작 설정 완료
- [ ] HTML 파일을 웹 서버 디렉토리로 이동 완료
- [ ] 방화벽 설정 완료 (필요한 경우)
- [ ] 웹 브라우저에서 페이지 확인 완료

---

## 🎓 학습 내용 정리

### FTP (File Transfer Protocol)
- 파일 전송 프로토콜
- 클라이언트-서버 모델 사용
- 텍스트/바이너리 파일 전송 지원

### Nginx
- 고성능 웹 서버 및 리버스 프록시
- 비동기 이벤트 기반 아키텍처
- 정적 파일 서빙에 최적화
- 기본 웹 루트: `/var/www/html/`

### 웹 서버 동작 원리
1. 클라이언트가 HTTP 요청 (브라우저)
2. 웹 서버가 요청 처리
3. 웹 루트 디렉토리에서 파일 찾기
4. HTML 파일을 클라이언트에 전송
5. 브라우저가 HTML 렌더링

---

## 📌 참고 사항

- FTP 서버의 홈 디렉토리와 실제 파일 위치가 일치해야 합니다.
- Nginx는 기본적으로 80번 포트를 사용합니다.
- 방화벽 설정이 필요할 수 있습니다.
- 파일 권한이 올바르게 설정되어 있어야 합니다.

---

## 📁 웹 프로젝트 파일 저장 위치 가이드

### 프로젝트 구조 예시

```
/var/www/html/
├── index.html          # 메인 페이지
├── about.html          # 서브 페이지
├── contact.html        # 서브 페이지
├── css/                # 스타일시트
│   ├── style.css
│   └── reset.css
├── js/                 # JavaScript 파일
│   ├── main.js
│   └── utils.js
├── images/             # 이미지 파일 (정적)
│   ├── logo.png
│   ├── banner.jpg
│   └── icons/
├── uploads/            # 사용자 업로드 파일 (동적)
│   ├── photos/
│   └── documents/
└── data/               # 데이터 파일 (선택사항)
    └── config.json
```

---

### 1. 정적 파일 저장 위치

**정의:** 웹사이트를 구성하는 기본 파일들 (HTML, CSS, JS, 이미지 등)

**저장 위치:**
```bash
/var/www/html/
```

**파일 종류:**
- HTML 파일: `/var/www/html/*.html`
- CSS 파일: `/var/www/html/css/`
- JavaScript 파일: `/var/www/html/js/`
- 이미지 파일: `/var/www/html/images/`
- 폰트 파일: `/var/www/html/fonts/`
- 아이콘 파일: `/var/www/html/icons/`

**예시:**
```bash
# 프로젝트 구조 생성
sudo mkdir -p /var/www/html/{css,js,images,fonts}

# 파일 복사
sudo cp style.css /var/www/html/css/
sudo cp script.js /var/www/html/js/
sudo cp logo.png /var/www/html/images/
```

**HTML에서 참조:**
```html
<!-- CSS -->
<link rel="stylesheet" href="/css/style.css">

<!-- JavaScript -->
<script src="/js/main.js"></script>

<!-- 이미지 -->
<img src="/images/logo.png" alt="Logo">
```

---

### 2. 사용자 업로드 파일 저장 위치 (동적 파일)

**정의:** 사용자가 업로드한 파일 (사진, 문서 등)

**저장 위치 옵션:**

#### 옵션 1: 웹 루트 내부 (간단하지만 보안 주의)
```bash
/var/www/html/uploads/
```

#### 옵션 2: 웹 루트 외부 (권장) ⭐
```bash
/var/www/uploads/
# 또는
/home/www/uploads/
```

**왜 웹 루트 외부에 저장하나요?**
- 보안: 직접 URL 접근 제한 가능
- 관리: 웹 서버 재설치 시 데이터 보존
- 권한: 별도 권한 관리 가능

**디렉토리 생성:**
```bash
# 웹 루트 외부에 업로드 디렉토리 생성
sudo mkdir -p /var/www/uploads/{photos,documents}

# 권한 설정
sudo chown -R www-data:www-data /var/www/uploads/
sudo chmod -R 755 /var/www/uploads/
```

**Nginx 설정으로 접근 제어:**
```nginx
# /etc/nginx/sites-available/default 수정
location /uploads/ {
    alias /var/www/uploads/;
    # 또는 특정 파일만 허용
    # location ~* \.(jpg|jpeg|png|gif)$ {
    #     allow all;
    # }
}
```

---

### 3. 데이터베이스 저장 위치

**정의:** 텍스트 데이터, 사용자 정보, 게시글 등

**저장 방식:**

#### MySQL/MariaDB
```bash
# 데이터베이스 설치
sudo apt install mysql-server

# 데이터는 자동으로 저장됨
# 위치: /var/lib/mysql/
```

#### SQLite (간단한 프로젝트)
```bash
# SQLite 데이터베이스 파일 위치
/var/www/html/data/database.db

# 또는 웹 루트 외부
/var/www/data/database.db
```

#### JSON 파일 (매우 간단한 프로젝트)
```bash
# JSON 파일로 데이터 저장
/var/www/html/data/posts.json
/var/www/html/data/users.json

# 또는 웹 루트 외부
/var/www/data/posts.json
```

**예시:**
```bash
# 데이터 디렉토리 생성
sudo mkdir -p /var/www/data
sudo chown www-data:www-data /var/www/data/
sudo chmod 755 /var/www/data/
```

---

### 4. 로그 파일 저장 위치

**정의:** 웹사이트 접근 로그, 에러 로그 등

**저장 위치:**
```bash
# Nginx 접근 로그
/var/log/nginx/access.log

# Nginx 에러 로그
/var/log/nginx/error.log

# 애플리케이션 로그 (프로젝트별)
/var/www/logs/app.log
# 또는
/home/www/logs/app.log
```

---

### 5. 실제 프로젝트 예시

#### 예시 1: 블로그 사이트
```
/var/www/html/
├── index.html
├── post.html
├── css/
│   └── blog.css
├── js/
│   └── blog.js
└── images/
    └── posts/          # 게시글 이미지 (정적)
        └── post1.jpg

/var/www/uploads/
└── avatars/            # 사용자 프로필 사진 (동적)
    └── user123.jpg

/var/www/data/
└── blog.db             # SQLite 데이터베이스
```

#### 예시 2: 갤러리 사이트
```
/var/www/html/
├── index.html
├── gallery.html
├── css/
├── js/
└── images/
    └── thumbnails/     # 썸네일 (정적)

/var/www/uploads/
└── photos/             # 사용자 업로드 사진 (동적)
    ├── 2025/
    │   └── 11/
    │       └── photo1.jpg
    └── 2025/
        └── 11/
            └── photo2.jpg
```

---

### 6. 권장 저장 구조 (보안 고려)

```
/var/www/
├── html/               # 웹 루트 (정적 파일만)
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── images/         # 정적 이미지
│
├── uploads/            # 사용자 업로드 (웹 루트 외부)
│   ├── photos/
│   └── documents/
│
├── data/               # 데이터베이스/설정 파일
│   └── app.db
│
└── logs/               # 로그 파일
    └── app.log
```

**디렉토리 생성 스크립트:**
```bash
#!/bin/bash
# 프로젝트 구조 생성

sudo mkdir -p /var/www/html/{css,js,images,fonts}
sudo mkdir -p /var/www/uploads/{photos,documents}
sudo mkdir -p /var/www/data
sudo mkdir -p /var/www/logs

# 권한 설정
sudo chown -R www-data:www-data /var/www/html/
sudo chown -R www-data:www-data /var/www/uploads/
sudo chown -R www-data:www-data /var/www/data/
sudo chown -R www-data:www-data /var/www/logs/

sudo chmod -R 755 /var/www/html/
sudo chmod -R 755 /var/www/uploads/
sudo chmod -R 755 /var/www/data/
sudo chmod -R 755 /var/www/logs/

echo "프로젝트 구조 생성 완료!"
```

---

### 7. 파일 업로드 처리 (PHP 예시)

**PHP로 파일 업로드:**
```php
<?php
// 업로드 디렉토리
$upload_dir = '/var/www/uploads/photos/';

// 파일 업로드 처리
if ($_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $tmp_name = $_FILES['photo']['tmp_name'];
    $name = basename($_FILES['photo']['name']);
    $destination = $upload_dir . date('Y/m/') . $name;
    
    // 디렉토리 생성
    $dir = dirname($destination);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    
    // 파일 이동
    move_uploaded_file($tmp_name, $destination);
    echo "업로드 성공: " . $destination;
}
?>
```

---

### 8. 요약

| 파일 종류 | 저장 위치 | 접근 방식 |
|----------|----------|----------|
| **정적 파일** (HTML, CSS, JS, 이미지) | `/var/www/html/` | 직접 URL 접근 가능 |
| **업로드 파일** (사용자 사진, 문서) | `/var/www/uploads/` | 웹 루트 외부 권장 |
| **데이터베이스** | `/var/lib/mysql/` 또는 `/var/www/data/` | 애플리케이션을 통해서만 |
| **로그 파일** | `/var/log/nginx/` 또는 `/var/www/logs/` | 서버 관리자만 접근 |

**핵심 원칙:**
1. ✅ 정적 파일은 웹 루트 내부 (`/var/www/html/`)
2. ✅ 동적 파일(업로드)은 웹 루트 외부 (`/var/www/uploads/`)
3. ✅ 데이터베이스는 별도 디렉토리 (`/var/www/data/`)
4. ✅ 적절한 권한 설정 필수

---

## 💾 디스크 공간 관리 및 확장 가이드

### ⚠️ VMware 가상머신 디스크 크기 제한

**문제 상황:**
- VMware로 생성한 리눅스 가상머신이 20GB로 설정된 경우
- 웹서버에 동영상, 대용량 파일 업로드 시 공간 부족 발생
- 20GB를 초과하면 **더 이상 저장할 수 없습니다!**

---

### 1. 현재 디스크 사용량 확인

#### 1-1. 전체 디스크 사용량 확인
```bash
# 디스크 사용량 확인 (가장 많이 사용)
df -h

# 출력 예시:
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sda1        20G   15G  4.2G  79% /
```

**확인 사항:**
- `Size`: 전체 디스크 크기 (20G)
- `Used`: 사용 중인 공간 (15G)
- `Avail`: 사용 가능한 공간 (4.2G)
- `Use%`: 사용률 (79%)

#### 1-2. 디렉토리별 사용량 확인
```bash
# 루트 디렉토리부터 각 폴더별 사용량
sudo du -h --max-depth=1 / | sort -hr

# 특정 디렉토리 확인
sudo du -sh /var/www/*
sudo du -sh /home/*
sudo du -sh /var/log/*
```

#### 1-3. 큰 파일 찾기
```bash
# 100MB 이상 파일 찾기
sudo find / -type f -size +100M -exec ls -lh {} \;

# 1GB 이상 파일 찾기
sudo find / -type f -size +1G -exec ls -lh {} \;
```

---

### 2. 디스크 공간 확장 방법

#### 방법 1: VMware에서 가상 디스크 확장 (권장) ⭐

**VMware Workstation/Player에서:**

1. **가상머신 종료** (필수!)
   - 리눅스 가상머신을 완전히 종료

2. **디스크 확장**
   - VMware에서 가상머신 선택
   - `Edit virtual machine settings` (가상머신 설정 편집)
   - `Hard Disk` 선택
   - `Expand` 버튼 클릭
   - 원하는 크기 입력 (예: 50GB, 100GB)
   - `Expand` 클릭

3. **리눅스에서 파티션 확장**
```bash
# 파티션 정보 확인
sudo fdisk -l

# LVM 사용 시 (일반적)
sudo pvresize /dev/sda1
sudo lvextend -l +100%FREE /dev/mapper/ubuntu--vg-ubuntu--lv
sudo resize2fs /dev/mapper/ubuntu--vg-ubuntu--lv

# 또는 ext4 파일시스템 직접 확장
sudo resize2fs /dev/sda1

# 확인
df -h
```

**주의:** 
- 가상머신이 실행 중이면 확장 불가
- 백업 권장 (데이터 손실 위험)

#### 방법 2: 새 가상 디스크 추가

**VMware에서:**
1. 가상머신 설정 → `Add` → `Hard Disk`
2. 새 디스크 추가 (예: 50GB)
3. 리눅스에서 마운트

**리눅스에서:**
```bash
# 새 디스크 확인
sudo fdisk -l

# 파티션 생성
sudo fdisk /dev/sdb
# n (new), p (primary), Enter, Enter, w (write)

# 파일시스템 생성
sudo mkfs.ext4 /dev/sdb1

# 마운트 포인트 생성
sudo mkdir -p /mnt/storage

# 마운트
sudo mount /dev/sdb1 /mnt/storage

# 자동 마운트 설정
echo '/dev/sdb1 /mnt/storage ext4 defaults 0 2' | sudo tee -a /etc/fstab

# 웹 업로드 디렉토리로 사용
sudo ln -s /mnt/storage/uploads /var/www/uploads
```

---

### 3. 대안: 외부 저장소 사용

#### 방법 1: 네트워크 스토리지 (NFS)

**윈도우에서 NFS 서버 설정 후:**
```bash
# NFS 클라이언트 설치
sudo apt install nfs-common

# 마운트
sudo mount -t nfs <윈도우_IP>:/공유폴더 /mnt/nfs

# 자동 마운트
echo '<윈도우_IP>:/공유폴더 /mnt/nfs nfs defaults 0 0' | sudo tee -a /etc/fstab
```

#### 방법 2: Samba (CIFS) 공유

**윈도우 공유 폴더를 리눅스에 마운트:**
```bash
# Samba 클라이언트 설치
sudo apt install cifs-utils

# 마운트
sudo mount -t cifs //<윈도우_IP>/공유폴더 /mnt/samba -o username=사용자명,password=비밀번호

# 자동 마운트 (자격증명 파일 사용 권장)
sudo nano /etc/.smbcredentials
# username=사용자명
# password=비밀번호

sudo chmod 600 /etc/.smbcredentials

echo '//<윈도우_IP>/공유폴더 /mnt/samba cifs credentials=/etc/.smbcredentials,iocharset=utf8,file_mode=0777,dir_mode=0777 0 0' | sudo tee -a /etc/fstab
```

#### 방법 3: 클라우드 스토리지 연동

**AWS S3, Google Cloud Storage 등:**
```bash
# s3fs 설치 (AWS S3 예시)
sudo apt install s3fs

# 마운트
s3fs my-bucket /mnt/s3 -o passwd_file=~/.passwd-s3fs
```

---

### 4. 실용적인 해결책

#### 해결책 1: 업로드 파일 크기 제한 설정

**Nginx 설정:**
```nginx
# /etc/nginx/nginx.conf
http {
    client_max_body_size 100M;  # 최대 업로드 크기 제한
}
```

**PHP 설정 (PHP 사용 시):**
```ini
# /etc/php/8.1/fpm/php.ini
upload_max_filesize = 100M
post_max_size = 100M
```

#### 해결책 2: 자동 정리 스크립트

**오래된 파일 자동 삭제:**
```bash
#!/bin/bash
# /usr/local/bin/cleanup_uploads.sh

# 30일 이상 된 파일 삭제
find /var/www/uploads -type f -mtime +30 -delete

# 빈 디렉토리 삭제
find /var/www/uploads -type d -empty -delete

# 크론에 등록 (매일 실행)
# sudo crontab -e
# 0 2 * * * /usr/local/bin/cleanup_uploads.sh
```

#### 해결책 3: 디스크 사용량 모니터링

**경고 스크립트:**
```bash
#!/bin/bash
# /usr/local/bin/disk_check.sh

USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

if [ $USAGE -gt 80 ]; then
    echo "경고: 디스크 사용량이 ${USAGE}%입니다!" | mail -s "디스크 공간 부족" admin@example.com
fi
```

---

### 5. 디스크 공간 절약 방법

#### 5-1. 불필요한 파일 삭제
```bash
# 패키지 캐시 정리
sudo apt clean
sudo apt autoremove

# 로그 파일 정리
sudo journalctl --vacuum-time=7d  # 7일 이상 된 로그 삭제
sudo find /var/log -type f -name "*.log" -mtime +30 -delete

# 임시 파일 정리
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*
```

#### 5-2. 동영상 압축/최적화
```bash
# FFmpeg로 동영상 압축
sudo apt install ffmpeg

# 고화질 → 중화질 변환
ffmpeg -i input.mp4 -vf scale=1280:720 -crf 23 output.mp4

# 용량 대폭 감소 (약 70-80% 감소)
```

#### 5-3. 썸네일 생성
```bash
# 동영상 썸네일만 저장, 원본은 외부 저장소에
ffmpeg -i video.mp4 -ss 00:00:01 -vframes 1 thumbnail.jpg
```

---

### 6. 권장 설정

#### 작은 프로젝트 (개인 블로그, 포트폴리오)
- **디스크 크기:** 20-30GB
- **업로드 제한:** 10MB
- **저장 위치:** `/var/www/uploads/`

#### 중간 프로젝트 (갤러리, 커뮤니티)
- **디스크 크기:** 50-100GB
- **업로드 제한:** 100MB
- **저장 위치:** 별도 디스크 또는 외부 스토리지

#### 대용량 프로젝트 (동영상 스트리밍, 파일 공유)
- **디스크 크기:** 200GB+ 또는 외부 스토리지 필수
- **업로드 제한:** 1GB+
- **저장 위치:** 전용 스토리지 서버 또는 클라우드

---

### 7. 체크리스트

**디스크 공간 관리:**
- [ ] 현재 디스크 사용량 확인 (`df -h`)
- [ ] 큰 파일 찾기 및 정리
- [ ] 불필요한 파일 삭제 (로그, 캐시)
- [ ] 업로드 파일 크기 제한 설정
- [ ] 자동 정리 스크립트 설정
- [ ] 디스크 모니터링 설정
- [ ] 필요시 디스크 확장 또는 외부 스토리지 연결

---

### 8. 요약

| 상황 | 해결 방법 |
|------|----------|
| **20GB 가득 참** | VMware에서 디스크 확장 (50GB+) |
| **동영상 저장 필요** | 외부 스토리지 또는 클라우드 사용 |
| **임시 해결** | 업로드 크기 제한 + 자동 정리 |
| **장기 해결** | 전용 스토리지 서버 구축 |

**핵심:**
- ✅ 20GB는 **제한**이 맞습니다 - 초과 저장 불가
- ✅ 동영상은 **외부 스토리지** 사용 권장
- ✅ 정기적인 **공간 모니터링** 필수
- ✅ **자동 정리 스크립트**로 관리

---

## 📊 HTML에서 디스크 사용량 표시하기

### 개요
리눅스의 디스크 사용량(총 용량, 사용 중, 사용 가능)을 HTML 페이지에서 실시간으로 표시할 수 있습니다.

**필요한 것:**
- PHP 설치 (서버 측 스크립트 실행)
- Nginx + PHP-FPM 설정

---

### 1단계: PHP 설치

#### 1-1. PHP 및 PHP-FPM 설치
```bash
# PHP와 PHP-FPM 설치
sudo apt update
sudo apt install php-fpm php-cli -y

# PHP 버전 확인
php -v
```

#### 1-2. Nginx와 PHP-FPM 연결 설정
```bash
# Nginx 설정 파일 수정
sudo nano /etc/nginx/sites-available/default
```

**설정 내용 추가:**
```nginx
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html index.php;

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }
}
```

**주의:** PHP 버전에 따라 경로가 다를 수 있습니다:
- PHP 8.1: `/var/run/php/php8.1-fpm.sock`
- PHP 8.0: `/var/run/php/php8.0-fpm.sock`
- PHP 7.4: `/var/run/php/php7.4-fpm.sock`

#### 1-3. Nginx 재시작
```bash
# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

---

### 2단계: 디스크 정보 표시 파일 생성

#### 2-1. 간단한 버전 (disk_simple.php)

**파일 생성:**
```bash
sudo nano /var/www/html/disk_simple.php
```

**파일 내용:**
```php
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>디스크 사용량</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        .info {
            background: #f8f9fa;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .progress {
            width: 100%;
            height: 30px;
            background: #e9ecef;
            border-radius: 5px;
            margin: 10px 0;
        }
        .progress-bar {
            height: 100%;
            background: #667eea;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>💾 디스크 사용량</h1>
    
    <?php
    $output = shell_exec('df -h / 2>&1');
    
    if ($output) {
        $lines = explode("\n", trim($output));
        if (count($lines) >= 2) {
            $data = preg_split('/\s+/', $lines[1]);
            
            $total = $data[1];
            $used = $data[2];
            $available = $data[3];
            $usePercent = $data[4];
            $usePercentNum = (int)str_replace('%', '', $usePercent);
            
            echo '<div class="info">';
            echo '<strong>총 용량:</strong> ' . htmlspecialchars($total) . '<br>';
            echo '<strong>사용 중:</strong> ' . htmlspecialchars($used) . '<br>';
            echo '<strong>사용 가능:</strong> ' . htmlspecialchars($available) . '<br>';
            echo '<strong>사용률:</strong> ' . htmlspecialchars($usePercent) . '<br>';
            echo '</div>';
            
            echo '<div class="progress">';
            echo '<div class="progress-bar" style="width: ' . $usePercentNum . '%;">';
            echo htmlspecialchars($usePercent);
            echo '</div>';
            echo '</div>';
        }
    }
    ?>
    
    <p>업데이트 시간: <?php echo date('Y-m-d H:i:s'); ?></p>
</body>
</html>
```

#### 2-2. 고급 버전 (disk_info.php)

**윈도우에서 파일 생성 후 FTP로 전송:**
- `disk_info.php` 파일을 `C:\WFTP\`에 복사
- 리눅스에서 FTP로 다운로드
- `/var/www/html/`로 이동

또는 직접 생성:
```bash
sudo nano /var/www/html/disk_info.php
```

(고급 버전은 자동 새로고침, 여러 디스크 표시, 색상 경고 등 기능 포함)

---

### 3단계: 파일 권한 설정

```bash
# 파일 소유자 변경
sudo chown www-data:www-data /var/www/html/disk*.php

# 파일 권한 설정
sudo chmod 644 /var/www/html/disk*.php
```

---

### 4단계: PHP 실행 권한 확인

**문제:** `shell_exec`가 실행되지 않는 경우

**해결 방법:**
```bash
# php.ini 파일 수정
sudo nano /etc/php/8.1/fpm/php.ini
# 또는
sudo nano /etc/php/8.1/cli/php.ini

# 다음 줄 찾기
# disable_functions = shell_exec

# 주석 처리하거나 제거
disable_functions =

# PHP-FPM 재시작
sudo systemctl restart php8.1-fpm
```

---

### 5단계: 브라우저에서 확인

**접속:**
- `http://리눅스_IP주소/disk_simple.php`
- `http://리눅스_IP주소/disk_info.php`

**표시 내용:**
- 총 용량 (예: 20G)
- 사용 중 (예: 15G)
- 사용 가능 (예: 4.2G)
- 사용률 (예: 79%)
- 진행 바 시각화

---

### 6단계: 보안 고려사항

#### 6-1. 접근 제한 (선택사항)
```nginx
# 특정 IP만 접근 허용
location ~ \.php$ {
    allow 192.168.1.0/24;  # 내부 네트워크만
    deny all;
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
}
```

#### 6-2. 인증 추가 (선택사항)
```nginx
# 기본 인증 추가
location /disk_info.php {
    auth_basic "Disk Info";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
}
```

**비밀번호 파일 생성:**
```bash
sudo apt install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd 사용자명
```

---

### 7단계: 자동 새로고침 설정

**JavaScript로 자동 새로고침:**
```javascript
// 30초마다 자동 새로고침
setTimeout(function() {
    location.reload();
}, 30000);
```

**Meta 태그로 자동 새로고침:**
```html
<meta http-equiv="refresh" content="30">
```

---

### 8단계: 문제 해결

#### 문제 1: PHP 파일이 다운로드됨
**원인:** PHP-FPM이 제대로 연결되지 않음

**해결:**
```bash
# PHP-FPM 상태 확인
sudo systemctl status php8.1-fpm

# PHP-FPM 시작
sudo systemctl start php8.1-fpm

# Nginx 설정 확인
sudo nginx -t
sudo systemctl restart nginx
```

#### 문제 2: 디스크 정보가 표시되지 않음
**원인:** `shell_exec` 권한 문제

**해결:**
```bash
# php.ini에서 disable_functions 확인
grep disable_functions /etc/php/8.1/fpm/php.ini

# PHP-FPM 재시작
sudo systemctl restart php8.1-fpm
```

#### 문제 3: 권한 오류
**원인:** www-data 사용자가 명령어 실행 불가

**해결:**
```bash
# sudoers 파일에 추가 (주의: 보안 위험)
sudo visudo
# www-data ALL=(ALL) NOPASSWD: /bin/df

# 또는 더 안전한 방법: 스크립트에 실행 권한 부여
sudo chmod +x /usr/local/bin/disk_info.sh
```

---

### 9단계: 요약

**필요한 단계:**
1. ✅ PHP 및 PHP-FPM 설치
2. ✅ Nginx 설정 수정 (PHP 지원)
3. ✅ 디스크 정보 PHP 파일 생성
4. ✅ 파일 권한 설정
5. ✅ 브라우저에서 접속 확인

**명령어 요약:**
```bash
# PHP 설치
sudo apt install php-fpm php-cli -y

# Nginx 재시작
sudo systemctl restart nginx
sudo systemctl restart php8.1-fpm

# 파일 권한
sudo chown www-data:www-data /var/www/html/disk*.php
sudo chmod 644 /var/www/html/disk*.php
```

**접속:**
- `http://리눅스_IP주소/disk_simple.php`

---

## 📤 PHP 파일 및 HTML 파일 FTP 전송 가이드

### 전송할 파일 목록
- `index.html` (메인 페이지)
- `disk_info.php` (디스크 정보 고급 버전)
- `disk_simple.php` (디스크 정보 간단 버전)

---

### 1단계: 윈도우에서 파일 준비

#### 1-1. 파일 확인
```cmd
# C:\FTP 디렉토리에서 파일 확인
dir C:\FTP\*.html
dir C:\FTP\*.php
```

**확인해야 할 파일:**
- `index.html`
- `disk_info.php`
- `disk_simple.php`

#### 1-2. FTP 서버 디렉토리로 복사
```cmd
# 모든 파일을 FTP 서버 디렉토리로 복사
copy C:\FTP\index.html C:\WFTP\index.html
copy C:\FTP\disk_info.php C:\WFTP\disk_info.php
copy C:\FTP\disk_simple.php C:\WFTP\disk_simple.php
```

**또는 파일 탐색기에서:**
- `C:\FTP\` 폴더에서 위 3개 파일 선택
- `C:\WFTP\` 폴더로 복사

---

### 2단계: FTP 서버 실행 확인

1. Home FTP Server 실행
2. "Start Server" 버튼 클릭
3. 서버 상태: "Running" 확인
4. 사용자 계정 확인:
   - 사용자명: `need`
   - 비밀번호: `need`
   - 홈 디렉토리: `C:\WFTP`

---

### 3단계: 리눅스에서 FTP 접속 및 파일 다운로드

#### 3-1. FTP 접속
```bash
ftp <윈도우_IP주소>
# 예시: ftp 172.30.1.42
```

#### 3-2. 로그인
```
Name (172.30.1.42:testadmin): need
Password: need
```

#### 3-3. 파일 목록 확인
```bash
ftp> ls
```

**확인해야 할 파일:**
- `index.html`
- `disk_info.php`
- `disk_simple.php`

#### 3-4. 모든 파일 다운로드
```bash
# 바이너리 모드로 전환 (PHP 파일은 바이너리)
ftp> binary

# 프롬프트 끄기 (여러 파일 다운로드 시)
ftp> prompt off

# 모든 파일 다운로드
ftp> mget *.html
ftp> mget *.php

# 또는 개별 다운로드
ftp> get index.html
ftp> get disk_info.php
ftp> get disk_simple.php
```

#### 3-5. FTP 세션 종료
```bash
ftp> quit
```

#### 3-6. 다운로드 확인
```bash
# 홈 디렉토리에서 파일 확인
ls -l ~/*.html
ls -l ~/*.php
```

---

### 4단계: PHP 설치 (아직 안 했다면)

```bash
# PHP 및 PHP-FPM 설치
sudo apt update
sudo apt install php-fpm php-cli -y

# PHP 버전 확인
php -v
```

---

### 5단계: Nginx PHP 설정 (아직 안 했다면)

#### 5-1. Nginx 설정 파일 수정
```bash
sudo nano /etc/nginx/sites-available/default
```

#### 5-2. PHP 설정 추가
다음 내용을 `server` 블록 안에 추가:

```nginx
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html index.php;

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }
}
```

**주의:** PHP 버전에 따라 경로가 다를 수 있습니다:
- PHP 8.1: `/var/run/php/php8.1-fpm.sock`
- PHP 8.0: `/var/run/php/php8.0-fpm.sock`
- PHP 7.4: `/var/run/php/php7.4-fpm.sock`

**PHP 버전 확인:**
```bash
php -v
ls /var/run/php/
```

#### 5-3. Nginx 설정 테스트 및 재시작
```bash
# 설정 파일 문법 확인
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx

# PHP-FPM 재시작
sudo systemctl restart php8.1-fpm
```

---

### 6단계: 파일을 웹 서버 디렉토리로 이동

#### 6-1. 모든 파일 이동
```bash
# 홈 디렉토리에서 웹 서버 디렉토리로 이동
sudo mv ~/index.html /var/www/html/
sudo mv ~/disk_info.php /var/www/html/
sudo mv ~/disk_simple.php /var/www/html/
```

**또는 한 번에:**
```bash
sudo mv ~/*.html /var/www/html/
sudo mv ~/*.php /var/www/html/
```

#### 6-2. 파일 위치 확인
```bash
ls -l /var/www/html/
```

**확인해야 할 파일:**
- `index.html`
- `disk_info.php`
- `disk_simple.php`

---

### 7단계: 파일 권한 설정

#### 7-1. 소유자 변경
```bash
# 모든 파일의 소유자를 www-data로 변경
sudo chown www-data:www-data /var/www/html/index.html
sudo chown www-data:www-data /var/www/html/disk_info.php
sudo chown www-data:www-data /var/www/html/disk_simple.php

# 또는 한 번에
sudo chown www-data:www-data /var/www/html/*.html
sudo chown www-data:www-data /var/www/html/*.php
```

#### 7-2. 파일 권한 설정
```bash
# 읽기 권한 부여
sudo chmod 644 /var/www/html/index.html
sudo chmod 644 /var/www/html/disk_info.php
sudo chmod 644 /var/www/html/disk_simple.php

# 또는 한 번에
sudo chmod 644 /var/www/html/*.html
sudo chmod 644 /var/www/html/*.php
```

---

### 8단계: PHP 실행 권한 확인

#### 8-1. PHP 설정 확인
```bash
# php.ini에서 shell_exec 확인
grep disable_functions /etc/php/8.1/fpm/php.ini
```

**문제:** `disable_functions = shell_exec`이 있으면 주석 처리 필요

#### 8-2. php.ini 수정 (필요한 경우)
```bash
sudo nano /etc/php/8.1/fpm/php.ini
```

**찾아서 수정:**
```ini
# 이 줄을 찾아서
disable_functions = shell_exec

# 이렇게 변경 (주석 처리)
; disable_functions = shell_exec

# 또는 완전히 제거
disable_functions =
```

#### 8-3. PHP-FPM 재시작
```bash
sudo systemctl restart php8.1-fpm
```

---

### 9단계: 브라우저에서 확인

#### 9-1. 리눅스 서버 IP 확인
```bash
hostname -I
```

#### 9-2. 브라우저에서 접속

**메인 페이지:**
- `http://리눅스_IP주소/`
- 또는 `http://리눅스_IP주소/index.html`

**디스크 정보 (간단):**
- `http://리눅스_IP주소/disk_simple.php`

**디스크 정보 (고급):**
- `http://리눅스_IP주소/disk_info.php`

---

### 10단계: 문제 해결

#### 문제 1: PHP 파일이 다운로드됨
**원인:** PHP-FPM이 제대로 연결되지 않음

**해결:**
```bash
# PHP-FPM 상태 확인
sudo systemctl status php8.1-fpm

# PHP-FPM 시작
sudo systemctl start php8.1-fpm

# Nginx 재시작
sudo systemctl restart nginx
```

#### 문제 2: 디스크 정보가 표시되지 않음
**원인:** `shell_exec` 권한 문제

**해결:**
```bash
# php.ini 확인 및 수정
sudo nano /etc/php/8.1/fpm/php.ini
# disable_functions에서 shell_exec 제거

# PHP-FPM 재시작
sudo systemctl restart php8.1-fpm
```

#### 문제 3: 403 Forbidden 오류
**원인:** 파일 권한 문제

**해결:**
```bash
# 권한 재설정
sudo chown www-data:www-data /var/www/html/*
sudo chmod 644 /var/www/html/*
```

#### 문제 4: 404 Not Found 오류
**원인:** 파일이 올바른 위치에 없음

**해결:**
```bash
# 파일 위치 확인
ls -l /var/www/html/

# 파일이 없으면 다시 이동
sudo mv ~/index.html /var/www/html/
sudo mv ~/disk_info.php /var/www/html/
sudo mv ~/disk_simple.php /var/www/html/
```

---

### 11단계: 전체 명령어 요약

**리눅스에서 순서대로 실행:**

```bash
# 1. FTP 접속 및 파일 다운로드
ftp <윈도우_IP주소>
# (로그인 후)
ftp> binary
ftp> get index.html
ftp> get gallery.php
ftp> get disk_info.php
ftp> get disk_simple.php
ftp> quit

# 2. PHP 설치 (필요한 경우)
sudo apt update
sudo apt install php-fpm php-cli -y

# 3. Nginx PHP 설정 (필요한 경우)
sudo nano /etc/nginx/sites-available/default
# (PHP 설정 추가 후)
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl restart php8.1-fpm

# 4. 파일 이동
sudo mv ~/*.html /var/www/html/
sudo mv ~/*.php /var/www/html/

# 5. 권한 설정
sudo chown www-data:www-data /var/www/html/*.html
sudo chown www-data:www-data /var/www/html/*.php
sudo chmod 644 /var/www/html/*.html
sudo chmod 644 /var/www/html/*.php

# 6. PHP 권한 확인 (필요한 경우)
sudo nano /etc/php/8.1/fpm/php.ini
# disable_functions에서 shell_exec 제거
sudo systemctl restart php8.1-fpm

# 7. 확인
ls -l /var/www/html/
hostname -I
```

---

### 12단계: 체크리스트

- [ ] 윈도우에서 파일을 `C:\WFTP\`로 복사 완료
- [ ] FTP 서버 실행 확인 완료
- [ ] 리눅스에서 FTP 접속 성공
- [ ] 모든 파일 다운로드 완료 (index.html, disk_info.php, disk_simple.php)
- [ ] PHP 설치 완료
- [ ] Nginx PHP 설정 완료
- [ ] 파일을 `/var/www/html/`로 이동 완료
- [ ] 파일 권한 설정 완료
- [ ] PHP 실행 권한 확인 완료
- [ ] 브라우저에서 모든 페이지 접속 확인 완료

---

**실습 완료 후:** 웹 브라우저에서 "FTP & 웹 서버 학습" 페이지가 정상적으로 표시되면 성공입니다! 🎉

