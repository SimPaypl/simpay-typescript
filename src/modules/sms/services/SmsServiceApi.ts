import type { HttpClient } from "../../../client/createHttpClient.js";
import {
  SimPayApiError,
  SimPayValidationError,
} from "../../../errors/index.js";
import type { ApiResponse, SmsService } from "../../../types/index.js";

export class SmsServiceApi {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Returns a list of sms services available in the SimPay account.
   *
   * @returns Array of sms services.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async list(): Promise<SmsService[]> {
    const response = await this.httpClient.request<ApiResponse<SmsService[]>>({
      method: "GET",
      path: "/sms",
    });

    if (!response.success) {
      throw new SimPayApiError(
        "SimPay API returned unsuccessful response",
        200,
        response.errorCode,
        response,
      );
    }

    return response.data;
  }

  /**
   * Returns details of a single sms service identified by serviceId.
   *
   * @param serviceId - Service ID.
   * @returns Sms service details.
   * @throws SimPayValidationError When serviceId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async get(serviceId: string): Promise<SmsService> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }

    const response = await this.httpClient.request<ApiResponse<SmsService>>({
      method: "GET",
      path: `/sms/${serviceId}`,
    });

    if (!response.success) {
      throw new SimPayApiError(
        "SimPay API returned unsuccessful response",
        200,
        response.errorCode,
        response,
      );
    }

    return response.data;
  }
}
