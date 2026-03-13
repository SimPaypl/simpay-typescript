import { describe, expect, it, vi } from "vitest";
import { SimPayApiError } from "../../../../src/index.js";
import { SmsServiceApi } from "../../../../src/modules/sms/services/SmsServiceApi.js";

describe("SmsServiceApi", () => {
  it("should call correct endpoint in list()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: [] }),
    };
    const api = new SmsServiceApi(httpClient as never);

    await api.list();

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/sms",
    });
  });

  it("should throw when serviceId is missing in get()", async () => {
    const api = new SmsServiceApi({ request: vi.fn() } as never);

    await expect(api.get("")).rejects.toThrow("serviceId is required");
  });

  it("should call correct endpoint in get()", async () => {
    const service = { id: "d151e4f9" };
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: service }),
    };
    const api = new SmsServiceApi(httpClient as never);

    const result = await api.get("d151e4f9");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/sms/d151e4f9",
    });
    expect(result).toEqual(service);
  });

  it("should throw api error in list()", async () => {
    const api = new SmsServiceApi({
      request: vi
        .fn()
        .mockResolvedValue({ success: false, errorCode: "UNAUTHORIZED" }),
    } as never);

    await expect(api.list()).rejects.toBeInstanceOf(SimPayApiError);
  });
});
