# 🔐 환경 변수 설정 가이드

## 필수 환경 변수

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
# Anthropic Claude API 키
ANTHROPIC_API_KEY=sk-ant-api03-...

# (선택사항) Cron 작업 인증 키
CRON_SECRET=your-secret-key-here
```

## API 키 발급 방법

1. [Anthropic Console](https://console.anthropic.com/) 접속
2. 로그인 또는 회원가입
3. "API Keys" 메뉴로 이동
4. "Create Key" 클릭
5. 키 이름 입력 (예: "my-dashboard-dev")
6. 생성된 키를 복사하여 `.env.local`에 붙여넣기

⚠️ **주의**: API 키는 절대 공개 저장소에 커밋하지 마세요!

## 환경 변수 확인

개발 서버 실행 전에 환경 변수가 제대로 설정되었는지 확인하세요:

```bash
# Windows PowerShell
echo $env:ANTHROPIC_API_KEY

# 또는 .env.local 파일 확인
```

## 문제 해결

### 에러: "ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다"

1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 파일 이름이 정확히 `.env.local`인지 확인 (`.env`가 아님)
3. 파일 내용에 `ANTHROPIC_API_KEY=sk-ant-...` 형식이 올바른지 확인
4. 개발 서버를 재시작 (환경 변수 변경 후 재시작 필요)

### API 키가 작동하지 않는 경우

1. Anthropic Console에서 키가 활성화되어 있는지 확인
2. 사용량 제한을 확인
3. 결제 정보가 등록되어 있는지 확인

