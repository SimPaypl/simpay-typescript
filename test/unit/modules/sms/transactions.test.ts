import { describe, expect, it, vi } from "vitest";
import { SimPayApiError } from "../../../../src/index.js";
import { SmsTransactionsApi } from "../../../../src/modules/sms/transactions/SmsTransactionsApi.js";

describe("SmsTransactionsApi", () => {
  it("should throw when serviceId is missing in list()", async () => {
    const api = new SmsTransactionsApi({ request: vi.fn() } as never);

    await expect(api.list("")).rejects.toThrow("serviceId is required");
  });

  it("should call correct endpoint in list()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: [] }),
    };
    const api = new SmsTransactionsApi(httpClient as never);

    await api.list("d151e4f9");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/sms/d151e4f9/transactions",
    });
  });

  it("should throw when transactionId is missing in get()", async () => {
    const api = new SmsTransactionsApi({ request: vi.fn() } as never);

    await expect(api.get("d151e4f9", 0)).rejects.toThrow(
      "transactionId is required",
    );
  });

  it("should call correct endpoint in get()", async () => {
    const tx = { id: 1 };
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: tx }),
    };
    const api = new SmsTransactionsApi(httpClient as never);

    const result = await api.get("d151e4f9", 1);

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/sms/d151e4f9/transactions/1",
    });
    expect(result).toEqual(tx);
  });

  it("should throw api error in get()", async () => {
    const api = new SmsTransactionsApi({
      request: vi.fn().mockResolvedValue({
        success: false,
        errorCode: "TRANSACTION_NOT_FOUND",
      }),
    } as never);

    await expect(api.get("d151e4f9", 1)).rejects.toBeInstanceOf(SimPayApiError);
  });
});
