import { useState, useEffect, createContext, useContext } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { ref, set, get, update } from 'firebase/database';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for redirect result first
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('✅ Google sign-in successful:', result.user.email);
          
          // Create/update user in database
          const userRef = ref(db, `users/${result.user.uid}`);
          const snapshot = await get(userRef);
          
          if (!snapshot.exists()) {
            await set(userRef, {
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              favorites: [],
              createdAt: new Date().toISOString()
            });
            console.log('✅ User created in database');
          }
        }
      } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
          console.error('❌ Redirect error:', error);
        }
      }
    };

    checkRedirect();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser?.email || 'No user');
      
      if (firebaseUser) {
        try {
          const userRef = ref(db, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          const userData = snapshot.val();
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || userData?.displayName || 'User',
            photoURL: firebaseUser.photoURL || userData?.photoURL || '',
            favorites: userData?.favorites || []
          });
          
          console.log('✅ User loaded:', firebaseUser.email);
        } catch (error) {
          console.error('❌ Error loading user data:', error);
        }
      } else {
        setUser(null);
        console.log('❌ No user signed in');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userRef = ref(db, `users/${result.user.uid}`);
      await set(userRef, {
        email,
        displayName,
        favorites: [],
        createdAt: new Date().toISOString()
      });
      console.log('✅ Signup successful');
      return result;
    } catch (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful');
      return result;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      
      // Try popup first (faster)
      try {
        const result = await signInWithPopup(auth, provider);
        console.log('✅ Google popup sign-in successful');
        
        // Create user in database if new
        const userRef = ref(db, `users/${result.user.uid}`);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
          await set(userRef, {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            favorites: [],
            createdAt: new Date().toISOString()
          });
        }
        
        return result;
      } catch (popupError) {
        // If popup blocked, fall back to redirect
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/cancelled-popup-request') {
          console.log('🔄 Popup blocked, using redirect...');
          await signInWithRedirect(auth, provider);
        } else {
          throw popupError;
        }
      }
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  };

  const addToFavorites = async (movieId) => {
    if (!user) return;
    
    try {
      const newFavorites = [...(user.favorites || []), movieId];
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, { favorites: newFavorites });
      setUser({ ...user, favorites: newFavorites });
      console.log('✅ Added to favorites');
    } catch (error) {
      console.error('❌ Error adding to favorites:', error);
      throw error;
    }
  };

  const removeFromFavorites = async (movieId) => {
    if (!user) return;
    
    try {
      const newFavorites = user.favorites.filter(id => id !== movieId);
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, { favorites: newFavorites });
      setUser({ ...user, favorites: newFavorites });
      console.log('✅ Removed from favorites');
    } catch (error) {
      console.error('❌ Error removing from favorites:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    addToFavorites,
    removeFromFavorites
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
