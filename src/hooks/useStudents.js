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
  serverTimestamp,
  or
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { encryptPassword } from '../services/encryption';

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, userData } = useAuth();

  useEffect(() => {
    if (!user || !userData) return;

    let q;
    if (userData.role === 'owner' || userData.role === 'handler') {
      // Owners/Handlers see all their students
      q = query(collection(db, 'students'), where('ownerId', '==', user.uid));
    } else if (userData.role === 'assistant') {
      // Assistants only see students specifically assigned to them
      q = query(collection(db, 'students'), where('assignedAssistantId', '==', user.uid));
    } else {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Students scope error:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, userData]);

  const addStudent = async (studentData) => {
    const encryptedPass = encryptPassword(studentData.vuPassword, user.uid);
    const normalizedVuId = studentData.vuId.trim().toUpperCase();

    return addDoc(collection(db, 'students'), {
      ...studentData,
      vuId: normalizedVuId,
      vuPassword: encryptedPass,
      portalPassword: (studentData.portalPassword || 'portal123').trim(),
      contactPrimary: studentData.contactPrimary || '',
      contactSecondary: studentData.contactSecondary || '',
      personalEmail: studentData.personalEmail || '',
      vuEmail: studentData.vuEmail || '',
      ownerId: userData.role === 'owner' ? user.uid : (userData.ownerId || user.uid),
      handlerId: user.uid, // The person who created the record
      assignedAssistantId: studentData.assignedAssistantId || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      subjects: studentData.subjects || [],
      feeDetails: {
        total: studentData.feeTotal || 0,
        installments: []
      }
    });
  };

  const updateStudent = async (id, studentData) => {
    const dataToUpdate = { ...studentData, updatedAt: serverTimestamp() };
    if (studentData.vuId) {
      dataToUpdate.vuId = studentData.vuId.trim().toUpperCase();
    }
    if (studentData.vuPassword) {
      dataToUpdate.vuPassword = encryptPassword(studentData.vuPassword, user.uid);
    }
    if (studentData.portalPassword) {
      dataToUpdate.portalPassword = studentData.portalPassword.trim();
    }
    return updateDoc(doc(db, 'students', id), dataToUpdate);
  };

  const deleteStudent = async (id) => {
    return deleteDoc(doc(db, 'students', id));
  };

  return { students, loading, addStudent, updateStudent, deleteStudent };
};
