// Firebase 설정 파일
// 나중에 다른 플랫폼으로 전환할 때 이 파일만 수정하면 됩니다

// Firebase SDKs import (CDN에서 로드됨)
// HTML에서 먼저 로드되어야 함:
// <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>

// Firebase 설정 - 실제 프로젝트에서 발급받은 값으로 교체하세요
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase 초기화 (이미 초기화되어 있으면 에러 방지)
let app;
try {
    app = firebase.app();
} catch (e) {
    app = firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

console.log('Firebase 초기화 완료');

