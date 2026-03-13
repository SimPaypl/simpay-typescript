import { describe, expect, it, vi } from "vitest";
import { SimPayIpnError } from "../../../../../src/index.js";
import { PaymentIpnIpValidator } from "../../../../../src/modules/notifications/payment/PaymentIpnIpValidator.js";

type PaymentIpnIpValidatorTestAccess = {
  getAllowedIps(): Promise<string[]>;
};
describe("PaymentIpnIpValidator", () => {
  it("should return false for empty ip", async () => {
    const httpClient = { request: vi.fn() };
    const validator = new PaymentIpnIpValidator(httpClient as never);

    await expect(validator.validate("")).resolves.toBe(false);
    await expect(validator.validate("   ")).resolves.toBe(false);
  });

  it("should allow localhost addresses", async () => {
    const httpClient = { request: vi.fn() };
    const validator = new PaymentIpnIpValidator(httpClient as never);

    await expect(validator.validate("127.0.0.1")).resolves.toBe(true);
    await expect(validator.validate("::1")).resolves.toBe(true);
    await expect(validator.validate("::ffff:127.0.0.1")).resolves.toBe(true);

    expect(httpClient.request).not.toHaveBeenCalled();
  });

  it("should validate ip from SimPay allowlist", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: ["135.125.153.121", "135.125.153.122"],
      }),
    };
    const validator = new PaymentIpnIpValidator(httpClient as never);

    await expect(validator.validate("135.125.153.121")).resolves.toBe(true);
    await expect(validator.validate("8.8.8.8")).resolves.toBe(false);
  });

  it("should cache allowlist response", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: ["135.125.153.121"],
      }),
    };
    const validator = new PaymentIpnIpValidator(httpClient as never);

    await validator.validate("135.125.153.121");
    await validator.validate("135.125.153.121");

    expect(httpClient.request).toHaveBeenCalledTimes(1);
  });

  it("should fail-open when /ip request fails", async () => {
    const httpClient = {
      request: vi.fn().mockRejectedValue(new Error("network fail")),
    };
    const validator = new PaymentIpnIpValidator(httpClient as never);

    await expect(validator.validate("9.9.9.9")).resolves.toBe(true);
  });

  it("should throw SimPayIpnError for invalid /ip payload in extract flow", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        data: [],
      }),
    };
    const validator = new PaymentIpnIpValidator(httpClient as never);
    const validatorWithAccess =
      validator as unknown as PaymentIpnIpValidatorTestAccess;

    const promise = validatorWithAccess.getAllowedIps();

    await expect(promise).rejects.toBeInstanceOf(SimPayIpnError);
    await expect(promise).rejects.toMatchObject({
      code: "INVALID_IP_ALLOWLIST_RESPONSE",
    });
  });

  it("should fail-open when /ip response is invalid", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        data: [],
      }),
    };
    const validator = new PaymentIpnIpValidator(httpClient as never);

    await expect(validator.validate("9.9.9.9")).resolves.toBe(true);
  });
});
