import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'user' | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 安全機制：如果 10 秒後還在載入，強制關閉載入狀態並顯示錯誤
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Auth check timed out");
        setLoading(false);
      }
    }, 10000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser ? `User: ${firebaseUser.email}` : "No user");
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let currentRole: 'admin' | 'user' = 'user';

          if (userDoc.exists()) {
            currentRole = userDoc.data().role;
            setRole(currentRole);
          } else {
            const userEmail = firebaseUser.email || "";
            currentRole = userEmail === 'chinlu0322@gmail.com' ? 'admin' : 'user';
            try {
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                email: userEmail,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: currentRole,
                createdAt: serverTimestamp()
              });
            } catch (e) {
              console.error("Failed to create user doc:", e);
            }
            setRole(currentRole);
          }
          console.log("Assigned role:", currentRole);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
