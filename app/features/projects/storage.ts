export type Project = {
  id: string;
  name: string;
  experimentId: string;
  parameters: Record<string, number | string>;
  createdAt: number;
  updatedAt: number;
};

export interface ProjectStorage {
  saveProject(project: Project): Promise<void>;
  getProject(id: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  updateProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  duplicateProject(id: string): Promise<Project>;
}

const DB_NAME = "numera-projects";
const STORE = "projects";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const request = action(transaction.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

export const indexedDbProjectStorage: ProjectStorage = {
  saveProject: (project) => withStore("readwrite", (store) => store.put(project)).then(() => undefined),
  getProject: (id) => withStore("readonly", (store) => store.get(id)),
  getAllProjects: () => withStore("readonly", (store) => store.getAll()),
  updateProject: (project) => withStore("readwrite", (store) => store.put(project)).then(() => undefined),
  deleteProject: (id) => withStore("readwrite", (store) => store.delete(id)).then(() => undefined),
  async duplicateProject(id) {
    const project = await withStore<Project | undefined>("readonly", (store) => store.get(id));
    if (!project) throw new Error("Project not found");
    const copy = { ...project, id: crypto.randomUUID(), name: `${project.name} Copy`, createdAt: Date.now(), updatedAt: Date.now() };
    await this.saveProject(copy);
    return copy;
  },
};
