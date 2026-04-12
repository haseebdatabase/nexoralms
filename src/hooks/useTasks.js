import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, userData } = useAuth();

  useEffect(() => {
    if (!user || !userData) return;

    let q;
    if (userData.role === 'owner' || userData.role === 'handler') {
      // Owners/Handlers see all tasks for their students
      q = query(
        collection(db, 'tasks'), 
        where('ownerId', '==', user.uid),
        orderBy('deadline', 'asc')
      );
    } else if (userData.role === 'assistant') {
      // Assistants only see tasks for students assigned to them
      q = query(
        collection(db, 'tasks'), 
        where('assignedAssistantId', '==', user.uid),
        orderBy('deadline', 'asc')
      );
    } else {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Tasks subscription error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, userData]);

  const addTask = async (taskData) => {
    try {
      const taskRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        ownerId: userData.role === 'owner' ? user.uid : (userData.ownerId || user.uid),
        handlerId: user.uid, // The person who created the task
        assignedAssistantId: taskData.assignedAssistantId || '',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // --- NEW: Global Activity Broadcast ---
      // We publish a generic footprint to the global radar so other handlers can discover it
      if (taskData.subject && taskData.type && taskData.deadline) {
        const globalId = `${taskData.subject.toUpperCase()}-${taskData.type}-${taskData.deadline}`;
        await setDoc(doc(db, 'globalActivities', globalId), {
          subject: taskData.subject.toUpperCase(),
          type: taskData.type,
          deadline: taskData.deadline,
          priority: taskData.priority || 'Medium',
          createdByHandlerName: userData.name || 'Anonymous Handler',
          createdAt: serverTimestamp(),
        }, { merge: true });
      }

      return taskRef;
    } catch (error) {
      console.error("Critical Task Save Error:", error);
      throw error;
    }
  };

  const updateTaskStatus = async (id, status) => {
    return updateDoc(doc(db, 'tasks', id), {
      status,
      updatedAt: serverTimestamp()
    });
  };

  const deleteTask = async (id) => {
    return deleteDoc(doc(db, 'tasks', id));
  };

  return { tasks, loading, addTask, updateTaskStatus, deleteTask };
};
