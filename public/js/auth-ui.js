/**
 * 인증 UI 관리
 * 로그인/회원가입 폼 및 상태 표시
 */

class AuthUI {
    constructor(authService) {
        this.authService = authService;
        this.currentView = 'login'; // 'login' or 'signup'
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
        
        // 인증 상태에 따라 UI 업데이트
        this.authService.onAuthStateChanged((user) => {
            this.updateUI(user);
        });
    }

    /**
     * 초기 렌더링
     */
    render() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) {
            console.warn('auth-container 요소를 찾을 수 없습니다.');
            return;
        }

        authContainer.innerHTML = `
            <div class="auth-modal" id="auth-modal">
                <div class="auth-content">
                    <div class="auth-header">
                        <h2 id="auth-title">로그인</h2>
                        <button class="close-btn" id="auth-close-btn">×</button>
                    </div>
                    
                    <div class="auth-tabs">
                        <button class="tab-btn active" data-view="login">로그인</button>
                        <button class="tab-btn" data-view="signup">회원가입</button>
                    </div>

                    <div class="auth-body">
                        <form id="auth-form">
                            <div id="signup-name-field" class="form-group" style="display: none;">
                                <label for="display-name">이름</label>
                                <input type="text" id="display-name" placeholder="이름을 입력하세요 (선택사항)">
                            </div>
                            
                            <div class="form-group">
                                <label for="email">이메일</label>
                                <input type="email" id="email" required placeholder="이메일을 입력하세요">
                            </div>
                            
                            <div class="form-group">
                                <label for="password">비밀번호</label>
                                <input type="password" id="password" required placeholder="비밀번호를 입력하세요" minlength="6">
                            </div>
                            
                            <div id="auth-error" class="error-message" style="display: none;"></div>
                            
                            <button type="submit" class="auth-submit-btn" id="auth-submit-btn">
                                로그인
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div class="user-info" id="user-info" style="display: none;">
                <div class="user-details">
                    <span id="user-name"></span>
                    <span id="user-email"></span>
                </div>
                <button class="logout-btn" id="logout-btn">로그아웃</button>
            </div>
        `;

        // 스타일이 로드되지 않았으면 추가
        if (!document.getElementById('auth-styles')) {
            this.injectStyles();
        }
    }

    /**
     * 이벤트 리스너 연결
     */
    attachEventListeners() {
        // 탭 전환
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // 폼 제출
        const form = document.getElementById('auth-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // 닫기 버튼
        const closeBtn = document.getElementById('auth-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideAuth();
            });
        }

        // 로그아웃 버튼
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    /**
     * 로그인/회원가입 뷰 전환
     */
    switchView(view) {
        this.currentView = view;
        
        // 탭 버튼 활성화
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // 제목 변경
        const title = document.getElementById('auth-title');
        const submitBtn = document.getElementById('auth-submit-btn');
        const nameField = document.getElementById('signup-name-field');
        
        if (view === 'login') {
            title.textContent = '로그인';
            submitBtn.textContent = '로그인';
            if (nameField) nameField.style.display = 'none';
        } else {
            title.textContent = '회원가입';
            submitBtn.textContent = '회원가입';
            if (nameField) nameField.style.display = 'block';
        }

        // 에러 메시지 숨기기
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) errorDiv.style.display = 'none';
    }

    /**
     * 폼 제출 처리
     */
    async handleSubmit() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const displayName = document.getElementById('display-name')?.value || null;
        
        const errorDiv = document.getElementById('auth-error');
        const submitBtn = document.getElementById('auth-submit-btn');
        
        // 로딩 상태
        submitBtn.disabled = true;
        submitBtn.textContent = '처리 중...';
        if (errorDiv) errorDiv.style.display = 'none';

        let result;
        if (this.currentView === 'login') {
            result = await this.authService.signIn(email, password);
        } else {
            result = await this.authService.signUp(email, password, displayName);
        }

        submitBtn.disabled = false;
        submitBtn.textContent = this.currentView === 'login' ? '로그인' : '회원가입';

        if (result.success) {
            this.hideAuth();
            // 성공 메시지 (선택사항)
            this.showMessage('성공! 환영합니다.', 'success');
        } else {
            if (errorDiv) {
                errorDiv.textContent = result.error;
                errorDiv.style.display = 'block';
            }
        }
    }

    /**
     * 로그아웃 처리
     */
    async handleLogout() {
        const result = await this.authService.signOut();
        if (result.success) {
            this.showAuth();
            this.showMessage('로그아웃되었습니다.', 'success');
        }
    }

    /**
     * 인증 상태에 따라 UI 업데이트
     */
    updateUI(user) {
        const authModal = document.getElementById('auth-modal');
        const userInfo = document.getElementById('user-info');
        
        if (user) {
            // 로그인 상태
            if (authModal) authModal.style.display = 'none';
            if (userInfo) {
                userInfo.style.display = 'flex';
                document.getElementById('user-name').textContent = user.displayName;
                document.getElementById('user-email').textContent = user.email;
            }
        } else {
            // 비로그인 상태
            if (authModal) authModal.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';
        }
    }

    /**
     * 인증 모달 표시
     */
    showAuth() {
        const authModal = document.getElementById('auth-modal');
        if (authModal) authModal.style.display = 'flex';
    }

    /**
     * 인증 모달 숨기기
     */
    hideAuth() {
        const authModal = document.getElementById('auth-modal');
        if (authModal) authModal.style.display = 'none';
    }

    /**
     * 메시지 표시 (간단한 토스트 메시지)
     */
    showMessage(message, type = 'info') {
        // 간단한 토스트 메시지 (필요시 개선 가능)
        alert(message);
    }

    /**
     * 인증 UI 스타일 주입
     */
    injectStyles() {
        const style = document.createElement('style');
        style.id = 'auth-styles';
        style.textContent = `
            .auth-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                justify-content: center;
                align-items: center;
            }

            .auth-content {
                background: white;
                border-radius: 12px;
                padding: 0;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                animation: slideDown 0.3s ease;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .auth-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid #eee;
            }

            .auth-header h2 {
                margin: 0;
                color: #333;
                font-size: 1.5em;
            }

            .close-btn {
                background: none;
                border: none;
                font-size: 28px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                line-height: 1;
            }

            .close-btn:hover {
                color: #333;
            }

            .auth-tabs {
                display: flex;
                border-bottom: 1px solid #eee;
            }

            .tab-btn {
                flex: 1;
                padding: 12px;
                border: none;
                background: none;
                cursor: pointer;
                font-size: 1em;
                color: #666;
                transition: all 0.3s;
            }

            .tab-btn:hover {
                background: #f5f5f5;
            }

            .tab-btn.active {
                color: #667eea;
                border-bottom: 2px solid #667eea;
                font-weight: bold;
            }

            .auth-body {
                padding: 24px;
            }

            .form-group {
                margin-bottom: 16px;
            }

            .form-group label {
                display: block;
                margin-bottom: 6px;
                color: #333;
                font-weight: 500;
            }

            .form-group input {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 1em;
                transition: border-color 0.3s;
                box-sizing: border-box;
            }

            .form-group input:focus {
                outline: none;
                border-color: #667eea;
            }

            .auth-submit-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 1em;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
                margin-top: 8px;
            }

            .auth-submit-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .auth-submit-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .error-message {
                background: #fee;
                color: #c33;
                padding: 10px;
                border-radius: 6px;
                margin-bottom: 12px;
                font-size: 0.9em;
            }

            .user-info {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 12px 20px;
                background: #f8f9fa;
                border-radius: 8px;
                margin-bottom: 20px;
            }

            .user-details {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .user-details #user-name {
                font-weight: bold;
                color: #333;
            }

            .user-details #user-email {
                font-size: 0.9em;
                color: #666;
            }

            .logout-btn {
                padding: 8px 16px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9em;
            }

            .logout-btn:hover {
                background: #c82333;
            }
        `;
        document.head.appendChild(style);
    }
}

