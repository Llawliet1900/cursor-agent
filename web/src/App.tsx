import { useEffect, useMemo, useState } from "react";
import { api, type Task } from "./api";

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      setTasks(await api.list());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const remaining = useMemo(
    () => tasks.filter((t) => !t.done).length,
    [tasks],
  );

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    try {
      await api.create(value);
      setTitle("");
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function toggle(task: Task) {
    await api.toggle(task.id, !task.done);
    await refresh();
  }

  async function remove(task: Task) {
    await api.remove(task.id);
    await refresh();
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>Tasks</h1>
        <p className="app__subtitle">
          {loading
            ? "Loading…"
            : `${remaining} remaining · ${tasks.length} total`}
        </p>
      </header>

      <form className="composer" onSubmit={addTask}>
        <input
          className="composer__input"
          placeholder="Add a task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Task title"
        />
        <button className="composer__button" type="submit">
          Add
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="list">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`list__item ${task.done ? "list__item--done" : ""}`}
          >
            <label className="list__label">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggle(task)}
              />
              <span className="list__title">{task.title}</span>
            </label>
            <button
              className="list__delete"
              onClick={() => remove(task)}
              aria-label={`Delete ${task.title}`}
            >
              ×
            </button>
          </li>
        ))}
        {!loading && tasks.length === 0 && (
          <li className="list__empty">No tasks yet. Add your first one above.</li>
        )}
      </ul>
    </main>
  );
}
