import type { HttpClient } from "../../../client/createHttpClient.js";
import {
  SimPayApiError,
  SimPayValidationError,
} from "../../../errors/index.js";
import type { DirectBillingCalculationResponse } from "../../../types/directbilling/index.js";
import type { ApiResponse } from "../../../types/index.js";

export class DirectBillingCalculationApi {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Returns direct billing commission calculation for a given service and amount.
   *
   * @param serviceId - Service ID.
   * @param amount - Target net amount.
   * @returns Calculation breakdown per operator.
   * @throws SimPayValidationError When serviceId is missing or amount is invalid.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async calculate(
    serviceId: string,
    amount: number,
  ): Promise<DirectBillingCalculationResponse> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new SimPayValidationError("amount must be greater than 0");
    }

    const response = await this.httpClient.request<
      ApiResponse<DirectBillingCalculationResponse>
    >({
      method: "GET",
      path: `/directbilling/${serviceId}/calculate?amount=${encodeURIComponent(
        String(amount),
      )}`,
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
