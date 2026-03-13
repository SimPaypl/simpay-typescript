import { describe, expect, it } from "vitest";
import { DirectBillingIpnSignature } from "../../../../../src/modules/notifications/directbilling/DirectBillingIpnSignature.js";
import type { DirectBillingTransactionNotification } from "../../../../../src/types/index.js";

describe("DirectBillingIpnSignature", () => {
  it("should generate deterministic signature", () => {
    const signature = new DirectBillingIpnSignature();
    const payload: DirectBillingTransactionNotification = {
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
      number_from: "48123123123",
      provider: 1,
      signature: "",
    };

    const a = signature.generate(payload, "SERVICE_IPN_KEY");
    const b = signature.generate(payload, "SERVICE_IPN_KEY");

    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should validate correct signature", () => {
    const signature = new DirectBillingIpnSignature();
    const payload: DirectBillingTransactionNotification = {
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
    };

    payload.signature = signature.generate(payload, "SERVICE_IPN_KEY");

    expect(signature.isValid(payload, "SERVICE_IPN_KEY")).toBe(true);
  });

  it("should return false for invalid signature hex", () => {
    const signature = new DirectBillingIpnSignature();
    const payload: DirectBillingTransactionNotification = {
      id: "dc261d4f-31ef-4728-bfd6-97bbe2a5ef0a",
      serviceId: "e14f8074",
      status: "transaction_db_payed",
      values: {
        net: 11.07,
        gross: 13.61,
        partner: 5,
      },
      number_from: "48123123123",
      provider: 1,
      signature: "not-a-hex",
    };

    expect(signature.isValid(payload, "SERVICE_IPN_KEY")).toBe(false);
  });
});
