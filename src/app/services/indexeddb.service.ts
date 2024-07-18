import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class IndexedDBService {
    private dbName = 'embedelite-db';
    private chatStoreName = 'chats';
    private dbPromise: Promise<IDBDatabase>;

    constructor() {
        this.dbPromise = this.initDatabase();
    }

    private initDatabase(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.chatStoreName)) {
                    db.createObjectStore(this.chatStoreName, { keyPath: 'id' });
                }
            };

            request.onsuccess = (event: any) => {
                console.log('IndexedDB initialized successfully.');
                resolve(event.target.result);
            };

            request.onerror = (event: any) => {
                console.error('IndexedDB initialization error:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async setChatItem(key: string, value: any): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.chatStoreName], 'readwrite');
            const objectStore = transaction.objectStore(this.chatStoreName);
            const request = objectStore.put({ id: key, value });

            request.onsuccess = () => {
                console.log('Chat item stored successfully.');
                resolve();
            };

            request.onerror = (event: any) => {
                console.error('Error storing chat item:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getChatItem<T>(key: string): Promise<T | null> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.chatStoreName], 'readonly');
            const objectStore = transaction.objectStore(this.chatStoreName);
            const request = objectStore.get(key);

            request.onsuccess = (event: any) => {
                resolve(event.target.result ? event.target.result.value : null);
            };

            request.onerror = (event: any) => {
                console.error('Error retrieving chat item:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getAllChatItems<T>(): Promise<T[]> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.chatStoreName], 'readonly');
            const objectStore = transaction.objectStore(this.chatStoreName);
            const request = objectStore.getAll();

            request.onsuccess = (event: any) => {
                resolve(event.target.result ? event.target.result.map((item: any) => item.value) : []);
            };

            request.onerror = (event: any) => {
                console.error('Error retrieving chat items:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async removeChatItem(key: string): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.chatStoreName], 'readwrite');
            const objectStore = transaction.objectStore(this.chatStoreName);
            const request = objectStore.delete(key);

            request.onsuccess = () => {
                console.log('Chat item deleted successfully.');
                resolve();
            };

            request.onerror = (event: any) => {
                console.error('Error deleting chat item:', event.target.error);
                reject(event.target.error);
            };
        });
    }
}
