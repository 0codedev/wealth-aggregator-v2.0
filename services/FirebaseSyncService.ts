import { db } from '../database';
import { firestore } from '../lib/firebase';
import { collection, doc, writeBatch, getDocs, deleteDoc } from 'firebase/firestore';
import { logger } from './Logger';

/**
 * Pushes all Dexie local data to Firebase Firestore.
 * Stores data under: users/{userId}/{tableName}/{docId}
 * This is a heavy operation meant for manual sync.
 */
export const syncToCloud = async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
        logger.info('Starting full sync to Firebase Cloud...');

        // 1. Gather all local data
        const tables: Record<string, any[]> = {
            trades: await db.trades.toArray(),
            investments: await db.investments.toArray(),
            transactions: await db.transactions.toArray(),
            dividends: await db.dividends.toArray(),
            goals: await db.goals.toArray(),
            strategies: await db.strategies.toArray(),
            tax_records: await db.tax_records.toArray(),
            realized_transactions: await db.realized_transactions.toArray(),
            paper_trades: await db.paper_trades.toArray(),
            mistakes: await db.mistakes.toArray(),
            daily_reviews: await db.daily_reviews.toArray(),
            life_events: await db.life_events.toArray(),
            beneficiaries: await db.beneficiaries.toArray(),
            friends: await db.friends.toArray(),
        };

        // 2. Write each table to Firestore using batched writes
        for (const [tableName, rows] of Object.entries(tables)) {
            if (rows.length === 0) continue;

            // First, delete existing docs in the collection
            const colRef = collection(firestore, 'users', userId, tableName);
            const existingDocs = await getDocs(colRef);

            // Delete in batches of 500 (Firestore limit)
            const deleteBatches: ReturnType<typeof writeBatch>[] = [];
            let currentDeleteBatch = writeBatch(firestore);
            let deleteCount = 0;

            existingDocs.forEach((docSnap) => {
                currentDeleteBatch.delete(docSnap.ref);
                deleteCount++;
                if (deleteCount % 500 === 0) {
                    deleteBatches.push(currentDeleteBatch);
                    currentDeleteBatch = writeBatch(firestore);
                }
            });
            deleteBatches.push(currentDeleteBatch);
            await Promise.all(deleteBatches.map(b => b.commit()));

            // Now write new data in batches of 500
            const writeBatches: ReturnType<typeof writeBatch>[] = [];
            let currentBatch = writeBatch(firestore);
            let writeCount = 0;

            for (const item of rows) {
                // Use the item's id as document id, or generate one
                const docId = String(item.id || item.date || `${tableName}_${writeCount}`);
                const docRef = doc(firestore, 'users', userId, tableName, docId);

                // Clean the item (remove undefined values that Firestore doesn't like)
                const cleanItem = JSON.parse(JSON.stringify(item));
                currentBatch.set(docRef, cleanItem);
                writeCount++;

                if (writeCount % 500 === 0) {
                    writeBatches.push(currentBatch);
                    currentBatch = writeBatch(firestore);
                }
            }
            writeBatches.push(currentBatch);
            await Promise.all(writeBatches.map(b => b.commit()));

            logger.info(`Synced ${rows.length} records to ${tableName}`);
        }

        logger.info('Firebase Cloud sync complete!');
        return { success: true, message: 'Successfully synced to Firebase Cloud!' };

    } catch (error: any) {
        logger.error('Failed to sync to Firebase:', error);
        return { success: false, message: error.message || 'Sync failed.' };
    }
};

/**
 * Pulls all data from Firebase Firestore and overwrites local Dexie DB.
 * Similar to Nuclear Restore.
 */
export const pullFromCloud = async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
        logger.info('Starting full pull from Firebase Cloud...');

        const tableNames = [
            'trades', 'investments', 'transactions', 'dividends',
            'goals', 'strategies', 'tax_records', 'realized_transactions',
            'paper_trades', 'mistakes', 'daily_reviews', 'life_events',
            'beneficiaries', 'friends'
        ];

        const cloudData: Record<string, any[]> = {};

        for (const tableName of tableNames) {
            const colRef = collection(firestore, 'users', userId, tableName);
            const snapshot = await getDocs(colRef);
            cloudData[tableName] = snapshot.docs.map(d => d.data());
        }

        // Nuclear replace local Dexie with Cloud Data
        await db.transaction('rw', db.tables, async () => {
            await Promise.all(db.tables.map(table => table.clear()));

            for (const [tableName, rows] of Object.entries(cloudData)) {
                if (!Array.isArray(rows) || rows.length === 0) continue;
                try {
                    const table = db.table(tableName);
                    await table.bulkPut(rows);
                } catch (e) {
                    logger.warn(`Skipping table ${tableName} during restore:`, e);
                }
            }
        });

        logger.info('Local database updated from Firebase!');
        return { success: true, message: 'Data restored successfully from Firebase!' };

    } catch (error: any) {
        logger.error('Failed to pull from Firebase:', error);
        return { success: false, message: error.message || 'Pull failed.' };
    }
};
