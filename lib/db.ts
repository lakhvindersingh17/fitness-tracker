import { useState, useEffect } from 'react';
import { db as firestore, auth } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, onSnapshot, orderBy, serverTimestamp, getDocs } from 'firebase/firestore';

export interface LogEntry {
  id?: string;
  date: string;
  type: 'food' | 'workout' | 'activity_summary';
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  duration?: number;
  steps?: number;
  move?: number;
  activeCalories?: number;
  source?: 'manual' | 'apple_watch';
  timestamp: number;
}

export interface UserSettings {
  id?: string;
  uid?: string;
  planStartDate: string;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbGoal: number;
  dailyFatGoal: number;
  weight?: number;
  height?: number;
}

// Emulate Dexie's useLiveQuery interface for smooth migration
export function useLiveQuery<T>(queryFn: () => Promise<T> | T | undefined, deps: any[] = []): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    let unsubscribe: () => void;
    
    const runQuery = () => {
      const result: any = queryFn();
      if (result && result.__isFirestoreRef) {
        unsubscribe = onSnapshot(result.ref, (snapshot: any) => {
          if (result.type === 'collection') {
            const items = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            setData(items as any);
          } else if (result.type === 'doc') {
            if (snapshot.exists()) {
              setData({ id: snapshot.id, ...snapshot.data() } as any);
            } else {
              setData(undefined);
            }
          }
        });
      } else if (result instanceof Promise) {
        result.then(setData);
      } else {
        setData(result);
      }
    };

    runQuery();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, deps);

  return data;
}

// Proxied DB interface
export const db = {
  settings: {
    toCollection: () => ({
      first: (): Promise<UserSettings | undefined> => {
        if (!auth.currentUser) return undefined as any;
        return {
          __isFirestoreRef: true,
          type: 'doc',
          ref: doc(firestore, 'users', auth.currentUser.uid)
        } as any;
      }
    }),
    count: async () => {
      if (!auth.currentUser) return 0;
      const d = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
      return d.exists() ? 1 : 0;
    },
    add: async (data: UserSettings) => {
      if (!auth.currentUser) return;
      await setDoc(doc(firestore, 'users', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        ...data
      });
    },
    update: async (id: string, data: Partial<UserSettings>) => {
      if (!auth.currentUser) return;
      await updateDoc(doc(firestore, 'users', auth.currentUser.uid), data);
    }
  },
  logs: {
    add: async (data: LogEntry) => {
      if (!auth.currentUser) return;
      const ref = doc(collection(firestore, 'users', auth.currentUser.uid, 'logs'));
      await setDoc(ref, {
        userId: auth.currentUser.uid,
        ...data,
        createdAt: serverTimestamp()
      });
    },
    where: (field: string) => ({
      equals: (val: string) => ({
        toArray: (): Promise<LogEntry[]> => {
           if (!auth.currentUser) return undefined as any;
           return {
             __isFirestoreRef: true,
             type: 'collection',
             ref: query(collection(firestore, 'users', auth.currentUser.uid, 'logs'), where(field, '==', val))
           } as any;
        }
      })
    }),
    toArray: (): Promise<LogEntry[]> => {
      if (!auth.currentUser) return undefined as any;
      return {
        __isFirestoreRef: true,
        type: 'collection',
        ref: query(collection(firestore, 'users', auth.currentUser.uid, 'logs'))
      } as any;
    }
  }
};
