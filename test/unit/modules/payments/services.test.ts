import { describe, expect, it, vi } from "vitest";
import { SimPayApiError } from "../../../../src/errors/index.js";
import { PaymentsServicesApi } from "../../../../src/modules/payments/services/PaymentsServicesApi.js";

describe("PaymentsServicesApi", () => {
  it("should call correct endpoint in list()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: [],
      }),
    };

    const api = new PaymentsServicesApi(httpClient as never);

    await api.list();

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/payment",
    });
  });

  it("should return data in list()", async () => {
    const services = [
      {
        id: "d151e4f9",
        name: "Usługa testowa",
        status: "service_active",
        created_at: "2021-11-08T18:19:16+01:00",
      },
    ];

    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: services,
      }),
    };

    const api = new PaymentsServicesApi(httpClient as never);

    const result = await api.list();

    expect(result).toEqual(services);
  });

  it("should throw api error in list()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        errorCode: "UNAUTHORIZED",
      }),
    };

    const api = new PaymentsServicesApi(httpClient as never);

    try {
      await api.list();
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("UNAUTHORIZED");
    }
  });

  it("should throw when serviceId is missing in get()", async () => {
    const httpClient = {
      request: vi.fn(),
    };

    const api = new PaymentsServicesApi(httpClient as never);

    await expect(api.get("")).rejects.toThrow("serviceId is required");
  });

  it("should call correct endpoint in get()", async () => {
    const service = {
      id: "d151e4f9",
      name: "Usługa testowa",
      status: "service_active",
      created_at: "2021-11-08T18:19:16+01:00",
    };

    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: true,
        data: service,
      }),
    };

    const api = new PaymentsServicesApi(httpClient as never);

    const result = await api.get("d151e4f9");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/payment/d151e4f9",
    });

    expect(result).toEqual(service);
  });

  it("should throw api error in get()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({
        success: false,
        errorCode: "SERVICE_NOT_FOUND",
      }),
    };

    const api = new PaymentsServicesApi(httpClient as never);

    try {
      await api.get("d151e4f9");
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);
      expect((error as SimPayApiError).errorCode).toBe("SERVICE_NOT_FOUND");
    }
  });
});
