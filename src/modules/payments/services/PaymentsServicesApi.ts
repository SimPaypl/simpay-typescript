import type { HttpClient } from "../../../client/createHttpClient.js";
import {
  SimPayApiError,
  SimPayValidationError,
} from "../../../errors/index.js";
import type { ApiResponse, PaymentService } from "../../../types/index.js";

export class PaymentsServicesApi {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Returns a list of payment services available in the SimPay account.
   *
   * @returns Array of payment services.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async list(): Promise<PaymentService[]> {
    const response = await this.httpClient.request<
      ApiResponse<PaymentService[]>
    >({
      method: "GET",
      path: "/payment",
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
   * Returns details of a single payment service identified by serviceId.
   *
   * @param serviceId - Service ID.
   * @returns Payment service details.
   * @throws SimPayValidationError When serviceId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async get(serviceId: string): Promise<PaymentService> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }

    const response = await this.httpClient.request<ApiResponse<PaymentService>>(
      {
        method: "GET",
        path: `/payment/${serviceId}`,
      },
    );

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
