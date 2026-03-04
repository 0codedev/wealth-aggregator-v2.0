import React, { useState } from 'react';
import { Cloud, CloudOff, RefreshCw, Download, Upload, Loader2, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { syncToCloud, pullFromCloud } from '../../services/FirebaseSyncService';

interface CloudSyncPanelProps {
    onRestoreComplete?: () => void;
}

const CloudSyncPanel: React.FC<CloudSyncPanelProps> = ({ onRestoreComplete }) => {
    const { user, signOut } = useFirebaseAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = async (type: 'LOGIN' | 'SIGNUP') => {
        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            if (type === 'SIGNUP') {
                await createUserWithEmailAndPassword(auth, email, password);
                setStatus('success');
                setMessage('Account created! You are now signed in to Cloud Sync.');
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                setStatus('success');
                setMessage('Logged in to Cloud Sync successfully.');
            }
        } catch (error: any) {
            setStatus('error');
            const code = error.code || '';
            if (code === 'auth/user-not-found') setMessage('No account found with this email.');
            else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') setMessage('Incorrect password.');
            else if (code === 'auth/email-already-in-use') setMessage('Email already registered. Try logging in.');
            else if (code === 'auth/weak-password') setMessage('Password must be at least 6 characters.');
            else setMessage(error.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            await signInWithPopup(auth, googleProvider);
            setStatus('success');
            setMessage('Logged in to Cloud Sync successfully via Google.');
        } catch (error: any) {
            setStatus('error');
            const code = error.code || '';
            if (code === 'auth/popup-closed-by-user') setMessage('Google sign-in cancelled.');
            else setMessage(error.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSyncToCloud = async () => {
        if (!user) return;
        setIsLoading(true);
        setStatus('syncing');
        setMessage('Pushing data to cloud...');

        const result = await syncToCloud(user.uid);

        setStatus(result.success ? 'success' : 'error');
        setMessage(result.message);
        setIsLoading(false);
    };

    const handlePullFromCloud = async () => {
        if (!user) return;
        setIsLoading(true);
        setStatus('syncing');
        setMessage('Pulling data from cloud...');

        const result = await pullFromCloud(user.uid);

        setStatus(result.success ? 'success' : 'error');
        setMessage(result.message);
        setIsLoading(false);

        if (result.success && onRestoreComplete) {
            onRestoreComplete();
        }
    };

    return (
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${user ? 'bg-emerald-950/50 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                        {user ? <Cloud size={20} /> : <CloudOff size={20} />}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Firebase Cloud Sync</h3>
                        <p className="text-xs text-slate-500">
                            {user ? `Connected as ${user.email}` : 'Not connected'}
                        </p>
                    </div>
                </div>
                {user && (
                    <button
                        onClick={signOut}
                        className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Sign Out of Cloud Sync"
                    >
                        <LogOut size={16} />
                    </button>
                )}
            </div>

            {/* Status Message */}
            {message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-xs ${status === 'success' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/50' :
                    status === 'error' ? 'bg-red-950/30 text-red-400 border border-red-900/50' :
                        'bg-slate-800 text-slate-300'
                    }`}>
                    {status === 'success' && <CheckCircle size={14} />}
                    {status === 'error' && <AlertCircle size={14} />}
                    {status === 'syncing' && <Loader2 size={14} className="animate-spin" />}
                    {message}
                </div>
            )}

            {!user ? (
                // Auth UI
                <div className="space-y-3">
                    <p className="text-xs text-slate-400 mb-2">
                        Create an account or login to sync your data securely across all devices.
                    </p>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-orange-500 outline-none"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-orange-500 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                            onClick={() => handleAuth('LOGIN')}
                            disabled={isLoading}
                            className="py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => handleAuth('SIGNUP')}
                            disabled={isLoading}
                            className="py-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            Sign Up
                        </button>
                    </div>
                    <button
                        onClick={handleGoogleAuth}
                        disabled={isLoading}
                        className="w-full mt-3 py-2.5 bg-white hover:bg-slate-100 disabled:bg-slate-300 text-slate-900 border border-slate-200 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>
            ) : (
                // Sync Actions
                <div className="space-y-3 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleSyncToCloud}
                            disabled={isLoading}
                            className="py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            {isLoading && status === 'syncing' ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Upload size={16} />
                            )}
                            Sync to Cloud
                        </button>
                        <button
                            onClick={handlePullFromCloud}
                            disabled={isLoading}
                            className="py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            {isLoading && status === 'syncing' ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Download size={16} />
                            )}
                            Pull from Cloud
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center mt-2 px-4">
                        Pushing replaces cloud data with your current local data. Pulling replaces local data with cloud data.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CloudSyncPanel;
