import { SimPayApiError, SimPayNetworkError } from "../errors/index.js";
import { API_BASE_URL } from "./config.js";

export interface HttpClientRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface HttpClient {
  request<TResponse>(options: HttpClientRequestOptions): Promise<TResponse>;
}

export interface CreateHttpClientOptions {
  apiPassword: string;
  timeout: number;
}

export function createHttpClient(options: CreateHttpClientOptions): HttpClient {
  const { apiPassword, timeout: defaultTimeout } = options;

  return {
    async request<TResponse>({
      method = "GET",
      path,
      body,
      headers = {},
      timeout,
    }: HttpClientRequestOptions): Promise<TResponse> {
      const controller = new AbortController();
      const requestTimeout = timeout ?? defaultTimeout;

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, requestTimeout);

      try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
          method,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${apiPassword}`,
            ...(body ? { "Content-Type": "application/json" } : {}),
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        const contentType = response.headers.get("content-type");
        const isJsonResponse =
          contentType?.includes("application/json") ?? false;

        const responseData = isJsonResponse
          ? await response.json()
          : await response.text();

        if (!response.ok) {
          const errorMessage =
            isJsonResponse &&
            isApiErrorPayload(responseData) &&
            responseData.message
              ? responseData.message
              : `SimPay API request failed with status ${response.status}`;

          const errorCode =
            isJsonResponse && isApiErrorPayload(responseData)
              ? responseData.code
              : undefined;

          throw new SimPayApiError(
            errorMessage,
            response.status,
            errorCode,
            responseData,
          );
        }

        return responseData as TResponse;
      } catch (error: unknown) {
        if (error instanceof SimPayApiError) {
          throw error;
        }

        if (error instanceof Error && error.name === "AbortError") {
          throw new SimPayNetworkError(
            `SimPay API request timed out after ${requestTimeout} ms`,
            error,
          );
        }

        throw new SimPayNetworkError(
          "SimPay API network request failed",
          error,
        );
      } finally {
        clearTimeout(timeoutId);
      }
    },
  };
}

interface ApiErrorPayload {
  message?: string;
  code?: string;
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return typeof value === "object" && value !== null;
}
