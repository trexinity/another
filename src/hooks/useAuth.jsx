import { useState, useEffect, createContext, useContext } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { ref, set, get } from 'firebase/database';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for redirect result when component mounts
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          console.log('Google sign-in successful!');
          const userRef = ref(db, `users/${result.user.uid}`);
          const snapshot = await get(userRef);
          
          if (!snapshot.exists()) {
            await set(userRef, {
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              favorites: [],
              watchHistory: [],
              createdAt: new Date().toISOString()
            });
          }
        }
      })
      .catch((error) => {
        console.error('Google sign-in error:', error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || userData?.displayName || 'User',
          photoURL: user.photoURL || userData?.photoURL || '',
          favorites: userData?.favorites || [],
          watchHistory: userData?.watchHistory || []
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const userRef = ref(db, `users/${result.user.uid}`);
    await set(userRef, {
      email,
      displayName,
      favorites: [],
      watchHistory: [],
      createdAt: new Date().toISOString()
    });
    return result;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithRedirect(auth, provider);
  };

  const logout = () => {
    return signOut(auth);
  };

  const addToFavorites = async (movieId) => {
    if (!user) return;
    const newFavorites = [...(user.favorites || []), movieId];
    const userRef = ref(db, `users/${user.uid}/favorites`);
    await set(userRef, newFavorites);
    setUser({ ...user, favorites: newFavorites });
  };

  const removeFromFavorites = async (movieId) => {
    if (!user) return;
    const newFavorites = user.favorites.filter(id => id !== movieId);
    const userRef = ref(db, `users/${user.uid}/favorites`);
    await set(userRef, newFavorites);
    setUser({ ...user, favorites: newFavorites });
  };

  const addToHistory = async (movieId) => {
    if (!user) return;
    const watchHistory = user.watchHistory || [];
    if (!watchHistory.includes(movieId)) {
      const newHistory = [...watchHistory, movieId];
      const userRef = ref(db, `users/${user.uid}/watchHistory`);
      await set(userRef, newHistory);
      setUser({ ...user, watchHistory: newHistory });
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
    removeFromFavorites,
    addToHistory
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
