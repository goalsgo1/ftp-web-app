# 🔐 Git 저장소 클론 인증 가이드

현재 Git 저장소를 클론하는 중에 GitHub 인증이 필요합니다.

---

## 📋 현재 상태

화면에 다음이 표시됩니다:
```
Username for 'https://github.com':
```

---

## ✅ 입력 방법

### 1. Username 입력

**입력할 값:**
```
goalsgo1
```

그리고 **Enter** 키 누르기

### 2. Password 입력

그 다음 다음 질문이 나옵니다:
```
Password for 'https://goalsgo1@github.com':
```

**입력할 값:**
- GitHub **비밀번호가 아닙니다!**
- **Personal Access Token**을 입력해야 합니다!

---

## 🔑 Personal Access Token 사용하기

### 토큰을 아직 복사하지 않았다면

1. GitHub 웹사이트 접속
   - https://github.com/settings/tokens

2. 생성한 토큰 찾기
   - 또는 새로 생성

3. 토큰 복사
   - `ghp_`로 시작하는 긴 문자열

4. Password 프롬프트에 붙여넣기
   - 화면에 표시되지 않지만 입력되고 있음
   - Enter 키 누르기

---

## 🔄 더 쉬운 방법: Public 저장소로 변경

저장소가 Private라면 인증이 필요합니다. Public으로 바꾸면 인증 없이 클론할 수 있습니다.

### 저장소를 Public으로 변경

1. GitHub 저장소 페이지 접속
   - https://github.com/goalsgo1/ftp-web-app

2. Settings 클릭

3. 아래로 스크롤 → Danger Zone

4. "Change repository visibility" 클릭

5. "Make public" 선택

6. 저장소 이름 입력하여 확인

### Public으로 변경 후

```bash
# 인증 없이 클론 가능
sudo -u deploy git clone https://github.com/goalsgo1/ftp-web-app.git /var/www/myapp/repo
```

---

## 📝 입력 순서 요약

### 방법 1: Personal Access Token 사용

```
Username for 'https://github.com': goalsgo1
Password for 'https://goalsgo1@github.com': [토큰 붙여넣기]
```

### 방법 2: 저장소를 Public으로 변경 (권장)

1. GitHub에서 저장소를 Public으로 변경
2. 인증 없이 클론

---

## 🆘 문제 해결

### "Authentication failed" 오류

**해결:**
- Personal Access Token이 올바른지 확인
- 토큰에 `repo` 권한이 있는지 확인
- 저장소가 Private인지 확인

### "Permission denied" 오류

**해결:**
- 저장소 접근 권한 확인
- Personal Access Token 권한 확인

---

## 💡 추천

**가장 쉬운 방법:**
1. 저장소를 Public으로 변경
2. 인증 없이 클론

**또는:**
1. Personal Access Token 사용
2. Username: `goalsgo1`
3. Password: Personal Access Token

---

**지금 Username에 `goalsgo1`을 입력하고 Enter를 누르세요!** 🚀
