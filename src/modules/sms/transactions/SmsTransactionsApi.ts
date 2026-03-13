import type { HttpClient } from "../../../client/createHttpClient.js";
import {
  SimPayApiError,
  SimPayValidationError,
} from "../../../errors/index.js";
import type { ApiResponse, SmsTransaction } from "../../../types/index.js";

export class SmsTransactionsApi {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Returns a list of sms transactions for a given service.
   *
   * @param serviceId - Service ID.
   * @returns Array of sms transactions.
   * @throws SimPayValidationError When serviceId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async list(serviceId: string): Promise<SmsTransaction[]> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }

    const response = await this.httpClient.request<
      ApiResponse<SmsTransaction[]>
    >({
      method: "GET",
      path: `/sms/${serviceId}/transactions`,
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
   * Returns details of a single sms transaction identified by transactionId.
   *
   * @param serviceId - Service ID.
   * @param transactionId - Transaction ID.
   * @returns Sms transaction details.
   * @throws SimPayValidationError When serviceId or transactionId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async get(
    serviceId: string,
    transactionId: number,
  ): Promise<SmsTransaction> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!transactionId) {
      throw new SimPayValidationError("transactionId is required");
    }

    const response = await this.httpClient.request<ApiResponse<SmsTransaction>>(
      {
        method: "GET",
        path: `/sms/${serviceId}/transactions/${transactionId}`,
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
