/**
 * 인증 서비스 레이어 (추상화)
 * 이 파일을 통해 인증 로직을 추상화하여 나중에 Firebase에서 다른 플랫폼으로 쉽게 전환할 수 있습니다.
 * 
 * 전환 시: auth-service.js 파일만 수정하면 되도록 설계
 */

class AuthService {
    constructor() {
        this.currentUser = null;
        this.authListeners = [];
        this.init();
    }

    /**
     * 초기화 - Firebase 인증 상태 리스너 설정
     */
    init() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                this.currentUser = user;
                this.notifyListeners(user);
            });
        }
    }

    /**
     * 인증 상태 변경 리스너 등록
     */
    onAuthStateChanged(callback) {
        this.authListeners.push(callback);
        // 현재 상태도 즉시 호출
        if (this.currentUser !== null) {
            callback(this.currentUser);
        }
    }

    /**
     * 리스너들에게 상태 변경 알림
     */
    notifyListeners(user) {
        this.authListeners.forEach(callback => {
            try {
                callback(user);
            } catch (e) {
                console.error('Auth listener error:', e);
            }
        });
    }

    /**
     * 이메일/비밀번호로 회원가입
     */
    async signUp(email, password, displayName = null) {
        try {
            if (typeof firebase === 'undefined' || !firebase.auth) {
                throw new Error('Firebase가 로드되지 않았습니다.');
            }

            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
            // 프로필 이름 설정 (선택사항)
            if (displayName && userCredential.user) {
                await userCredential.user.updateProfile({
                    displayName: displayName
                });
            }

            this.currentUser = userCredential.user;
            return {
                success: true,
                user: this._formatUser(userCredential.user)
            };
        } catch (error) {
            return {
                success: false,
                error: this._handleError(error)
            };
        }
    }

    /**
     * 이메일/비밀번호로 로그인
     */
    async signIn(email, password) {
        try {
            if (typeof firebase === 'undefined' || !firebase.auth) {
                throw new Error('Firebase가 로드되지 않았습니다.');
            }

            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            
            return {
                success: true,
                user: this._formatUser(userCredential.user)
            };
        } catch (error) {
            return {
                success: false,
                error: this._handleError(error)
            };
        }
    }

    /**
     * 로그아웃
     */
    async signOut() {
        try {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                await firebase.auth().signOut();
                this.currentUser = null;
            }
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: this._handleError(error)
            };
        }
    }

    /**
     * 현재 로그인한 사용자 정보 반환
     */
    getCurrentUser() {
        if (this.currentUser) {
            return this._formatUser(this.currentUser);
        }
        return null;
    }

    /**
     * 로그인 상태 확인
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Firebase 사용자 객체를 표준 형식으로 변환
     * 나중에 다른 플랫폼으로 전환할 때 이 형식만 맞추면 됨
     */
    _formatUser(user) {
        if (!user) return null;
        
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            emailVerified: user.emailVerified,
            // 필요시 추가 필드
            photoURL: user.photoURL,
            createdAt: user.metadata?.creationTime,
            lastLoginAt: user.metadata?.lastSignInTime
        };
    }

    /**
     * 에러 메시지 한글화
     */
    _handleError(error) {
        const errorMessages = {
            'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
            'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
            'auth/operation-not-allowed': '이 작업은 허용되지 않습니다.',
            'auth/weak-password': '비밀번호가 너무 약합니다. (최소 6자 이상)',
            'auth/user-disabled': '비활성화된 계정입니다.',
            'auth/user-not-found': '등록되지 않은 이메일입니다.',
            'auth/wrong-password': '잘못된 비밀번호입니다.',
            'auth/network-request-failed': '네트워크 오류가 발생했습니다.',
            'auth/too-many-requests': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도하세요.'
        };

        return errorMessages[error.code] || error.message || '인증 오류가 발생했습니다.';
    }
}

// 전역 인증 서비스 인스턴스 생성
const authService = new AuthService();

