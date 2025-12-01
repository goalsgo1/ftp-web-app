# Next.js + React 설치 가이드

## 📋 Next.js란?

Next.js는 React 기반의 **프레임워크**입니다. 순수 HTML/JS/CSS 파일이 아니라, **컴포넌트 기반**으로 개발합니다.

### 일반 HTML/JS/CSS와의 차이점

**일반 웹 개발 (HTML/JS/CSS)**:
```
index.html
├── <html>
├── <head>
├── <body>
└── <script src="app.js"></script>
```

**Next.js (React 컴포넌트)**:
```
app/page.tsx (또는 .jsx)
├── export default function Page() {
├──   return (
├──     <div>내용</div>
├──   )
└── }
```

### 주요 차이점

1. **파일 형식**: `.html` 대신 `.tsx` 또는 `.jsx` (JavaScript + HTML 같은 문법)
2. **컴포넌트 기반**: 재사용 가능한 컴포넌트로 구성
3. **자동 빌드**: 개발 시 자동으로 HTML/JS/CSS로 변환
4. **파일 기반 라우팅**: 폴더 구조가 자동으로 URL이 됨

---

## 🚀 설치 방법

### 1단계: Node.js 설치 확인

먼저 Node.js가 설치되어 있는지 확인하세요.

```bash
node --version
npm --version
```

