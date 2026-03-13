import { describe, expect, it, vi } from "vitest";
import { SimPayApiError } from "../../../../src/index.js";
import { DirectBillingTransactionsApi } from "../../../../src/modules/directbilling/transactions/DirectBillingTransactionsApi.js";

describe("DirectBillingTransactionsApi", () => {
  it("should throw when serviceId is missing in list()", async () => {
    const api = new DirectBillingTransactionsApi({ request: vi.fn() } as never);

    await expect(api.list("")).rejects.toThrow("serviceId is required");
  });

  it("should call correct endpoint in list() without query", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: [] }),
    };
    const api = new DirectBillingTransactionsApi(httpClient as never);

    await api.list("d151e4f9");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/directbilling/d151e4f9/transactions",
    });
  });

  it("should call correct endpoint in list() with query", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: [] }),
    };
    const api = new DirectBillingTransactionsApi(httpClient as never);

    await api.list("d151e4f9", {
      filter: {
        status: "transaction_db_new",
        phoneNumber: "48123123123",
        control: "abc",
      },
    });

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/directbilling/d151e4f9/transactions?filter%5Bstatus%5D=transaction_db_new&filter%5BphoneNumber%5D=48123123123&filter%5Bcontrol%5D=abc",
    });
  });

  it("should throw when serviceId is missing in get()", async () => {
    const api = new DirectBillingTransactionsApi({ request: vi.fn() } as never);

    await expect(api.get("", "tx-id")).rejects.toThrow("serviceId is required");
  });

  it("should throw when transactionId is missing in get()", async () => {
    const api = new DirectBillingTransactionsApi({ request: vi.fn() } as never);

    await expect(api.get("d151e4f9", "")).rejects.toThrow(
      "transactionId is required",
    );
  });

  it("should call correct endpoint in get()", async () => {
    const tx = { id: "tx-id" };
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: tx }),
    };
    const api = new DirectBillingTransactionsApi(httpClient as never);

    const result = await api.get("d151e4f9", "tx-id");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/directbilling/d151e4f9/transactions/tx-id",
    });
    expect(result).toEqual(tx);
  });

  it("should throw when serviceId is missing in create()", async () => {
    const api = new DirectBillingTransactionsApi({ request: vi.fn() } as never);

    await expect(api.create("", { amount: 10 })).rejects.toThrow(
      "serviceId is required",
    );
  });

  it("should throw when amount is invalid in create()", async () => {
    const api = new DirectBillingTransactionsApi({ request: vi.fn() } as never);

    await expect(api.create("d151e4f9", { amount: 0 })).rejects.toThrow(
      "amount must be greater than 0",
    );
  });

  it("should call correct endpoint and payload in create()", async () => {
    const payload = {
      amount: 19.99,
      amountType: "gross" as const,
      description: "Płatność za wirtualne produkty",
      control: "96125f23-d549-4bfc-a845-b781b5f1ad03",
      returns: {
        success: "https://www.simpay.pl/success",
        failure: "https://www.simpay.pl/failure",
      },
      phoneNumber: "48123123123",
    };

    const responseData = {
      transactionId: "1d87a1b3-18f8-4146-bcb1-c0c9f293b04f",
      redirectUrl: "https://db.simpay.pl/1d87a1b3-18f8-4146-bcb1-c0c9f293b04f",
    };

    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: responseData }),
    };
    const api = new DirectBillingTransactionsApi(httpClient as never);

    const result = await api.create("d151e4f9", payload);

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "POST",
      path: "/directbilling/d151e4f9/transactions",
      body: payload,
    });
    expect(result).toEqual(responseData);
  });

  it("should throw api error when response.success=false", async () => {
    const api = new DirectBillingTransactionsApi({
      request: vi
        .fn()
        .mockResolvedValue({ success: false, errorCode: "UNAUTHORIZED" }),
    } as never);

    await expect(api.list("d151e4f9")).rejects.toBeInstanceOf(SimPayApiError);
  });
});
