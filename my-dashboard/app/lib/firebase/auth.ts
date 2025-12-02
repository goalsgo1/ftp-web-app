import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { auth } from './config';

// 로그인
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// 회원가입
export const signUp = async (email: string, password: string, displayName?: string): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  
  return userCredential;
};

// 로그아웃
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// 비밀번호 재설정 이메일 전송
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// 인증 상태 변경 감지
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// 현재 사용자 가져오기
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

