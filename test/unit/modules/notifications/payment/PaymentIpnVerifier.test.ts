import { describe, expect, it, vi } from "vitest";
import { SimPayIpnError } from "../../../../../src/errors/SimPayIpnError.js";
import { PaymentIpnSignature } from "../../../../../src/modules/notifications/payment/PaymentIpnSignature.js";
import { PaymentIpnVerifier } from "../../../../../src/modules/notifications/payment/PaymentIpnVerifier.js";

describe("PaymentIpnVerifier", () => {
  it("should return OK for valid payload", async () => {
    const signature = new PaymentIpnSignature();
    const ipValidator = { validate: vi.fn().mockResolvedValue(true) };
    const config = { ipn: { signatureKey: "SERVICE_IPN_KEY" } };

    const verifier = new PaymentIpnVerifier(
      signature,
      ipValidator as never,
      config as never,
    );

    const payload: Record<string, unknown> = {
      type: "ipn:test",
      notification_id: "nid-1",
      date: "2025-01-01T00:00:00Z",
      data: { service_id: "e65c7519", nonce: "abc" },
    };
    payload.signature = signature.generate(payload, "SERVICE_IPN_KEY");

    await expect(
      verifier.verify({ payload, sourceIp: "135.125.153.121" }),
    ).resolves.toBe("OK");
  });

  it("should throw when source ip is not allowed", async () => {
    const signature = new PaymentIpnSignature();
    const ipValidator = { validate: vi.fn().mockResolvedValue(false) };
    const config = { ipn: { signatureKey: "SERVICE_IPN_KEY" } };
    const verifier = new PaymentIpnVerifier(
      signature,
      ipValidator as never,
      config as never,
    );

    await expect(
      verifier.verify({ payload: {}, sourceIp: "8.8.8.8" }),
    ).rejects.toBeInstanceOf(SimPayIpnError);
    await expect(
      verifier.verify({ payload: {}, sourceIp: "8.8.8.8" }),
    ).rejects.toMatchObject({
      code: "IP_ADDRESS_NOT_WHITELISTED",
    });
  });

  it("should throw when signature key is missing", async () => {
    const signature = new PaymentIpnSignature();
    const ipValidator = { validate: vi.fn().mockResolvedValue(true) };
    const config = { ipn: { signatureKey: "" } };
    const verifier = new PaymentIpnVerifier(
      signature,
      ipValidator as never,
      config as never,
    );

    await expect(verifier.verify({ payload: {} })).rejects.toBeInstanceOf(
      SimPayIpnError,
    );
    await expect(verifier.verify({ payload: {} })).rejects.toMatchObject({
      code: "IPN_SIGNATURE_KEY_NOT_CONFIGURED",
    });
  });

  it("should throw when signature is invalid", async () => {
    const signature = new PaymentIpnSignature();
    const ipValidator = { validate: vi.fn().mockResolvedValue(true) };
    const config = { ipn: { signatureKey: "SERVICE_IPN_KEY" } };
    const verifier = new PaymentIpnVerifier(
      signature,
      ipValidator as never,
      config as never,
    );

    const payload = {
      type: "ipn:test",
      notification_id: "nid-1",
      date: "2025-01-01T00:00:00Z",
      data: { service_id: "e65c7519", nonce: "abc" },
      signature: "a".repeat(64),
    };

    await expect(verifier.verify({ payload })).rejects.toBeInstanceOf(
      SimPayIpnError,
    );
    await expect(verifier.verify({ payload })).rejects.toMatchObject({
      code: "INVALID_SIGNATURE",
    });
  });
});
