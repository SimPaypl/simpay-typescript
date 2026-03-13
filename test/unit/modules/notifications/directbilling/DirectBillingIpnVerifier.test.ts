import { describe, expect, it, vi } from "vitest";
import { SimPayIpnError } from "../../../../../src/index.js";
import { DirectBillingIpnSignature } from "../../../../../src/modules/notifications/directbilling/DirectBillingIpnSignature.js";
import { DirectBillingIpnVerifier } from "../../../../../src/modules/notifications/directbilling/DirectBillingIpnVerifier.js";
import type { DirectBillingTransactionNotification } from "../../../../../src/types/index.js";

describe("DirectBillingIpnVerifier", () => {
  const makePayload = (): DirectBillingTransactionNotification => ({
    id: "dc261d4f-31ef-4728-bfd6-97bbe2a5ef0a",
    serviceId: "e14f8074",
    status: "transaction_db_payed",
    values: {
      net: 11.07,
      gross: 13.61,
      partner: 5,
    },
    returns: {
      complete: "https://www.simpay.pl/complete",
      failure: "https://www.simpay.pl/failure",
    },
    control: "test",
    number_from: "48123123123",
    provider: 1,
    signature: "",
  });

  it("should return OK for valid payload", async () => {
    const signature = new DirectBillingIpnSignature();
    const ipValidator = { validate: vi.fn().mockResolvedValue(true) };
    const config = { ipn: { signatureKey: "SERVICE_IPN_KEY" } };

    const verifier = new DirectBillingIpnVerifier(
      signature,
      ipValidator as never,
      config as never,
    );

    const payload = makePayload();
    payload.signature = signature.generate(payload, "SERVICE_IPN_KEY");

    await expect(
      verifier.verify({ payload, sourceIp: "135.125.153.121" }),
    ).resolves.toBe("OK");
  });

  it("should throw when source ip is not allowed", async () => {
    const signature = new DirectBillingIpnSignature();
    const ipValidator = { validate: vi.fn().mockResolvedValue(false) };
    const config = { ipn: { signatureKey: "SERVICE_IPN_KEY" } };

    const verifier = new DirectBillingIpnVerifier(
      signature,
      ipValidator as never,
      config as never,
    );

    await expect(
      verifier.verify({ payload: makePayload(), sourceIp: "8.8.8.8" }),
    ).rejects.toBeInstanceOf(SimPayIpnError);
    await expect(
      verifier.verify({ payload: makePayload(), sourceIp: "8.8.8.8" }),
    ).rejects.toMatchObject({
      code: "IP_ADDRESS_NOT_WHITELISTED",
    });
  });

  it("should throw when signature key is missing", async () => {
    const signature = new DirectBillingIpnSignature();
    const ipValidator = { validate: vi.fn().mockResolvedValue(true) };
    const config = { ipn: { signatureKey: "" } };

    const verifier = new DirectBillingIpnVerifier(
      signature,
      ipValidator as never,
      config as never,
    );

    await expect(
      verifier.verify({ payload: makePayload() }),
    ).rejects.toBeInstanceOf(SimPayIpnError);
    await expect(
      verifier.verify({ payload: makePayload() }),
    ).rejects.toMatchObject({
      code: "IPN_SIGNATURE_KEY_NOT_CONFIGURED",
    });
  });

  it("should throw when payload shape is invalid", async () => {
    const signature = new DirectBillingIpnSignature();
    const ipValidator = { validate: vi.fn().mockResolvedValue(true) };
    const config = { ipn: { signatureKey: "SERVICE_IPN_KEY" } };

    const verifier = new DirectBillingIpnVerifier(
      signature,
      ipValidator as never,
      config as never,
    );

    const payload = { foo: "bar" };

    await expect(verifier.verify({ payload })).rejects.toBeInstanceOf(
      SimPayIpnError,
    );
    await expect(verifier.verify({ payload })).rejects.toMatchObject({
      code: "INVALID_IPN_PAYLOAD",
    });
  });

  it("should throw when signature is invalid", async () => {
    const signature = new DirectBillingIpnSignature();
    const ipValidator = { validate: vi.fn().mockResolvedValue(true) };
    const config = { ipn: { signatureKey: "SERVICE_IPN_KEY" } };

    const verifier = new DirectBillingIpnVerifier(
      signature,
      ipValidator as never,
      config as never,
    );

    const payload: DirectBillingTransactionNotification = makePayload();
    payload.signature = "a".repeat(64);

    await expect(verifier.verify({ payload })).rejects.toBeInstanceOf(
      SimPayIpnError,
    );
    await expect(verifier.verify({ payload })).rejects.toMatchObject({
      code: "INVALID_SIGNATURE",
    });
  });

  it("should verify signature only", () => {
    const signature = new DirectBillingIpnSignature();
    const ipValidator = { validate: vi.fn().mockResolvedValue(true) };
    const config = { ipn: { signatureKey: "SERVICE_IPN_KEY" } };

    const verifier = new DirectBillingIpnVerifier(
      signature,
      ipValidator as never,
      config as never,
    );

    const payload = makePayload();
    payload.signature = signature.generate(payload, "SERVICE_IPN_KEY");

    expect(verifier.verifySignature(payload)).toBe(true);
  });

  it("should validate source ip only", async () => {
    const signature = new DirectBillingIpnSignature();
    const ipValidator = { validate: vi.fn().mockResolvedValue(true) };
    const config = { ipn: { signatureKey: "SERVICE_IPN_KEY" } };

    const verifier = new DirectBillingIpnVerifier(
      signature,
      ipValidator as never,
      config as never,
    );

    await expect(verifier.validateSourceIp("127.0.0.1")).resolves.toBe(true);
  });
});
