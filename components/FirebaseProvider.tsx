"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDocFromServer, setDoc } from "firebase/firestore";

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Option to verify firestore connection and setup default profile
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDocFromServer(userDocRef);
          if (!docSnap.exists()) {
             await setDoc(userDocRef, {
               uid: currentUser.uid,
               planStartDate: new Date().toISOString().split('T')[0],
               dailyCalorieGoal: 2000,
               dailyProteinGoal: 150,
               dailyCarbGoal: 200,
               dailyFatGoal: 65,
               weight: 70,
               height: 175
             });
          }
        } catch (e) {
          console.error("Firebase auth/firestore error", e);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(console.error);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0C10] text-emerald-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#0A0C10] text-white p-6">
        <h1 className="text-2xl font-bold mb-4">Fitness Tracker</h1>
        <p className="text-slate-400 mb-8 text-center text-sm max-w-xs">Sign in to sync your data across devices and securely back it up offline.</p>
        <button 
          onClick={handleSignIn}
          className="bg-white text-black font-semibold py-3 px-6 rounded-2xl flex items-center space-x-3 shadow-lg shadow-white/10 hover:bg-slate-200 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
          <span>Sign in with Google</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
