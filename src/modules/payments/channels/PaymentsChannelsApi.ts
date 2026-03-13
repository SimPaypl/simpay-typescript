import type { HttpClient } from "../../../client/createHttpClient.js";
import {
  SimPayApiError,
  SimPayValidationError,
} from "../../../errors/index.js";
import type { ApiResponse, PaymentChannel } from "../../../types/index.js";

export class PaymentsChannelsApi {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Returns a list of channels available in a service.
   *
   * @param serviceId - Service ID.
   * @returns Array of payment channels.
   * @throws SimPayValidationError When serviceId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async list(serviceId: string): Promise<PaymentChannel[]> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }

    const response = await this.httpClient.request<
      ApiResponse<PaymentChannel[]>
    >({
      method: "GET",
      path: `/payment/${serviceId}/channels`,
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
