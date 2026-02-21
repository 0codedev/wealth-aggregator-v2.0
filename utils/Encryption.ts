import CryptoJS from 'crypto-js';

// ==================== AES-256 Encryption Wrapper ====================
// Enterprise-grade encryption with proper key management
// Note: In production, Key Management Service (KMS) should be used.

/**
 * Secure random key generator
 */
function generateRandomKey(length: number = 32): string {
    const wordArray = CryptoJS.lib.WordArray.random(length);
    return wordArray.toString();
}

/**
 * Get or create encryption key with proper storage
 */
const ENCRYPTION_KEY_STORAGE_KEY = 'wealth-encryption-key-v3';
const KEY_SALT_STORAGE_KEY = 'wealth-encryption-salt';

function getEncryptionKey(): string {
    let key = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
    
    if (!key) {
        // Generate new key with additional entropy
        const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
        const timestamp = Date.now().toString();
        const randomComponent = generateRandomKey(16);
        
        // Create key with multiple entropy sources
        key = CryptoJS.SHA256(
            salt + timestamp + randomComponent + navigator.userAgent
        ).toString();
        
        // Store key and salt
        localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, key);
        localStorage.setItem(KEY_SALT_STORAGE_KEY, salt);
    }
    
    return key;
}

/**
 * Get salt used for key derivation
 */
function getKeySalt(): string {
    return localStorage.getItem(KEY_SALT_STORAGE_KEY) || '';
}

/**
 * Rotate encryption key (for security maintenance)
 * WARNING: This will invalidate all previously encrypted data
 */
export function rotateEncryptionKey(): void {
    const newKey = generateRandomKey(32);
    const newSalt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    
    localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, newKey);
    localStorage.setItem(KEY_SALT_STORAGE_KEY, newSalt);
}

// ==================== Core Encryption Functions ====================

/**
 * Encrypt data with AES-256
 * @param data - Plain text to encrypt
 * @param secretKey - Optional custom key (uses default if not provided)
 * @returns Encrypted string with IV prefix
 */
