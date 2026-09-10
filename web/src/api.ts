export interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  list: () => fetch("/api/tasks").then((r) => handle<Task[]>(r)),
  create: (title: string) =>
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then((r) => handle<Task>(r)),
  toggle: (id: number, done: boolean) =>
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    }).then((r) => handle<Task>(r)),
  remove: (id: number) =>
    fetch(`/api/tasks/${id}`, { method: "DELETE" }).then((r) =>
      handle<void>(r),
    ),
};
