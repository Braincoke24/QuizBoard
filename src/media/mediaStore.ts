// src/media/mediaStore.ts

const DB_NAME = "quizboard-db"
const DB_VERSION = 1
const STORE_NAME = "media"

/**
 * A stored media asset.
 * This record is persisted in IndexedDB.
 */
export interface MediaAssetRecord {
    id: string
    type: "image" | "audio"
    mimeType: string
    blob: Blob
    size: number
    duration?: number
    createdAt: number
}

/**
 * Opens (or creates) the IndexedDB database.
 */
function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => {
            reject(new Error("Failed to open IndexedDB"))
        }

        request.onupgradeneeded = () => {
            const db = request.result

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: "id",
                })
            }
        }

        request.onsuccess = () => {
            resolve(request.result)
        }
    })
}

/**
 * Executes an IndexedDB transaction.
 */
async function withStore<T>(
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode)
        const store = transaction.objectStore(STORE_NAME)

        callback(store).then(resolve).catch(reject)

        transaction.onerror = () => {
            reject(transaction.error)
        }
    })
}

/**
 * Stores or replaces a media asset.
 */
export async function putMediaAsset(asset: MediaAssetRecord): Promise<void> {
    await withStore("readwrite", (store) => {
        return new Promise<void>((resolve, reject) => {
            const request = store.put(asset)

            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    })
}

/**
 * Loads a media asset by id.
 */
export async function getMediaAsset(
    id: string,
): Promise<MediaAssetRecord | null> {
    return withStore("readonly", (store) => {
        return new Promise((resolve, reject) => {
            const request = store.get(id)

            request.onsuccess = () => {
                resolve(request.result ?? null)
            }

            request.onerror = () => {
                reject(request.error)
            }
        })
    })
}

/**
 * Deletes a media asset.
 */
export async function deleteMediaAsset(id: string): Promise<void> {
    await withStore("readwrite", (store) => {
        return new Promise<void>((resolve, reject) => {
            const request = store.delete(id)

            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    })
}

/**
 * Checks whether a media asset exists.
 */
export async function hasMediaAsset(id: string): Promise<boolean> {
    return withStore("readonly", (store) => {
        return new Promise((resolve, reject) => {
            const request = store.getKey(id)

            request.onsuccess = () => {
                resolve(request.result !== undefined)
            }

            request.onerror = () => {
                reject(request.error)
            }
        })
    })
}

/**
 * Returns basic metadata for all stored media assets.
 * Useful for size estimation or cleanup.
 */
export async function listMediaAssets(): Promise<
    Pick<MediaAssetRecord, "id" | "type" | "size" | "duration" | "createdAt">[]
> {
    return withStore("readonly", (store) => {
        return new Promise((resolve, reject) => {
            const request = store.getAll()

            request.onsuccess = () => {
                const result = (request.result as MediaAssetRecord[]).map(
                    ({ id, type, size, duration, createdAt }) => ({
                        id,
                        type,
                        size,
                        duration,
                        createdAt,
                    }),
                )

                resolve(result)
            }

            request.onerror = () => {
                reject(request.error)
            }
        })
    })
}
