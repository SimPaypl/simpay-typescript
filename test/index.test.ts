import { describe, expect, it } from "vitest";
import { resolveClientConfig } from "../src/client/config.js";
import { SimPayClient } from "../src/index.js";

describe("SimPay SDK", () => {
  it("should create client instance", () => {
    const client = new SimPayClient({
      api: { password: "test" },
      service: { id: "service_id" },
      ipn: { signatureKey: "secret" },
    });

    expect(client).toBeDefined();
  });

  it("should expose modules", () => {
    const client = new SimPayClient({
      api: { password: "test" },
      service: { id: "service_id" },
      ipn: { signatureKey: "secret" },
    });

    expect(client.payments).toBeDefined();
    expect(client.notifications).toBeDefined();
  });

  it("should resolve config defaults", () => {
    const resolved = resolveClientConfig({
      api: { password: "test" },
      service: { id: "service_id" },
      ipn: { signatureKey: "secret" },
    });

    expect(resolved.api.timeout).toBe(10000);
    expect(resolved.ipn.validateSourceIp).toBe(false);
  });
});
