// Minimal IndexedDB helper for caching tasks (read-focused)
const DB_NAME = 'ytkn3'
const STORE = 'tasks'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: 'id' })
        os.createIndex('created_at', 'created_at')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function cacheTasks(tasks: any[]) {
  try {
    const db = await open()
    const tx = db.transaction(STORE, 'readwrite')
    const os = tx.objectStore(STORE)
    for (const t of tasks) os.put(t)
    await new Promise((res, rej) => { tx.oncomplete = () => res(null); tx.onerror = () => rej(tx.error) })
    db.close()
  } catch (_) { /* ignore */ }
}

export async function getCachedTasks(): Promise<any[]> {
  try {
    const db = await open()
    const tx = db.transaction(STORE, 'readonly')
    const os = tx.objectStore(STORE)
    const req = os.getAll()
    const data: any[] = await new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error) })
    db.close()
    // newest first
    return data.sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
  } catch (_) { return [] }
}

export async function removeCachedTask(id: string) {
  try {
    const db = await open()
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    await new Promise((res, rej) => { tx.oncomplete = () => res(null); tx.onerror = () => rej(tx.error) })
    db.close()
  } catch (_) { /* ignore */ }
}