**설치되어 있지 않다면**:
- [Node.js 공식 사이트](https://nodejs.org/)에서 LTS 버전 다운로드 및 설치
- 권장 버전: Node.js 18.x 이상

**⚠️ 설치 후 주의사항**:
- **리부팅 불필요**: Node.js 설치 후 컴퓨터를 리부팅할 필요는 없습니다
- **새 터미널 창 열기**: 설치 후 현재 터미널을 닫고 **새 터미널 창**을 열어주세요
- 환경 변수(PATH)가 새 터미널에서만 적용되기 때문입니다
- 새 터미널에서 `node --version` 명령어로 설치 확인

**⚠️ Node.js REPL에 들어간 경우**:
- 터미널에 `Welcome to Node.js` 메시지와 `>` 프롬프트가 보이면 Node.js REPL(대화형 환경) 안에 있는 것입니다
- **REPL 나가기**: `.exit` 입력하거나 `Ctrl+C` 두 번 누르기
- REPL을 나간 후 일반 터미널에서 `node --version` 명령어 실행

### 2단계: Next.js 프로젝트 생성

터미널에서 다음 명령어를 실행하세요:

```bash
npx create-next-app@latest my-dashboard
```

**⚠️ PowerShell 실행 정책 오류가 발생하는 경우**:

오류 메시지:
```
npx : 이 시스템에서 스크립트를 실행할 수 없으므로 ... npx.ps1 파일을 로드할 수 없습니다.
```

**해결 방법 (순서대로 시도)**:

#### 방법 1: 현재 세션에만 실행 정책 변경 (권장) ⭐

PowerShell에서 다음 명령어 실행:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

그 다음 다시 시도:

```bash
npx create-next-app@latest my-dashboard
```

#### 방법 2: CMD 사용

PowerShell 대신 **CMD(명령 프롬프트)**를 사용:

1. VS Code에서 새 터미널 열기
2. 터미널 우측 상단의 `+` 옆 화살표 클릭
3. "Command Prompt" 선택
4. 다음 명령어 실행:

```cmd
npx create-next-app@latest my-dashboard
```

#### 방법 3: 실행 정책 영구 변경 (현재 사용자만)

관리자 권한이 필요할 수 있습니다:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

그 다음 다시 시도:

```bash
npx create-next-app@latest my-dashboard
```

> 💡 **참고**: 더 자세한 내용은 `docs/troubleshooting/PowerShell_실행정책_해결방법.md` 문서를 참고하세요.

**설정 옵션** (대화형으로 선택):
- ✅ TypeScript: **Yes** (권장)
- ✅ ESLint: **Yes** (권장)
- ✅ Tailwind CSS: **Yes** (권장 - 빠른 스타일링)
- ✅ `src/` directory: 선택 사항
- ✅ App Router: **Yes** (권장 - 최신 방식)
- ✅ Import alias: **Yes** (권장)

### 3단계: 프로젝트 폴더로 이동

```bash
cd my-dashboard
```

### 4단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속하면 Next.js 앱이 실행됩니다!

---

## 📁 프로젝트 구조

Next.js 프로젝트를 생성하면 다음과 같은 구조가 만들어집니다:

```
my-dashboard/
├── app/                    # App Router (최신 방식)
│   ├── page.tsx           # 메인 페이지 (자동으로 / 경로)
│   ├── layout.tsx         # 레이아웃 (모든 페이지 공통)
│   └── globals.css        # 전역 CSS
├── public/                 # 정적 파일 (이미지, 아이콘 등)
├── next.config.js         # Next.js 설정
├── package.json           # 프로젝트 의존성
├── tsconfig.json          # TypeScript 설정
└── tailwind.config.ts     # Tailwind CSS 설정
```

---

## 🎨 파일 형식 설명

### 1. `.tsx` 또는 `.jsx` 파일 (컴포넌트)

**예시: `app/page.tsx`**
```tsx
export default function Home() {
  return (
    <div>
      <h1>대시보드</h1>
      <p>환영합니다!</p>
    </div>
  )
}
```

이것이 **JSX** 형식입니다:
- HTML처럼 보이지만 실제로는 JavaScript
- `<div>`, `<h1>` 같은 태그를 직접 사용 가능
- JavaScript 표현식도 사용 가능: `{변수명}`

### 2. CSS 파일

**방법 1: CSS Modules** (`app/page.module.css`)
```css
.container {
  padding: 20px;
}
```

**방법 2: Tailwind CSS** (권장)
```tsx
<div className="p-5 bg-blue-500 text-white">
  내용
</div>
```

### 3. JavaScript 로직

같은 파일 안에서 JavaScript를 사용할 수 있습니다:

```tsx
export default function Home() {
  const title = "대시보드"
  const count = 10
  
  return (
    <div>
      <h1>{title}</h1>
      <p>카운트: {count}</p>
    </div>
  )
}
```

---

## 📦 필요한 라이브러리 설치

대시보드 개발에 필요한 라이브러리들을 설치하세요:

### 기본 라이브러리

```bash
# AI 기능
npm install ai @anthropic-ai/sdk openai

# 차트/그래프
npm install recharts

# 데이터 테이블
npm install @tanstack/react-table

# 상태 관리
npm install zustand @tanstack/react-query

# Firebase
npm install firebase

# 추가 유틸리티
npm install date-fns
```

### 한 번에 설치

```bash
npm install ai @anthropic-ai/sdk openai recharts @tanstack/react-table @tanstack/react-query zustand firebase date-fns
```

---

## 🎯 다음 단계

1. **프로젝트 생성 완료** ✅
2. **개발 서버 실행** (`npm run dev`)
3. **대시보드 페이지 만들기**
4. **Firebase 연동**
5. **AI 기능 추가**
6. **차트/테이블 추가**

---

## 🔧 문제 해결

### 문제: `node` 명령어가 인식되지 않습니다

**오류 메시지**:
```
node : 'node' 용어가 cmdlet, 함수, 스크립트 파일 또는 실행할 수 있는 프로그램 이름으로 인식되지 않습니다.
```

또는

**Node.js REPL에 들어간 경우**:
- 터미널에 `Welcome to Node.js` 메시지가 보이고 `>` 프롬프트가 나타남
- `node --version` 입력 시 `SyntaxError` 발생
- **해결**: `.exit` 입력하거나 `Ctrl+C` 두 번 눌러서 REPL 나가기

**해결 방법 (순서대로 시도)**:

#### 1단계: 터미널 완전히 닫고 다시 열기
- 현재 터미널 창을 **완전히 닫기** (VS Code의 경우 터미널 탭 닫기)
- VS Code를 완전히 종료하고 다시 실행
- 새 터미널에서 다시 시도:
  ```bash
  node --version
  ```

#### 2단계: Node.js 설치 확인
- Windows 시작 메뉴에서 "Node.js" 검색
- "Node.js command prompt" 또는 "Node.js" 프로그램이 있는지 확인
- 있다면 설치가 완료된 것입니다

#### 3단계: 환경 변수 수동 확인 (고급)
PowerShell에서 환경 변수 확인:
```powershell
$env:PATH -split ';' | Select-String -Pattern "node"
```

Node.js 경로가 보이지 않으면:
1. Windows 검색에서 "환경 변수" 검색
2. "시스템 환경 변수 편집" 선택
3. "환경 변수" 버튼 클릭
4. "시스템 변수"에서 "Path" 선택 → "편집"
5. Node.js 경로가 있는지 확인 (예: `C:\Program Files\nodejs\`)
6. 없다면 "새로 만들기"로 추가:
   - 일반 경로: `C:\Program Files\nodejs\`
   - 또는 설치한 경로 확인 후 추가

#### 4단계: Node.js 재설치
위 방법이 모두 실패하면:
1. [Node.js 공식 사이트](https://nodejs.org/)에서 다시 다운로드
2. **Windows Installer (.msi)** 선택
3. 설치 시 "Add to PATH" 옵션이 체크되어 있는지 확인
4. 설치 완료 후 **컴퓨터 재시작** (이 경우에만 필요)

#### 5단계: 설치 경로 직접 확인
Node.js가 설치되었는지 파일 탐색기에서 확인:
```
C:\Program Files\nodejs\node.exe
```
이 파일이 있다면 설치된 것입니다. 이 경우 환경 변수만 업데이트하면 됩니다.

---

## 💡 자주 묻는 질문

### Q: HTML 파일을 직접 만들 수 있나요?
A: Next.js는 컴포넌트 기반이지만, `public/` 폴더에 HTML 파일을 넣으면 정적 파일로 제공됩니다. 하지만 대부분의 경우 `.tsx` 컴포넌트를 사용합니다.

### Q: CSS를 별도 파일로 만들 수 있나요?
A: 네! CSS Modules (`.module.css`) 또는 전역 CSS (`globals.css`)를 사용할 수 있습니다. Tailwind CSS도 함께 사용 가능합니다.

### Q: JavaScript 파일은 어디에 두나요?
A: 컴포넌트 파일 (`.tsx`) 안에 직접 작성하거나, `lib/` 또는 `utils/` 폴더에 별도 파일로 만들 수 있습니다.

### Q: TypeScript를 안 쓰고 싶어요
A: 프로젝트 생성 시 TypeScript를 선택하지 않으면 `.jsx` 파일로 생성됩니다. 또는 기존 프로젝트에서 TypeScript를 제거할 수도 있습니다.

### Q: `node` 명령어가 인식되지 않아요
A: 위의 "문제 해결" 섹션을 참고하세요. 대부분 터미널을 새로 열거나 환경 변수를 업데이트하면 해결됩니다.

### Q: `npx` 명령어 실행 시 PowerShell 실행 정책 오류가 발생해요
A: 위의 "2단계: Next.js 프로젝트 생성" 섹션의 해결 방법을 참고하세요. 가장 간단한 방법은 `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` 명령어를 실행하거나 CMD를 사용하는 것입니다.

---

## 📚 학습 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

---

**마지막 업데이트**: 2025-12-01

