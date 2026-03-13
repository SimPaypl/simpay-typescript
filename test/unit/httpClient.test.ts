import { afterEach, describe, expect, it, vi } from "vitest";
import { createHttpClient } from "../../src/client/createHttpClient.js";
import { SimPayApiError, SimPayNetworkError } from "../../src/index.js";

describe("HttpClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("should send request with correct headers and url", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ success: true }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = createHttpClient({
      apiPassword: "test_password",
      timeout: 10000,
    });

    await httpClient.request({
      method: "GET",
      path: "/payment",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe("https://api.simpay.pl/payment");
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe("Bearer test_password");
    expect(options.headers.Accept).toBe("application/json");
  });

  it("should throw SimPayApiError on 401 json response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        code: "UNAUTHORIZED",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = createHttpClient({
      apiPassword: "test_password",
      timeout: 10000,
    });

    await expect(
      httpClient.request({
        method: "GET",
        path: "/payment",
      }),
    ).rejects.toBeInstanceOf(SimPayApiError);
  });

  it("should include error code in SimPayApiError", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        code: "UNAUTHORIZED",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = createHttpClient({
      apiPassword: "test_password",
      timeout: 10000,
    });

    try {
      await httpClient.request({
        method: "GET",
        path: "/payment",
      });

      throw new Error("Expected request to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(SimPayApiError);

      const apiError = error as SimPayApiError;
      expect(apiError.statusCode).toBe(401);
      expect(apiError.errorCode).toBe("UNAUTHORIZED");
    }
  });

  it("should throw SimPayNetworkError on timeout", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error("Request aborted"), { name: "AbortError" }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = createHttpClient({
      apiPassword: "test_password",
      timeout: 1,
    });

    await expect(
      httpClient.request({
        method: "GET",
        path: "/payment",
      }),
    ).rejects.toBeInstanceOf(SimPayNetworkError);
  });

  it("should parse application/json response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json; charset=utf-8",
      },
      json: async () => ({
        success: true,
        data: [{ id: "abc" }],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = createHttpClient({
      apiPassword: "test_password",
      timeout: 10000,
    });

    const result = await httpClient.request<{
      success: boolean;
      data: Array<{ id: string }>;
    }>({
      method: "GET",
      path: "/payment",
    });

    expect(result.success).toBe(true);
    expect(result.data[0].id).toBe("abc");
  });

  it("should parse non-json response as text", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "text/plain",
      },
      text: async () => "OK",
    });

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = createHttpClient({
      apiPassword: "test_password",
      timeout: 10000,
    });

    const result = await httpClient.request<string>({
      method: "GET",
      path: "/payment",
    });

    expect(result).toBe("OK");
  });

  it("should set Content-Type application/json when body is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ success: true }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = createHttpClient({
      apiPassword: "test_password",
      timeout: 10000,
    });

    await httpClient.request({
      method: "POST",
      path: "/payment/service-id/transactions",
      body: {
        amount: 10,
        currency: "PLN",
      },
    });

    const [, options] = fetchMock.mock.calls[0];

    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(
      JSON.stringify({
        amount: 10,
        currency: "PLN",
      }),
    );
  });

  it("should not set Content-Type when body is not provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ success: true }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = createHttpClient({
      apiPassword: "test_password",
      timeout: 10000,
    });

    await httpClient.request({
      method: "GET",
      path: "/payment",
    });

    const [, options] = fetchMock.mock.calls[0];

    expect(options.headers["Content-Type"]).toBeUndefined();
  });
});
