import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export const useGlobalActivities = () => {
  const [globalActivities, setGlobalActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // We pull the latest 100 detected activities globally
    const q = query(
      collection(db, 'globalActivities'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGlobalActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Global Radar Subscription Error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return { globalActivities, loading };
};
