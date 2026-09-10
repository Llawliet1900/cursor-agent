import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../src/app.js";
import { createDb, type Db } from "../src/db.js";

let db: Db;
let app: Express;

beforeEach(() => {
  db = createDb(":memory:");
  app = createApp(db);
});

afterEach(() => {
  db.close();
});

describe("Tasks API", () => {
  it("reports health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("starts with an empty list", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("creates a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Write docs" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "Write docs", done: false });
    expect(res.body.id).toBeTypeOf("number");
  });

  it("rejects an empty title", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "   " });
    expect(res.status).toBe(400);
  });

  it("toggles a task done and back", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Ship it" });
    const id = created.body.id;

    const done = await request(app).patch(`/api/tasks/${id}`).send({ done: true });
    expect(done.status).toBe(200);
    expect(done.body.done).toBe(true);

    const undone = await request(app)
      .patch(`/api/tasks/${id}`)
      .send({ done: false });
    expect(undone.body.done).toBe(false);
  });

  it("deletes a task", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Temporary" });
    const id = created.body.id;

    const del = await request(app).delete(`/api/tasks/${id}`);
    expect(del.status).toBe(204);

    const list = await request(app).get("/api/tasks");
    expect(list.body).toEqual([]);
  });

  it("returns 404 for a missing task", async () => {
    const res = await request(app).patch("/api/tasks/9999").send({ done: true });
    expect(res.status).toBe(404);
  });
});
