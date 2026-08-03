import request from "supertest";
import { createApp } from "../server";
import { loadRuntimeConfig, RuntimeConfig } from "../runtime";

describe("runtime-aware health probes", () => {
  const config = loadRuntimeConfig({
    NODE_ENV: "test",
    PHYTO_STORAGE_MODE: "memory",
  });
  const app = createApp(config);

  it("reports liveness separately from storage readiness", async () => {
    const res = await request(app).get("/health").expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
    expect(res.body.data.runtimeMode).toBe("test");
    expect(res.body.data.storageMode).toBe("memory");
  });

  it("reports memory mode ready only in an allowed runtime", async () => {
    const res = await request(app).get("/health/ready").expect(200);

    expect(res.body).toEqual(expect.objectContaining({
      success: true,
      data: {
        status: "ready",
        runtimeMode: "test",
        storageMode: "memory",
        database: "not_required",
      },
    }));
  });

  it("cannot load a production app without database-backed storage", () => {
    expect(() => createApp(loadRuntimeConfig({
      PHYTO_RUNTIME_MODE: "production",
    }))).toThrow(/requires DATABASE_URL|cannot use in-memory storage/);
  });

  it("rejects a forged production-memory object at the application factory", () => {
    const forged: RuntimeConfig = {
      runtimeMode: "production",
      storageMode: "memory",
      databaseConfigured: false,
      authMode: "disabled",
      oidc: null,
      port: 3000,
    };

    expect(() => createApp(forged)).toThrow(
      /produced by loadRuntimeConfig/
    );
  });
});
