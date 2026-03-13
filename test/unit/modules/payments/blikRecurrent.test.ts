import { describe, expect, it, vi } from "vitest";
import type { CreateSubscriptionRequest } from "../../../../src/index.js";
import { SimPayApiError } from "../../../../src/index.js";
import { BlikRecurrentApi } from "../../../../src/modules/payments/blik/BlikRecurrentApi.js";

describe("BlikRecurrentApi", () => {
  it("should throw when serviceId is missing in list()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new BlikRecurrentApi(httpClient as never);

    await expect(api.list("")).rejects.toThrow("serviceId is required");
  });

  it("should call correct endpoint in list() without query", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: [],
        pagination: {
          total: 0,
          count: 0,
          per_page: 20,
          current_page: 1,
          total_pages: 0,
          links: { next_page: null, prev_page: null },
        },
      }),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    await api.list("svc_123");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/payment/svc_123/subscriptions",
    });
  });

  it("should call correct endpoint in list() with query", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: [],
        pagination: {
          total: 0,
          count: 0,
          per_page: 20,
          current_page: 1,
          total_pages: 0,
          links: { next_page: null, prev_page: null },
        },
      }),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    await api.list("svc_123", {
      filter: {
        status: "subscription_active",
        mode: "BLIK",
        uuid: "019970c6-3d3e-708c-9313-5f89e251e2c0",
      },
      page: 2,
      perPage: 20,
      sort: "-created_at",
    });

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/payment/svc_123/subscriptions?filter%5Bstatus%5D=subscription_active&filter%5Bmode%5D=BLIK&filter%5Buuid%5D=019970c6-3d3e-708c-9313-5f89e251e2c0&page=2&perPage=20&sort=-created_at",
    });
  });

  it("should return data and pagination in list()", async () => {
    const responsePayload = {
      success: true,
      data: [{ id: "sub_1", status: "subscription_active", mode: "BLIK" }],
      pagination: {
        total: 1,
        count: 1,
        per_page: 20,
        current_page: 1,
        total_pages: 1,
        links: { next_page: null, prev_page: null },
      },
    };

    const httpClient = {
      request: vi.fn().mockResolvedValue(responsePayload),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    const result = await api.list("svc_123");

    expect(result).toEqual({
      data: responsePayload.data,
      pagination: responsePayload.pagination,
    });
  });

  it("should throw api error in list()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        errorCode: "UNAUTHORIZED",
      }),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    try {
      await api.list("svc_123");
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("UNAUTHORIZED");
    }
  });

  it("should throw when serviceId is missing in listAliases()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new BlikRecurrentApi(httpClient as never);

    await expect(api.listAliases("")).rejects.toThrow("serviceId is required");
  });

  it("should call correct endpoint in listAliases() without query", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: [],
        pagination: {
          total: 0,
          count: 0,
          per_page: 20,
          current_page: 1,
          total_pages: 0,
          links: { next_page: null, prev_page: null },
        },
      }),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    await api.listAliases("svc_123");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/payment/svc_123/blik/aliases",
    });
  });

  it("should call correct endpoint in listAliases() with query", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: [],
        pagination: {
          total: 0,
          count: 0,
          per_page: 20,
          current_page: 1,
          total_pages: 0,
          links: { next_page: null, prev_page: null },
        },
      }),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    await api.listAliases("svc_123", {
      filter: {
        status: "alias_active",
        type: "PAYID",
        uuid: "019970c6-3ce8-71e7-8214-20fd635532fb",
        value: "AABBCC",
      },
      page: 1,
      perPage: 20,
      sort: "-created_at",
    });

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/payment/svc_123/blik/aliases?filter%5Bstatus%5D=alias_active&filter%5Btype%5D=PAYID&filter%5Buuid%5D=019970c6-3ce8-71e7-8214-20fd635532fb&filter%5Bvalue%5D=AABBCC&page=1&perPage=20&sort=-created_at",
    });
  });

  it("should return data and pagination in listAliases()", async () => {
    const responsePayload = {
      success: true,
      data: [
        {
          id: "alias_1",
          type: "PAYID",
          value: "AABBCC",
          label: "Premium",
          blik_key: null,
          status: "alias_active",
          expires_at: null,
          created_at: "2025-09-22T11:34:23+02:00",
          updated_at: "2025-09-22T11:34:32+02:00",
          subscription: {
            id: "sub_1",
            status: "subscription_active",
            mode: "BLIK",
            blik: { model: "O" },
            frequency: null,
            initiation_date: null,
            total_amount_limit: null,
            total_transactions_limit: null,
            cancelled: null,
            created_at: "2025-09-22T11:34:24+02:00",
            updated_at: "2025-09-22T11:34:32+02:00",
          },
        },
      ],
      pagination: {
        total: 1,
        count: 1,
        per_page: 20,
        current_page: 1,
        total_pages: 1,
        links: { next_page: null, prev_page: null },
      },
    };

    const httpClient = {
      request: vi.fn().mockResolvedValue(responsePayload),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    const result = await api.listAliases("svc_123");

    expect(result).toEqual({
      data: responsePayload.data,
      pagination: responsePayload.pagination,
    });
  });

  it("should throw api error in listAliases()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        errorCode: "UNAUTHORIZED",
      }),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    try {
      await api.listAliases("svc_123");
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("UNAUTHORIZED");
    }
  });

  it("should throw when serviceId is missing in create()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new BlikRecurrentApi(httpClient as never);

    await expect(api.create("", {} as never)).rejects.toThrow(
      "serviceId is required",
    );
  });

  it("should validate required create() fields", async () => {
    const httpClient = { request: vi.fn() };
    const api = new BlikRecurrentApi(httpClient as never);

    await expect(api.create("svc_123", {} as never)).rejects.toThrow(
      "transactionId is required",
    );
    await expect(
      api.create("svc_123", { transactionId: "tx_1" } as never),
    ).rejects.toThrow("ticket.T6 is required");
    await expect(
      api.create("svc_123", {
        transactionId: "tx_1",
        ticket: { T6: "12A123" },
      } as never),
    ).rejects.toThrow("ticket.T6 must be a 6-digit string");
    await expect(
      api.create("svc_123", {
        transactionId: "tx_1",
        ticket: { T6: "123123" },
      } as never),
    ).rejects.toThrow("alias.value is required");
    await expect(
      api.create("svc_123", {
        transactionId: "tx_1",
        ticket: { T6: "123123" },
        alias: { value: "AAABBCC", type: "UID" },
      } as never),
    ).rejects.toThrow("alias.type must be PAYID");
  });

  it("should call correct endpoint and send payload in create()", async () => {
    const payload: CreateSubscriptionRequest = {
      transactionId: "tx_1",
      ticket: { T6: "123123" },
      alias: { value: "AAABBCC", type: "PAYID", label: "Premium" },
      options: {},
      descriptions: { line1: "L1", line2: "L2", line3: "L3" },
    };

    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: { subscriptionId: "sub_1", aliasId: "alias_1" },
      }),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    const result = await api.create("svc_123", payload);

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "POST",
      path: "/payment/svc_123/blik/subscriptions",
      body: payload,
    });
    expect(result).toEqual({ subscriptionId: "sub_1", aliasId: "alias_1" });
  });

  it("should throw api error in create()", async () => {
    const payload: CreateSubscriptionRequest = {
      transactionId: "tx_1",
      ticket: { T6: "123123" },
      alias: { value: "AAABBCC", type: "PAYID" },
      options: {},
    };

    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        errorCode: "ALIAS_ALREADY_EXISTS",
      }),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    try {
      await api.create("svc_123", payload);
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("ALIAS_ALREADY_EXISTS");
    }
  });

  it("should throw when required params are missing in autopayment()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new BlikRecurrentApi(httpClient as never);

    await expect(
      api.autopayment("", "sub_1", { transactionId: "tx_1" }),
    ).rejects.toThrow("serviceId is required");
    await expect(
      api.autopayment("svc_123", "", { transactionId: "tx_1" }),
    ).rejects.toThrow("subscriptionId is required");
    await expect(
      api.autopayment("svc_123", "sub_1", {} as never),
    ).rejects.toThrow("transactionId is required");
  });

  it("should call correct endpoint and send payload in autopayment()", async () => {
    const payload = {
      transactionId: "tx_1",
      attempt: 2,
      descriptions: { line1: "L1", line2: null, line3: null },
      alias: { label: "Nowa etykieta", noDelay: true },
    };

    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: { needsUserConfirmation: false },
      }),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    const result = await api.autopayment("svc_123", "sub_1", payload);

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "POST",
      path: "/payment/svc_123/blik/subscriptions/sub_1/autopayment",
      body: payload,
    });
    expect(result).toEqual({ needsUserConfirmation: false });
  });

  it("should throw api error in autopayment()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        errorCode: "VALIDATION_ERROR",
      }),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    try {
      await api.autopayment("svc_123", "sub_1", { transactionId: "tx_1" });
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("VALIDATION_ERROR");
    }
  });

  it("should throw when required params are missing in deleteAlias()", async () => {
    const httpClient = { request: vi.fn() };
    const api = new BlikRecurrentApi(httpClient as never);

    await expect(api.deleteAlias("", "alias_1")).rejects.toThrow(
      "serviceId is required",
    );
    await expect(api.deleteAlias("svc_123", "")).rejects.toThrow(
      "aliasId is required",
    );
  });

  it("should call correct endpoint and send payload in deleteAlias()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue(undefined),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    await api.deleteAlias("svc_123", "alias_1", {
      reason: "Rezygnacja użytkownika",
    });

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "DELETE",
      path: "/payment/svc_123/blik/aliases/alias_1",
      body: { reason: "Rezygnacja użytkownika" },
    });
  });

  it("should call correct endpoint in deleteAlias() without payload", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue(undefined),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    await api.deleteAlias("svc_123", "alias_1");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "DELETE",
      path: "/payment/svc_123/blik/aliases/alias_1",
      body: undefined,
    });
  });

  it("should propagate api error in deleteAlias()", async () => {
    const httpClient = {
      request: vi
        .fn()
        .mockRejectedValue(
          new SimPayApiError("Unauthorized", 401, "UNAUTHORIZED"),
        ),
    };
    const api = new BlikRecurrentApi(httpClient as never);

    await expect(api.deleteAlias("svc_123", "alias_1")).rejects.toBeInstanceOf(
      SimPayApiError,
    );
  });
});
