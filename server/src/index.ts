import { createApp } from "./app.js";
import { createDb } from "./db.js";

const PORT = Number(process.env.PORT ?? 3001);
const DB_FILE = process.env.DB_FILE ?? "data/tasks.db";

const db = createDb(DB_FILE);
const app = createApp(db);

app.listen(PORT, () => {
  console.log(`[server] Tasks API listening on http://localhost:${PORT}`);
  console.log(`[server] Using database file: ${DB_FILE}`);
});
