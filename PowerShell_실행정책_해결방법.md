# 🔒 PowerShell 실행 정책 문제 해결 가이드

PowerShell에서 스크립트를 실행할 때 "실행할 수 없습니다" 오류가 발생하는 경우의 해결 방법입니다.

## 🚨 오류 메시지

```
.\배포_시작하기.ps1 : 이 시스템에서 스크립트를 실행할 수 없으므로 ...
+ CategoryInfo : 보안 오류: (:) [], PSSecurityException
```

## ✅ 해결 방법

### 방법 1: 배치 파일 사용 (가장 쉬움) ⭐

**`배포_시작하기_안전실행.bat` 파일을 더블클릭하거나:**

```cmd
배포_시작하기_안전실행.bat
```

이 파일이 자동으로 실행 정책을 우회하여 스크립트를 실행합니다.

---

### 방법 2: 실행 정책 우회 (권장)

**PowerShell에서 실행:**

```powershell
powershell -ExecutionPolicy Bypass -File .\배포_시작하기.ps1
```

또는:

```powershell
.\배포_시작하기.ps1 -ExecutionPolicy Bypass
```

---

### 방법 3: 현재 세션에만 정책 변경 (안전)

**PowerShell에서 실행:**

```powershell
# 현재 세션에만 실행 정책 변경
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# 스크립트 실행
.\배포_시작하기.ps1
```

이 방법은 **현재 PowerShell 세션에만** 영향을 주므로 가장 안전합니다.

---

### 방법 4: 현재 사용자에게만 정책 변경 (영구적)

**관리자 권한 PowerShell에서 실행:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

이 방법은 **현재 사용자에게만** 영향을 주며, 다른 사용자나 시스템에는 영향을 주지 않습니다.

---

### 방법 5: 스크립트 내용 직접 실행

스크립트 파일을 열어서 내용을 복사한 후 PowerShell에 직접 붙여넣어 실행할 수도 있습니다.

---

## 🔍 현재 실행 정책 확인

```powershell
Get-ExecutionPolicy -List
```

출력 예시:
```
        Scope ExecutionPolicy
        ----- ---------------
MachinePolicy       Undefined
   UserPolicy       Undefined
      Process       Undefined
  CurrentUser       Restricted
 LocalMachine       Restricted
```

---

## 📚 실행 정책 종류

| 정책 | 설명 |
|------|------|
| **Restricted** | 스크립트 실행 불가 (기본값) |
| **RemoteSigned** | 로컬 스크립트는 실행 가능, 원격 스크립트는 서명 필요 |
| **AllSigned** | 모든 스크립트에 서명 필요 |
| **Unrestricted** | 모든 스크립트 실행 가능 (비추천) |
| **Bypass** | 모든 정책 무시 (일시적) |

---

## 🛡️ 보안 고려사항

### ⚠️ 주의사항

- **`Unrestricted`는 사용하지 마세요** - 보안 위험
- **`Bypass`는 임시로만 사용** - 세션 종료 시 원래대로
- **`RemoteSigned` 또는 `CurrentUser` 범위 권장**

### ✅ 권장 설정

```powershell
# 현재 사용자에게만 RemoteSigned 설정
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🚀 빠른 해결 (추천)

**지금 당장 스크립트를 실행하려면:**

```powershell
powershell -ExecutionPolicy Bypass -File .\배포_시작하기.ps1
```

또는:

```cmd
배포_시작하기_안전실행.bat
```

---

## ❓ 자주 묻는 질문

### Q: 왜 실행 정책이 필요한가요?

A: 악성 스크립트의 실행을 방지하기 위한 보안 기능입니다.

### Q: 어떤 방법이 가장 안전한가요?

A: **방법 3 (현재 세션에만 변경)** 또는 **방법 1 (배치 파일)** 이 가장 안전합니다.

### Q: 회사 컴퓨터에서 정책을 변경할 수 없어요.

A: **방법 1 (배치 파일)** 또는 **방법 2 (Bypass)** 를 사용하세요. 시스템 정책을 변경할 필요가 없습니다.

---

## 📝 요약

**가장 쉬운 방법:**
```cmd
배포_시작하기_안전실행.bat
```

**PowerShell에서 직접:**
```powershell
powershell -ExecutionPolicy Bypass -File .\배포_시작하기.ps1
```

**안전한 방법 (영구적):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

**작성일**: 2025년 1월
