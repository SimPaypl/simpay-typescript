import { describe, expect, it, vi } from "vitest";
import { SimPayApiError } from "../../../../src/errors/index.js";
import { BlikLevel0Api } from "../../../../src/modules/payments/blik/BlikLevel0Api.js";

describe("BlikLevel0Api", () => {
  it("should throw when serviceId is missing in submitCode()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new BlikLevel0Api(httpClient as never);

    await expect(api.submitCode("", "tx_1", "123123")).rejects.toThrow(
      "serviceId is required",
    );
  });

  it("should throw when transactionId is missing in submitCode()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new BlikLevel0Api(httpClient as never);

    await expect(api.submitCode("svc_123", "", "123123")).rejects.toThrow(
      "transactionId is required",
    );
  });

  it("should throw when code is missing in submitCode()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new BlikLevel0Api(httpClient as never);

    await expect(api.submitCode("svc_123", "tx_1", "")).rejects.toThrow(
      "code is required",
    );
  });

  it("should throw when code format is invalid in submitCode()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new BlikLevel0Api(httpClient as never);

    await expect(api.submitCode("svc_123", "tx_1", "12A123")).rejects.toThrow(
      "code must be a 6-digit string",
    );
  });

  it("should call correct endpoint and payload in submitCode()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue(undefined),
    };
    const api = new BlikLevel0Api(httpClient as never);

    await api.submitCode("svc_123", "tx_1", "123123");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "POST",
      path: "/payment/svc_123/blik/level0/tx_1",
      body: {
        ticket: {
          T6: "123123",
        },
      },
    });
  });

  it("should propagate SimPayApiError in submitCode()", async () => {
    const httpClient = {
      request: vi.fn().mockRejectedValue(
        new SimPayApiError("Invalid BLIK code.", 400, "INVALID_BLIK_CODE", {
          success: false,
          errorCode: "INVALID_BLIK_CODE",
        }),
      ),
    };
    const api = new BlikLevel0Api(httpClient as never);

    try {
      await api.submitCode("svc_123", "tx_1", "123123");
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("INVALID_BLIK_CODE");
    }
  });

  it("should return accepted=true when submitCode succeeds", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue(undefined),
    };
    const api = new BlikLevel0Api(httpClient as never);

    const result = await api.submitCode("svc_123", "tx_1", "123123");

    expect(result).toEqual({ accepted: true });
  });
});
