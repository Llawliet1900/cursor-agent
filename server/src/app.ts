import express, { type Express } from "express";
import cors from "cors";
import { serialize, type Db, type TaskRow } from "./db.js";

export function createApp(db: Db): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.get("/api/tasks", (_req, res) => {
    const rows = db
      .prepare("SELECT * FROM tasks ORDER BY done ASC, id DESC")
      .all() as TaskRow[];
    res.json(rows.map(serialize));
  });

  app.post("/api/tasks", (req, res) => {
    const title = String(req.body?.title ?? "").trim();
    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }
    const info = db.prepare("INSERT INTO tasks (title) VALUES (?)").run(title);
    const row = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(info.lastInsertRowid) as TaskRow;
    res.status(201).json(serialize(row));
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    const existing = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(id) as TaskRow | undefined;
    if (!existing) {
      return res.status(404).json({ error: "task not found" });
    }

    const nextTitle =
      req.body?.title === undefined
        ? existing.title
        : String(req.body.title).trim();
    if (!nextTitle) {
      return res.status(400).json({ error: "title cannot be empty" });
    }
    const nextDone =
      req.body?.done === undefined ? existing.done : req.body.done ? 1 : 0;

    db.prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ?").run(
      nextTitle,
      nextDone,
      id,
    );
    const row = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(id) as TaskRow;
    res.json(serialize(row));
  });

  app.delete("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    const info = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "task not found" });
    }
    res.status(204).end();
  });

  return app;
}
