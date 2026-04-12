import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export const useTeam = () => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, userData } = useAuth();

  useEffect(() => {
    if (!user || userData?.role !== 'owner') return;

    const q = query(
      collection(db, 'users'), 
      where('ownerId', '==', user.uid),
      where('role', '==', 'assistant')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAssistants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [user, userData]);

  const addAssistant = async (assistantData) => {
    // In a real app, this would involve Firebase Auth creation or invitation.
    // For this build, we create the Firestore profile and assume login will be managed.
    return addDoc(collection(db, 'users'), {
      ...assistantData,
      role: 'assistant',
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      studentCount: 0,
      activeTasks: 0
    });
  };

  const removeAssistant = async (id) => {
    return deleteDoc(doc(db, 'users', id));
  };

  return { assistants, loading, addAssistant, removeAssistant };
};
