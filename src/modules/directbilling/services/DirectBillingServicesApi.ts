import type { HttpClient } from "../../../client/createHttpClient.js";
import {
  SimPayApiError,
  SimPayValidationError,
} from "../../../errors/index.js";
import type {
  ApiResponse,
  DirectBillingServiceItem,
} from "../../../types/index.js";

export class DirectBillingServicesApi {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Returns a list of direct billing services available in the SimPay account.
   *
   * @returns Array of direct billing services.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async list(): Promise<DirectBillingServiceItem[]> {
    const response = await this.httpClient.request<
      ApiResponse<DirectBillingServiceItem[]>
    >({
      method: "GET",
      path: "/directbilling",
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
   * Returns details of a single direct billing service identified by serviceId.
   *
   * @param serviceId - Service ID.
   * @returns Direct billing service details.
   * @throws SimPayValidationError When serviceId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async get(serviceId: string): Promise<DirectBillingServiceItem> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }

    const response = await this.httpClient.request<
      ApiResponse<DirectBillingServiceItem>
    >({
      method: "GET",
      path: `/directbilling/${serviceId}`,
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
