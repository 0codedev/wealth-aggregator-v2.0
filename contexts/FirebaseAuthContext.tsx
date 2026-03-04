import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface FirebaseAuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
});

export const useFirebaseAuth = () => useContext(FirebaseAuthContext);

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                setUser(firebaseUser);
                setLoading(false);
            }, (error) => {
                console.warn("Firebase auth error:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err) {
            console.warn("Firebase auth initialization skipped:", err);
            setLoading(false);
            return () => { };
        }
    }, []);

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    return (
        <FirebaseAuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </FirebaseAuthContext.Provider>
    );
};
