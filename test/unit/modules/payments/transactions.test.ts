import { describe, expect, it, vi } from "vitest";
import { SimPayApiError } from "../../../../src/errors/index.js";
import { PaymentsTransactionsApi } from "../../../../src/modules/payments/transactions/PaymentsTransactionsApi.js";

describe("PaymentsTransactionsApi", () => {
  it("should throw when serviceId is missing in list()", async () => {
    const httpClient = {
      request: vi.fn(),
    };

    const api = new PaymentsTransactionsApi(httpClient as never);

    await expect(api.list("")).rejects.toThrow("serviceId is required");
  });

  it("should call correct endpoint in list() with default page", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: [],
      }),
    };

    const api = new PaymentsTransactionsApi(httpClient as never);

    await api.list("svc_123");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/payment/svc_123/transactions?page=1",
    });
  });

  it("should call correct endpoint in list() with custom page", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: [],
      }),
    };

    const api = new PaymentsTransactionsApi(httpClient as never);

    await api.list("svc_123", 3);

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/payment/svc_123/transactions?page=3",
    });
  });

  it("should return data in list()", async () => {
    const transactions = [{ id: "tx_1", status: "transaction_new" }];

    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: transactions,
      }),
    };

    const api = new PaymentsTransactionsApi(httpClient as never);

    const result = await api.list("svc_123");

    expect(result).toEqual(transactions);
  });

  it("should throw api error in list()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        errorCode: "SERVICE_NOT_FOUND",
      }),
    };

    const api = new PaymentsTransactionsApi(httpClient as never);

    try {
      await api.list("svc_123");
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("SERVICE_NOT_FOUND");
    }
  });

  it("should throw when serviceId is missing in get()", async () => {
    const httpClient = {
      request: vi.fn(),
    };

    const api = new PaymentsTransactionsApi(httpClient as never);

    await expect(api.get("", "tx_1")).rejects.toThrow("serviceId is required");
  });

  it("should throw when transactionId is missing in get()", async () => {
    const httpClient = {
      request: vi.fn(),
    };

    const api = new PaymentsTransactionsApi(httpClient as never);

    await expect(api.get("svc_123", "")).rejects.toThrow(
      "transactionId is required",
    );
  });

  it("should call correct endpoint in get()", async () => {
    const transaction = { id: "tx_1", status: "transaction_paid" };

    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: transaction,
      }),
    };

    const api = new PaymentsTransactionsApi(httpClient as never);

    const result = await api.get("svc_123", "tx_1");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/payment/svc_123/transactions/tx_1",
    });

    expect(result).toEqual(transaction);
  });

  it("should throw api error in get()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        errorCode: "TRANSACTION_NOT_FOUND",
      }),
    };

    const api = new PaymentsTransactionsApi(httpClient as never);

    try {
      await api.get("svc_123", "tx_1");
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("TRANSACTION_NOT_FOUND");
    }
  });

  it("should throw when serviceId is missing in create()", async () => {
    const httpClient = {
      request: vi.fn(),
    };

    const api = new PaymentsTransactionsApi(httpClient as never);

    await expect(api.create("", { amount: 1.23 } as never)).rejects.toThrow(
      "serviceId is required",
    );
  });

  it("should call correct endpoint and send payload in create()", async () => {
    const payload = {
      amount: 1.23,
      currency: "PLN",
      description: "Test",
      control: "ORDER_1",
      customer: {
        email: "john@example.com",
      },
    };

    const createResponse = {
      transactionId: "tx_123",
      redirectUrl: "https://example.com/redirect",
    };

    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: createResponse,
      }),
    };

    const api = new PaymentsTransactionsApi(httpClient as never);

    const result = await api.create("svc_123", payload as never);

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "POST",
      path: "/payment/svc_123/transactions",
      body: payload,
    });

    expect(result).toEqual(createResponse);
  });

  it("should throw api error in create()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        errorCode: "UNAUTHORIZED",
      }),
    };

    const api = new PaymentsTransactionsApi(httpClient as never);

    try {
      await api.create("svc_123", { amount: 1.23 } as never);
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("UNAUTHORIZED");
    }
  });
});
