import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { LeaderboardRecord, StudentRecord } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection test
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}
testConnection();

// ==========================================
// REAL-TIME LEADERBOARD FIRESTORE SERVICE
// ==========================================

export function subscribeRealtimeLeaderboard(
  roomPassword: string | null,
  callback: (records: LeaderboardRecord[]) => void
): () => void {
  const path = 'leaderboard';
  try {
    const colRef = collection(db, path);
    // Top 30 scores sorted descending
    const q = query(colRef, orderBy('score', 'desc'), limit(30));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records: LeaderboardRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as LeaderboardRecord;
          if (!roomPassword || data.roomPassword === roomPassword) {
            records.push({
              id: docSnap.id,
              name: data.name,
              score: data.score,
              level: data.level,
              timeTakenSeconds: data.timeTakenSeconds || 0,
              solvedCount: data.solvedCount || 0,
              maxCombo: data.maxCombo || 0,
              title: data.title || '대칭 탐험대원',
              date: data.date || new Date().toLocaleDateString('ko-KR'),
            });
          }
        });
        callback(records);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

export async function saveRecordToFirestore(record: LeaderboardRecord, roomPassword: string): Promise<void> {
  const path = 'leaderboard';
  const cleanId = record.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
  try {
    await setDoc(doc(db, path, cleanId), {
      id: cleanId,
      name: record.name.slice(0, 30),
      score: record.score,
      level: record.level,
      timeTakenSeconds: record.timeTakenSeconds,
      solvedCount: record.solvedCount,
      maxCombo: record.maxCombo,
      title: record.title.slice(0, 50),
      roomPassword: roomPassword.slice(0, 30),
      createdAt: new Date().toISOString(),
      date: record.date,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${cleanId}`);
  }
}

// ==========================================
// REAL-TIME CLASSROOM STUDENTS SERVICE
// ==========================================

export function subscribeRealtimeClassroom(
  roomPassword: string,
  callback: (students: StudentRecord[]) => void
): () => void {
  const path = 'classroom_students';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('roomPassword', '==', roomPassword));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const students: StudentRecord[] = [];
        snapshot.forEach((docSnap) => {
          students.push(docSnap.data() as StudentRecord);
        });
        students.sort((a, b) => b.score - a.score || b.updatedAt - a.updatedAt);
        callback(students);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

export async function upsertStudentToFirestore(student: StudentRecord): Promise<void> {
  const path = 'classroom_students';
  const cleanId = student.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
  try {
    await setDoc(doc(db, path, cleanId), {
      id: cleanId,
      nickname: student.nickname.slice(0, 30),
      roomPassword: student.roomPassword.slice(0, 30),
      score: student.score,
      level: student.level,
      solvedCount: student.solvedCount,
      maxCombo: student.maxCombo,
      status: student.status,
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${cleanId}`);
  }
}

export async function clearClassroomFromFirestore(roomPassword: string): Promise<void> {
  const path = 'classroom_students';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('roomPassword', '==', roomPassword));
    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(promises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
