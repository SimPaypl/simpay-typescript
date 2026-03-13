import { describe, expect, it, vi } from "vitest";
import { SimPayApiError } from "../../../../src/errors/index.js";
import { PaymentsRefundsApi } from "../../../../src/modules/payments/refunds/PaymentsRefundsApi.js";

describe("PaymentsRefundsApi", () => {
  it("should throw when serviceId is missing in list()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new PaymentsRefundsApi(httpClient as never);

    await expect(api.list("", "tx_1")).rejects.toThrow("serviceId is required");
  });

  it("should throw when transactionId is missing in list()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new PaymentsRefundsApi(httpClient as never);

    await expect(api.list("svc_123", "")).rejects.toThrow(
      "transactionId is required",
    );
  });

  it("should call correct endpoint in list()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: [] }),
    };
    const api = new PaymentsRefundsApi(httpClient as never);

    await api.list("svc_123", "tx_1");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/payment/svc_123/transactions/tx_1/refunds",
    });
  });

  it("should return data in list()", async () => {
    const refunds = [{ id: "ref_1", status: "refund_completed" }];
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: refunds }),
    };
    const api = new PaymentsRefundsApi(httpClient as never);

    const result = await api.list("svc_123", "tx_1");

    expect(result).toEqual(refunds);
  });

  it("should throw api error in list()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        errorCode: "TRANSACTION_NOT_FOUND",
      }),
    };
    const api = new PaymentsRefundsApi(httpClient as never);

    try {
      await api.list("svc_123", "tx_1");
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("TRANSACTION_NOT_FOUND");
    }
  });

  it("should throw when serviceId is missing in get()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new PaymentsRefundsApi(httpClient as never);

    await expect(api.get("", "tx_1", "ref_1")).rejects.toThrow(
      "serviceId is required",
    );
  });

  it("should throw when transactionId is missing in get()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new PaymentsRefundsApi(httpClient as never);

    await expect(api.get("svc_123", "", "ref_1")).rejects.toThrow(
      "transactionId is required",
    );
  });

  it("should throw when refundId is missing in get()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new PaymentsRefundsApi(httpClient as never);

    await expect(api.get("svc_123", "tx_1", "")).rejects.toThrow(
      "refundId is required",
    );
  });

  it("should call correct endpoint in get()", async () => {
    const refund = { id: "ref_1", status: "refund_completed" };
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: refund }),
    };
    const api = new PaymentsRefundsApi(httpClient as never);

    const result = await api.get("svc_123", "tx_1", "ref_1");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/payment/svc_123/transactions/tx_1/refunds/ref_1",
    });
    expect(result).toEqual(refund);
  });

  it("should throw api error in get()", async () => {
    const httpClient = {
      request: vi
        .fn()
        .mockResolvedValue({ success: false, errorCode: "REFUND_NOT_FOUND" }),
    };
    const api = new PaymentsRefundsApi(httpClient as never);

    try {
      await api.get("svc_123", "tx_1", "ref_1");
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("REFUND_NOT_FOUND");
    }
  });

  it("should throw when serviceId is missing in create()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new PaymentsRefundsApi(httpClient as never);

    await expect(api.create("", "tx_1", {} as never)).rejects.toThrow(
      "serviceId is required",
    );
  });

  it("should throw when transactionId is missing in create()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new PaymentsRefundsApi(httpClient as never);

    await expect(api.create("svc_123", "", {} as never)).rejects.toThrow(
      "transactionId is required",
    );
  });

  it("should call correct endpoint and send payload in create()", async () => {
    const payload = { amount: 1.0 };
    const createResponse = { refund_id: "ref_1" };
    const httpClient = {
      request: vi
        .fn()
        .mockResolvedValue({ success: true, data: createResponse }),
    };
    const api = new PaymentsRefundsApi(httpClient as never);

    const result = await api.create("svc_123", "tx_1", payload as never);

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "POST",
      path: "/payment/svc_123/transactions/tx_1/refunds",
      body: payload,
    });
    expect(result).toEqual(createResponse);
  });

  it("should call correct endpoint without body in create() for full refund", async () => {
    const createResponse = { refund_id: "ref_full_1" };
    const httpClient = {
      request: vi
        .fn()
        .mockResolvedValue({ success: true, data: createResponse }),
    };
    const api = new PaymentsRefundsApi(httpClient as never);

    const result = await api.create("svc_123", "tx_1");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "POST",
      path: "/payment/svc_123/transactions/tx_1/refunds",
    });
    expect(result).toEqual(createResponse);
  });

  it("should call correct endpoint with amount in create() for partial refund", async () => {
    const payload = { amount: 1.0 };
    const createResponse = { refund_id: "ref_partial_1" };
    const httpClient = {
      request: vi
        .fn()
        .mockResolvedValue({ success: true, data: createResponse }),
    };
    const api = new PaymentsRefundsApi(httpClient as never);

    const result = await api.create("svc_123", "tx_1", payload as never);

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "POST",
      path: "/payment/svc_123/transactions/tx_1/refunds",
      body: payload,
    });
    expect(result).toEqual(createResponse);
  });

  it("should throw when amount is invalid in create()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new PaymentsRefundsApi(httpClient as never);

    await expect(
      api.create("svc_123", "tx_1", { amount: 0 } as never),
    ).rejects.toThrow("amount must be greater than 0");
  });

  it("should throw api error in create()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        errorCode: "TRANSACTION_NOT_PAID",
      }),
    };
    const api = new PaymentsRefundsApi(httpClient as never);

    try {
      await api.create("svc_123", "tx_1", {} as never);
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("TRANSACTION_NOT_PAID");
    }
  });
});
