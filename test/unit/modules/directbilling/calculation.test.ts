import { describe, expect, it, vi } from "vitest";
import { SimPayApiError } from "../../../../src/index.js";
import { DirectBillingCalculationApi } from "../../../../src/modules/directbilling/calculation/DirectBillingCalculationApi.js";

describe("DirectBillingCalculationApi", () => {
  it("should throw when serviceId is missing", async () => {
    const api = new DirectBillingCalculationApi({ request: vi.fn() } as never);

    await expect(api.calculate("", 1)).rejects.toThrow("serviceId is required");
  });

  it("should throw when amount is invalid", async () => {
    const api = new DirectBillingCalculationApi({ request: vi.fn() } as never);

    await expect(api.calculate("d151e4f9", 0)).rejects.toThrow(
      "amount must be greater than 0",
    );
  });

  it("should call correct endpoint in calculate()", async () => {
    const data = {
      orange: { net: 285.72, gross: 351.44 },
      play: { net: 285.72, gross: 351.44 },
      "t-mobile": null,
      plus: null,
    };

    const httpClient = {
      request: vi.fn().mockResolvedValue({ success: true, data }),
    };

    const api = new DirectBillingCalculationApi(httpClient as never);
    const result = await api.calculate("d151e4f9", 0.1);

    expect(httpClient.request).toHaveBeenCalledWith({
      method: "GET",
      path: "/directbilling/d151e4f9/calculate?amount=0.1",
    });
    expect(result).toEqual(data);
  });

  it("should throw api error when response.success=false", async () => {
    const api = new DirectBillingCalculationApi({
      request: vi
        .fn()
        .mockResolvedValue({ success: false, errorCode: "UNAUTHORIZED" }),
    } as never);

    await expect(api.calculate("d151e4f9", 1)).rejects.toBeInstanceOf(
      SimPayApiError,
    );
  });
});
