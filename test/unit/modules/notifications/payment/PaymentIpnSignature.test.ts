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
  // Payloads built and signed the way SimPay's IPN sender does it in PHP:
  // implode('|') over all values, where null becomes an empty string.
  it("should validate IPN v1 payload signed by SimPay", () => {
    const payload = JSON.parse(
      '{"id":"9b1c...-uuid","service_id":"ab12cd34","status":"transaction_paid","amount":{"value":10,"currency":"PLN","commission":0.25},"control":"order-15","channel":"blik","environment":"production","signature":"1a387c04fd0918cf706db4328843e25e7c5cdb1859a993c6c07d48f81ed64b63"}',
    );

    expect(new PaymentIpnSignature().isValid(payload, "ipn-key-123")).toBe(
      true,
    );
  });

  it("should validate IPN v2 payload with null fields signed by SimPay", () => {
    const payload = JSON.parse(
      '{"type":"transaction:status_changed","notification_id":"0193...","date":"2026-11-22T10:00:01+01:00","data":{"id":"tx-uuid","payer_transaction_id":"SP-123","service_id":"ab12cd34","status":"transaction_paid","amount":{"final_currency":"PLN","final_value":"10.00","original_currency":"PLN","original_value":"10.00","commission_system":"0.25","commission_partner":"9.75","commission_currency":null},"payment":{"channel":"blik","type":null},"customer":{"country_code":null},"paid_at":"2026-11-22T10:00:00+01:00","created_at":"2026-11-22T09:59:00+01:00"},"signature":"980e83a4616c9f88b7134d254c1cc1b842f03b7198f0a4fc0620bc88e2fafde7"}',
    );

    expect(new PaymentIpnSignature().isValid(payload, "ipn-key-123")).toBe(
      true,
    );
    expect(new PaymentIpnSignature().isValid(payload, "other-key")).toBe(false);
  });

  it("should treat booleans like PHP implode", () => {
    const signature = new PaymentIpnSignature();
    const payload = { type: "ipn:test", data: { a: true, b: false, c: null } };

    expect(signature.generate(payload, "KEY")).toBe(
      signature.generate(
        { type: "ipn:test", data: { a: "1", b: "", c: "" } },
        "KEY",
      ),
    );
  });
});
