import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { getProfileByUid } from '../services/firestoreService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      setLoading(false);

      if (!currentUser) {
        setProfile(null);
        return;
      }

      setProfile(null);
      getProfileByUid(currentUser.uid)
        .then((profileDoc) => {
          setProfile(profileDoc);
        })
        .catch((error) => {
          console.error('Failed to load user profile:', error);
          setProfile(null);
        });
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const profileDoc = await getProfileByUid(user.uid);
      setProfile(profileDoc);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      refreshProfile,
      loginWithEmail: (email, password) => signInWithEmailAndPassword(auth, email, password),
      signupWithEmail: (email, password) => createUserWithEmailAndPassword(auth, email, password),
      loginWithGoogle: () => signInWithPopup(auth, googleProvider),
      logout: () => signOut(auth),
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
