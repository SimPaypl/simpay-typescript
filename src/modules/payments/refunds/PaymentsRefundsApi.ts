import type { HttpClient } from "../../../client/createHttpClient.js";
import {
  SimPayApiError,
  SimPayValidationError,
} from "../../../errors/index.js";
import type { ApiResponse } from "../../../types/index.js";
import type {
  CreateRefundRequest,
  CreateRefundResponse,
  RefundDetails,
} from "../../../types/payments/refunds.js";

export class PaymentsRefundsApi {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Returns a list of refunds for a given transaction.
   *
   * @param serviceId - Service ID.
   * @param transactionId - Transaction ID.
   * @returns Array of refunds assigned to the transaction.
   * @throws SimPayValidationError When serviceId or transactionId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async list(
    serviceId: string,
    transactionId: string,
  ): Promise<RefundDetails[]> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!transactionId) {
      throw new SimPayValidationError("transactionId is required");
    }

    const response = await this.httpClient.request<
      ApiResponse<RefundDetails[]>
    >({
      method: "GET",
      path: `/payment/${serviceId}/transactions/${transactionId}/refunds`,
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
   * Returns details of a single refund in transaction.
   *
   * @param serviceId - Service ID.
   * @param transactionId - Transaction ID.
   * @param refundId - Refund ID.
   * @returns Refund details.
   * @throws SimPayValidationError When required params are missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async get(
    serviceId: string,
    transactionId: string,
    refundId: string,
  ): Promise<RefundDetails> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!transactionId) {
      throw new SimPayValidationError("transactionId is required");
    }
    if (!refundId) {
      throw new SimPayValidationError("refundId is required");
    }

    const response = await this.httpClient.request<ApiResponse<RefundDetails>>({
      method: "GET",
      path: `/payment/${serviceId}/transactions/${transactionId}/refunds/${refundId}`,
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
   * Creates a refund for a given transaction.
   *
   * Full refund: call without payload.
   * Partial refund: pass payload with `amount`.
   *
   * @param serviceId - Service ID.
   * @param transactionId - Transaction ID.
   * @param payload - Optional request body for partial refund: `{ amount: number }`.
   * @returns Created refund payload.
   * @throws SimPayValidationError When required params are missing or amount is invalid.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async create(
    serviceId: string,
    transactionId: string,
    payload?: CreateRefundRequest,
  ): Promise<CreateRefundResponse> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!transactionId) {
      throw new SimPayValidationError("transactionId is required");
    }
    if (typeof payload?.amount !== "undefined" && payload.amount <= 0) {
      throw new SimPayValidationError("amount must be greater than 0");
    }

    const response = await this.httpClient.request<
      ApiResponse<CreateRefundResponse>
    >({
      method: "POST",
      path: `/payment/${serviceId}/transactions/${transactionId}/refunds`,
      ...(payload ? { body: payload } : {}),
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
