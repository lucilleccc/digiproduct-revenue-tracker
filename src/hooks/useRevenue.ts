import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc, 
  getDocs,
  limit,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { IncomeSource, RevenueEntry, UserGoal } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { INITIAL_INCOME_SOURCES, DEFAULT_DAILY_TARGET, DEFAULT_MONTHLY_TARGET } from '../constants';
import { startOfDay, startOfMonth, format, subDays, isSameDay, parseISO } from 'date-fns';

export function useRevenue() {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [entries, setEntries] = useState<RevenueEntry[]>([]);
  const [goals, setGoals] = useState<UserGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) {
        setSources([]);
        setEntries([]);
        setGoals(null);
        setLoading(false);
      }
    });
  }, []);

  // Initialize Income Sources if none exist
  useEffect(() => {
    if (!user) return;

    const sourcesRef = collection(db, 'incomeSources');
    const q = query(sourcesRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // Pre-populate sources
        for (const name of INITIAL_INCOME_SOURCES) {
          try {
            await addDoc(collection(db, 'incomeSources'), {
              name,
              userId: user.uid
            });
          } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, 'incomeSources');
          }
        }
      } else {
        const sourceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IncomeSource));
        setSources(sourceData);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'incomeSources'));

    return unsubscribe;
  }, [user]);

  // Fetch Entries
  useEffect(() => {
    if (!user) return;

    const entriesRef = collection(db, 'revenueEntries');
    // We'll fetch entries for current month to start
    const startOfCurrentMonth = startOfMonth(new Date());
    const q = query(
      entriesRef, 
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RevenueEntry));
      setEntries(entryData);
      setLoading(false);
    }, (error) => {
      console.error(error);
      handleFirestoreError(error, OperationType.LIST, 'revenueEntries');
    });

    return unsubscribe;
  }, [user]);

  // Fetch Goals
  useEffect(() => {
    if (!user) return;

    const goalsRef = collection(db, 'userGoals');
    const q = query(goalsRef, where('userId', '==', user.uid), limit(1));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        const newGoal = {
          dailyTarget: DEFAULT_DAILY_TARGET,
          monthlyTarget: DEFAULT_MONTHLY_TARGET,
          userId: user.uid
        };
        try {
          await addDoc(collection(db, 'userGoals'), newGoal);
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, 'userGoals');
        }
      } else {
        const goalData = snapshot.docs[0].data() as UserGoal;
        setGoals({ id: snapshot.docs[0].id, ...goalData });
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'userGoals'));

    return unsubscribe;
  }, [user]);

  const addRevenue = async (sourceId: string, amount: number, date: string, notes?: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'revenueEntries'), {
        sourceId,
        amount,
        date,
        notes: notes || null,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'revenueEntries');
    }
  };

  const updateGoal = async (daily: number, monthly: number) => {
    if (!user || !goals) return;
    try {
      await setDoc(doc(db, 'userGoals', goals.id), {
        dailyTarget: daily,
        monthlyTarget: monthly,
        userId: user.uid
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `userGoals/${goals.id}`);
    }
  };

  const addSource = async (name: string) => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'incomeSources'), {
        name,
        userId: user.uid
      });
      return { id: docRef.id, name, userId: user.uid };
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'incomeSources');
    }
  };

  const deleteRevenue = async (id: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'revenueEntries', id), {}, { merge: false }); // Placeholder if we wanted soft delete, but we'll do real delete
      // Real delete:
      const { deleteDoc: firestoreDeleteDoc } = await import('firebase/firestore');
      await firestoreDeleteDoc(doc(db, 'revenueEntries', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `revenueEntries/${id}`);
    }
  };

  const updateRevenue = async (id: string, data: Partial<RevenueEntry>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'revenueEntries', id), {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `revenueEntries/${id}`);
    }
  };

  const importCSV = async (data: any[]) => {
    if (!user) return;
    
    // First, ensure all sources exist or create them
    const currentSources = [...sources];
    const sourceMap = new Map(currentSources.map(s => [s.name.toLowerCase(), s.id]));

    for (const row of data) {
      const sourceName = row.Source;
      if (sourceName && !sourceMap.has(sourceName.toLowerCase())) {
        const newSource = await addSource(sourceName);
        if (newSource) {
          sourceMap.set(sourceName.toLowerCase(), newSource.id);
        }
      }
    }

    // Now add entries
    for (const row of data) {
      const sId = sourceMap.get(row.Source?.toLowerCase());
      if (sId && row.Amount) {
        await addRevenue(sId, parseFloat(row.Amount), row.Date, row.Note);
      }
    }
  };

  return { sources, entries, goals, loading, user, addRevenue, updateGoal, addSource, importCSV, deleteRevenue, updateRevenue };
}
