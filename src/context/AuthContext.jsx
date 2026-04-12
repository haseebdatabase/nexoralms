import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, name) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    
    await updateProfile(user, { displayName: name });
    
    // Create user profile in Firestore
    const userDoc = {
      uid: user.uid,
      name,
      email,
      role: email.toLowerCase() === 'haseebsaleem312@gmail.com' ? 'owner' : 'handler',
      createdAt: new Date().toISOString(),
      settings: {
        theme: 'dark'
      }
    };
    
    await setDoc(doc(db, 'users', user.uid), userDoc);
    return res;
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Absolute God-Tier Override
          if (currentUser.email === 'haseebsaleem312@gmail.com' && data.role !== 'owner') {
            data.role = 'owner';
            await updateDoc(docRef, { role: 'owner' });
          }
          
          setUserData(data);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
