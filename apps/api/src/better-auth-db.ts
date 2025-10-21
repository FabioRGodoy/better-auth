import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getBetterAuthDb(): Promise<Db> {
  if (db) return db;
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não definido');
  }
  client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();
  db = client.db();
  return db;
}
