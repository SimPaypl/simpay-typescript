import { describe, expect, it } from "vitest";
import { PaymentIpnSignature } from "../../../../../src/modules/notifications/payment/PaymentIpnSignature.js";

describe("PaymentIpnSignature", () => {
  it("should generate deterministic signature", () => {
    const signature = new PaymentIpnSignature();
    const payload = {
      type: "transaction:status_changed",
      notification_id: "nid-1",
      date: "2025-01-01T00:00:00Z",
      data: {
        status: "transaction_paid",
        amount: { currency: "PLN", value: "5.25" },
      },
    };

    const a = signature.generate(payload, "SERVICE_IPN_KEY");
    const b = signature.generate(payload, "SERVICE_IPN_KEY");

    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should validate correct signature", () => {
    const signature = new PaymentIpnSignature();
    const payload: Record<string, unknown> = {
      type: "ipn:test",
      notification_id: "nid-2",
      date: "2025-01-01T00:00:00Z",
      data: { service_id: "e65c7519", nonce: "abc" },
    };

    payload.signature = signature.generate(payload, "SERVICE_IPN_KEY");

    expect(signature.isValid(payload, "SERVICE_IPN_KEY")).toBe(true);
  });

  it("should return false for invalid signature hex", () => {
    const signature = new PaymentIpnSignature();
    const payload: Record<string, unknown> = {
      type: "ipn:test",
      notification_id: "nid-3",
      date: "2025-01-01T00:00:00Z",
      data: { service_id: "e65c7519", nonce: "abc" },
      signature: "not-a-hex",
    };

    expect(signature.isValid(payload, "SERVICE_IPN_KEY")).toBe(false);
  });

  it("should return false when signature is missing", () => {
    const signature = new PaymentIpnSignature();
    const payload: Record<string, unknown> = {
      type: "ipn:test",
      notification_id: "nid-4",
      date: "2025-01-01T00:00:00Z",
      data: { service_id: "e65c7519", nonce: "abc" },
    };

    expect(signature.isValid(payload, "SERVICE_IPN_KEY")).toBe(false);
  });
});
