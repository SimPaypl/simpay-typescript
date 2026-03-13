import { describe, expect, it, vi } from "vitest";
import { SimPayApiError } from "../../../../src/index.js";
import { SmsNumbersApi } from "../../../../src/modules/sms/numbers/SmsNumbersApi.js";

describe("SmsNumbersApi", () => {
  it("should call correct endpoint in list()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: [] }),
    };
    const api = new SmsNumbersApi(httpClient as never);

    await api.list();

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/sms/numbers",
    });
  });

  it("should throw when number is missing in get()", async () => {
    const api = new SmsNumbersApi({ request: vi.fn() } as never);

    await expect(api.get(undefined as never)).rejects.toThrow(
      "number is required",
    );
  });

  it("should call correct endpoint in get()", async () => {
    const number = { number: 7055, value: 2, value_net: 2.46, adult: false };
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: number }),
    };
    const api = new SmsNumbersApi(httpClient as never);

    const result = await api.get(7055 as never);

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/sms/numbers/7055",
    });
    expect(result).toEqual(number);
  });

  it("should throw when serviceId is missing in listByService()", async () => {
    const api = new SmsNumbersApi({ request: vi.fn() } as never);

    await expect(api.listByService("")).rejects.toThrow(
      "serviceId is required",
    );
  });

  it("should call correct endpoint in listByService()", async () => {
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: [] }),
    };
    const api = new SmsNumbersApi(httpClient as never);

    await api.listByService("d151e4f9");

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/sms/d151e4f9/numbers",
    });
  });

  it("should call correct endpoint in getByService()", async () => {
    const number = { number: 7055, value: 2, value_net: 2.46, adult: false };
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: number }),
    };
    const api = new SmsNumbersApi(httpClient as never);

    const result = await api.getByService("d151e4f9", 7055 as never);

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/sms/d151e4f9/numbers/7055",
    });
    expect(result).toEqual(number);
  });

  it("should throw api error in list()", async () => {
    const api = new SmsNumbersApi({
      request: vi
        .fn()
        .mockResolvedValue({ success: false, errorCode: "UNAUTHORIZED" }),
    } as never);

    await expect(api.list()).rejects.toBeInstanceOf(SimPayApiError);
  });
});
