import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export interface TaskRow {
  id: number;
  title: string;
  done: number;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
}

export function serialize(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    done: Boolean(row.done),
    createdAt: row.createdAt,
  };
}

export type Db = Database.Database;

export function createDb(file: string): Db {
  if (file !== ":memory:") {
    mkdirSync(dirname(file), { recursive: true });
  }
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}
