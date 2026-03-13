import { describe, expect, it, vi } from "vitest";
import { SimPayApiError } from "../../../../src/errors/index.js";
import { PaymentsChannelsApi } from "../../../../src/modules/payments/channels/PaymentsChannelsApi.js";

describe("PaymentsChannelsApi", () => {
  it("should call correct endpoint in list()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: [],
      }),
    };

    const api = new PaymentsChannelsApi(httpClient as never);

    await api.list("svc_123");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/payment/svc_123/channels",
    });
  });

  it("should return data in list()", async () => {
    const channels = [
      {
        id: "blik",
        name: "BLIK",
        type: "blik",
        img: "https://img.simpay.pl/transfer/banks/blik.png",
        commission: 1.5,
        currencies: ["PLN"],
        amount: {
          min: 1,
          max: 20000,
        },
      },
      {
        id: "mbank",
        name: "mBank",
        type: "transfer",
        img: "https://img.simpay.pl/transfer/banks/mbank.png",
        commission: 1.5,
        currencies: ["PLN"],
        amount: {
          min: 1,
          max: 20000,
        },
      },
    ];

    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: channels,
      }),
    };

    const api = new PaymentsChannelsApi(httpClient as never);

    const result = await api.list("svc_123");

    expect(result).toEqual(channels);
  });

  it("should throw api error in list()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        errorCode: "SERVICE_NOT_FOUND",
      }),
    };

    const api = new PaymentsChannelsApi(httpClient as never);

    try {
      await api.list("svc_123");
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("SERVICE_NOT_FOUND");
    }
  });

  it("should throw when serviceId is missing in list()", async () => {
    const httpClient = {
      request: vi.fn(),
    };

    const api = new PaymentsChannelsApi(httpClient as never);

    await expect(api.list("")).rejects.toThrow("serviceId is required");
  });
});
