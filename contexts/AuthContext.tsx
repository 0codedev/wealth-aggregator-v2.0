import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { hashPassword } from '../utils/Encryption';
import { RateLimiter } from '../utils/security';
import { auditTrail, AuditAction } from '../services/SecurityService';
import { logger } from '../services/Logger';

interface UserProfile {
    name: string;
    avatar?: string;
    role: 'ADMIN' | 'VIEWER';
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLocked: boolean;
    user: UserProfile | null;
    login: (pin: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    lock: () => void;
    unlock: (pin: string) => Promise<{ success: boolean; error?: string }>;
    changePin: (currentPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;
    remainingAttempts: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Constants
const PIN_STORAGE_KEY = 'wealth_auth_pin_hash';
const SESSION_KEY = 'wealth_auth_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const DEFAULT_PIN_HASH = hashPassword('1234');

// Rate limiter: 5 attempts per 15 minutes
const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000);

/**
 * Secure PIN storage with hashed values
 */
const getStoredPinHash = (): string => {
    return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN_HASH;
};

const setStoredPinHash = (hash: string): void => {
    localStorage.setItem(PIN_STORAGE_KEY, hash);
};

/**
 * Constant-time string comparison to prevent timing attacks
 */
const constantTimeCompare = (a: string, b: string): boolean => {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLocked, setIsLocked] = useState<boolean>(true);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [remainingAttempts, setRemainingAttempts] = useState<number>(5);

    // Session timeout handler
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const resetTimeout = () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (isAuthenticated && !isLocked) {
                timeoutId = setTimeout(() => {
                    logger.info('Session timeout - locking application');
                    lock();
                }, SESSION_TIMEOUT);
            }
        };

        const handleActivity = () => resetTimeout();
        
        if (isAuthenticated && !isLocked) {
            window.addEventListener('mousemove', handleActivity);
            window.addEventListener('keydown', handleActivity);
            window.addEventListener('click', handleActivity);
            resetTimeout();
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
        };
    }, [isAuthenticated, isLocked]);

    // Check for existing session on mount
    useEffect(() => {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                const sessionAge = Date.now() - session.timestamp;
                
                // Check if session is still valid
                if (sessionAge < SESSION_TIMEOUT && session.active) {
                    setIsAuthenticated(true);
                    setIsLocked(true); // Always start locked for security
                    setUser({ name: session.userName || 'Portfolio Manager', role: 'ADMIN' });
                    logger.info('Restored existing session');
                } else {
                    // Clear expired session
                    localStorage.removeItem(SESSION_KEY);
                }
            } catch {
                localStorage.removeItem(SESSION_KEY);
            }
        }
    }, []);

    const verifyPin = useCallback((pin: string): boolean => {
        if (!pin || typeof pin !== 'string') return false;
        if (pin.length < 4 || pin.length > 8) return false;
        
        const storedHash = getStoredPinHash();
        const inputHash = hashPassword(pin);
        return constantTimeCompare(inputHash, storedHash);
    }, []);

    const login = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
        // Rate limiting check
        if (!authRateLimiter.canProceed('login')) {
            const remaining = authRateLimiter.getRemainingAttempts('login');
            setRemainingAttempts(remaining);
            const error = `Too many failed attempts. Please try again later.`;
            logger.warn('Login blocked due to rate limiting');
            return { success: false, error };
        }

        // Simulate network delay for security (prevents timing attacks)
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

        if (verifyPin(pin)) {
            setIsAuthenticated(true);
            setIsLocked(false);
            setUser({ name: 'Portfolio Manager', role: 'ADMIN' });
            
            // Store session
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                active: true,
                timestamp: Date.now(),
                userName: 'Portfolio Manager'
            }));
            
            // Reset rate limiter on successful login
            authRateLimiter.reset('login');
            setRemainingAttempts(5);
            
            auditTrail.log('login' as AuditAction, 'User logged in successfully');
            logger.info('User logged in successfully');
            
            return { success: true };
        }

        const remaining = authRateLimiter.getRemainingAttempts('login');
        setRemainingAttempts(remaining);
        
        auditTrail.log('login' as AuditAction, 'Failed login attempt');
        logger.warn('Failed login attempt');
        
        return { success: false, error: `Invalid PIN. ${remaining} attempts remaining.` };
    }, [verifyPin]);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setIsLocked(true);
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
        auditTrail.log('logout' as AuditAction, 'User logged out');
        logger.info('User logged out');
    }, []);

    const lock = useCallback(() => {
        setIsLocked(true);
        logger.info('Application locked');
    }, []);

    const unlock = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
        // Rate limiting check
        if (!authRateLimiter.canProceed('unlock')) {
            const remaining = authRateLimiter.getRemainingAttempts('unlock');
            setRemainingAttempts(remaining);
            return { success: false, error: 'Too many failed attempts. Please try again later.' };
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 100));

        if (verifyPin(pin)) {
            setIsLocked(false);
            authRateLimiter.reset('unlock');
            setRemainingAttempts(5);
            logger.info('Application unlocked');
            return { success: true };
        }

        const remaining = authRateLimiter.getRemainingAttempts('unlock');
        setRemainingAttempts(remaining);
        logger.warn('Failed unlock attempt');
        return { success: false, error: `Invalid PIN. ${remaining} attempts remaining.` };
    }, [verifyPin]);

    const changePin = useCallback(async (currentPin: string, newPin: string): Promise<{ success: boolean; error?: string }> => {
        // Validate new PIN
        if (!newPin || newPin.length < 4 || newPin.length > 8) {
            return { success: false, error: 'PIN must be between 4 and 8 characters.' };
        }

        if (!/^\d+$/.test(newPin)) {
            return { success: false, error: 'PIN must contain only numbers.' };
        }

        // Verify current PIN
        if (!verifyPin(currentPin)) {
            return { success: false, error: 'Current PIN is incorrect.' };
        }

        // Hash and store new PIN
        const newHash = hashPassword(newPin);
        setStoredPinHash(newHash);
        
        auditTrail.log('settings_changed' as AuditAction, 'PIN changed successfully');
        logger.info('PIN changed successfully');
        
        return { success: true };
    }, [verifyPin]);

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            isLocked, 
            user, 
            login, 
            logout, 
            lock, 
            unlock,
            changePin,
            remainingAttempts
        }}>
            {children}
        </AuthContext.Provider>
    );
};
