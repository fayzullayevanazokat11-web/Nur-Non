import { openDB } from 'idb';

const DB_NAME = 'NurNonReportsDB';
const STORE_NAME = 'reports';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
  },
});

export const addReport = async (report) => {
  return (await dbPromise).add(STORE_NAME, { ...report, timestamp: Date.now() });
};

export const getAllReports = async () => {
  return (await dbPromise).getAll(STORE_NAME);
};
