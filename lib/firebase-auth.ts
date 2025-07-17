import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { auth } from './firebase';

export class FirebaseAuthService {
  // Register a new user
  static async registerUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('FirebaseAuthService: Attempting to register user:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('FirebaseAuthService: User registered successfully:', userCredential.user.uid);
      
      return { success: true };
    } catch (error: any) {
      console.error('FirebaseAuthService: Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Login existing user
  static async loginUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('FirebaseAuthService: Attempting to login user:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('FirebaseAuthService: User logged in successfully:', userCredential.user.uid);
      
      return { success: true };
    } catch (error: any) {
      console.error('FirebaseAuthService: Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Logout current user
  static async logoutUser(): Promise<void> {
    try {
      console.log('FirebaseAuthService: Logging out user');
      await signOut(auth);
      console.log('FirebaseAuthService: User logged out successfully');
    } catch (error) {
      console.error('FirebaseAuthService: Logout error:', error);
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  // Listen for auth state changes
  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
} 