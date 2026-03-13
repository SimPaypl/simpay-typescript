import { describe, expect, it, vi } from "vitest";
import { SimPayApiError } from "../../../../src/index.js";
import { SmsVerificationApi } from "../../../../src/modules/sms/verification/SmsVerificationApi.js";

describe("SmsVerificationApi", () => {
  it("should throw when serviceId is missing", async () => {
    const api = new SmsVerificationApi({ request: vi.fn() } as never);

    await expect(api.verify("", { code: "ABC1D6" } as never)).rejects.toThrow(
      "serviceId is required",
    );
  });

  it("should throw when code is missing", async () => {
    const api = new SmsVerificationApi({ request: vi.fn() } as never);

    await expect(api.verify("d151e4f9", {} as never)).rejects.toThrow(
      "code is required",
    );
  });

  it("should call correct endpoint in verify()", async () => {
    const payload = { code: "ABC1D6", number: 7055 };
    const responseData = { used: true, code: "ABC1D6" };
    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data: responseData }),
    };
    const api = new SmsVerificationApi(httpClient as never);

    const result = await api.verify("d151e4f9", payload as never);

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "POST",
      path: "/sms/d151e4f9",
      body: payload,
    });
    expect(result).toEqual(responseData);
  });

  it("should throw api error in verify()", async () => {
    const api = new SmsVerificationApi({
      request: vi
        .fn()
        .mockResolvedValue({ success: false, errorCode: "CODE_NOT_FOUND" }),
    } as never);

    await expect(
      api.verify("d151e4f9", { code: "ABC1D6" } as never),
    ).rejects.toBeInstanceOf(SimPayApiError);
  });
});
