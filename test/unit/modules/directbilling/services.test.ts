import { describe, expect, it, vi } from "vitest";
import { SimPayApiError } from "../../../../src/index.js";
import { DirectBillingServicesApi } from "../../../../src/modules/directbilling/services/DirectBillingServicesApi.js";

describe("DirectBillingServicesApi", () => {
  it("should call correct endpoint in list()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: [] }),
    };
    const api = new DirectBillingServicesApi(httpClient as never);

    await api.list();

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/directbilling",
    });
  });

  it("should throw when serviceId is missing in get()", async () => {
    const api = new DirectBillingServicesApi({ request: vi.fn() } as never);

    await expect(api.get("")).rejects.toThrow("serviceId is required");
  });

  it("should call correct endpoint in get()", async () => {
    const service = { id: "d151e4f9" };
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: service }),
    };
    const api = new DirectBillingServicesApi(httpClient as never);

    const result = await api.get("d151e4f9");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/directbilling/d151e4f9",
    });
    expect(result).toEqual(service);
  });

  it("should throw api error in list()", async () => {
    const api = new DirectBillingServicesApi({
      request: vi
        .fn()
        .mockResolvedValue({ success: false, errorCode: "UNAUTHORIZED" }),
    } as never);

    await expect(api.list()).rejects.toBeInstanceOf(SimPayApiError);
  });

  it("should throw api error in get()", async () => {
    const api = new DirectBillingServicesApi({
      request: vi
        .fn()
        .mockResolvedValue({ success: false, errorCode: "SERVICE_NOT_FOUND" }),
    } as never);

    await expect(api.get("d151e4f9")).rejects.toBeInstanceOf(SimPayApiError);
  });
});