export const encryptData = (data: string, secretKey?: string): string => {
    try {
        if (!data) return '';
        
        const key = secretKey || getEncryptionKey();
        
        // Generate random IV for each encryption
        const iv = CryptoJS.lib.WordArray.random(16);
        
        const encrypted = CryptoJS.AES.encrypt(data, key, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        // Return IV + ciphertext for proper decryption
        return iv.toString() + ':' + encrypted.toString();
    } catch (error) {
        console.error("Encryption Failed:", error);
        return '';
    }
};

/**
 * Decrypt AES-256 encrypted data
 * @param ciphertext - Encrypted string with IV prefix
 * @param secretKey - Optional custom key (uses default if not provided)
 * @returns Decrypted plain text
 */
export const decryptData = (ciphertext: string, secretKey?: string): string => {
    try {
        if (!ciphertext) return '';
        
        const key = secretKey || getEncryptionKey();
        
        // Split IV and ciphertext
        const parts = ciphertext.split(':');
        if (parts.length !== 2) {
            // Legacy format without IV prefix (backward compatibility)
            const bytes = CryptoJS.AES.decrypt(ciphertext, key);
            return bytes.toString(CryptoJS.enc.Utf8);
        }

        const iv = CryptoJS.enc.Hex.parse(parts[0]);
        const encrypted = parts[1];

        const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        // Return empty if decryption fails (wrong password)
        return '';
    }
};

// ==================== Password Hashing ====================

/**
 * Hash password with SHA-256 (one-way, for verification)
 * @param password - Plain text password
 * @returns SHA-256 hash
 */
export const hashPassword = (password: string): string => {
    if (!password) return '';
    
    // Add salt for extra security
    const salt = getKeySalt() || 'wealth-default-salt';
    const saltedPassword = password + salt;
    
    return CryptoJS.SHA256(saltedPassword).toString();
};

/**
 * Verify password against hash
 * @param password - Plain text password to verify
 * @param hash - Stored hash to compare against
 * @returns Whether password matches
 */
export const verifyPassword = (password: string, hash: string): boolean => {
    const computedHash = hashPassword(password);
    
    // Constant-time comparison to prevent timing attacks
    if (computedHash.length !== hash.length) return false;
    
    let result = 0;
    for (let i = 0; i < computedHash.length; i++) {
        result |= computedHash.charCodeAt(i) ^ hash.charCodeAt(i);
    }
    
    return result === 0;
};

// ==================== Secure Storage Wrapper ====================

/**
 * Secure storage wrapper with automatic encryption/decryption
 */
export class SecureStorage {
    private storageKey: string;

    constructor(storageKey: string) {
        this.storageKey = storageKey;
    }

    /**
     * Store data with encryption
     */
    set<T>(data: T): void {
        try {
            const jsonString = JSON.stringify(data);
            const encrypted = encryptData(jsonString);
            localStorage.setItem(this.storageKey, encrypted);
        } catch (error) {
            console.error('Failed to encrypt and store data:', error);
            throw new Error('Storage encryption failed');
        }
    }

    /**
     * Retrieve and decrypt data
     */
    get<T>(): T | null {
        try {
            const encrypted = localStorage.getItem(this.storageKey);
            if (!encrypted) return null;
            
            const decrypted = decryptData(encrypted);
            if (!decrypted) return null;
            
            return JSON.parse(decrypted) as T;
        } catch (error) {
            console.error('Failed to retrieve and decrypt data:', error);
            return null;
        }
    }

    /**
     * Remove stored data
     */
    remove(): void {
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Check if data exists
     */
    exists(): boolean {
        return localStorage.getItem(this.storageKey) !== null;
    }

    /**
     * Update existing data with partial updates
     */
    update<T extends object>(updates: Partial<T>): T | null {
        const existing = this.get<T>();
        if (!existing) return null;
        
        const updated = { ...existing, ...updates };
        this.set(updated);
        return updated;
    }
}

// ==================== Auto-Encryption Functions ====================

/**
 * Encrypt data with auto-generated key (convenience function)
 */
export const encryptDataAuto = <T>(data: T): string => {
    const jsonString = JSON.stringify(data);
    return encryptData(jsonString);
};

/**
 * Decrypt data with auto-generated key (convenience function)
 */
export const decryptDataAuto = <T>(encryptedData: string): T | null => {
    try {
        const decrypted = decryptData(encryptedData);
        if (!decrypted) return null;
        return JSON.parse(decrypted) as T;
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
};

// ==================== Utility Functions ====================

/**
 * Check if encryption is available
 */
export const isEncryptionAvailable = (): boolean => {
    try {
        const testKey = 'test-' + Date.now();
        const encrypted = encryptData(testKey);
        const decrypted = decryptData(encrypted);
        return decrypted === testKey;
    } catch {
        return false;
    }
};

/**
 * Generate a secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
    return generateRandomKey(length);
};

// ==================== Predefined Secure Storage Instances ====================

export const secureApiKeyStorage = new SecureStorage('wealth-secure-api-key');
export const secureUserDataStorage = new SecureStorage('wealth-secure-user-data');
export const secureSettingsStorage = new SecureStorage('wealth-secure-settings');

// ==================== API Key Management ====================

/**
 * Securely store API key with validation
 */
export const storeApiKey = (service: string, apiKey: string): boolean => {
    if (!apiKey || typeof apiKey !== 'string') return false;
    
    // Validate API key format (basic check)
    if (apiKey.length < 10 || apiKey.length > 200) return false;
    
    const storage = new SecureStorage(`wealth-api-key-${service}`);
    storage.set({ key: apiKey, createdAt: new Date().toISOString() });
    return true;
};

/**
 * Retrieve stored API key
 */
export const getApiKey = (service: string): string | null => {
    const storage = new SecureStorage(`wealth-api-key-${service}`);
    const data = storage.get<{ key: string; createdAt: string }>();
    return data?.key || null;
};

/**
 * Remove stored API key
 */
export const removeApiKey = (service: string): void => {
    const storage = new SecureStorage(`wealth-api-key-${service}`);
    storage.remove();
};
