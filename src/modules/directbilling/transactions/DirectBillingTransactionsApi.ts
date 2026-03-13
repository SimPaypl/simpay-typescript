import type { HttpClient } from "../../../client/createHttpClient.js";
import {
  SimPayApiError,
  SimPayValidationError,
} from "../../../errors/index.js";
import type {
  DirectBillingCreateTransactionRequest,
  DirectBillingCreateTransactionResponse,
  DirectBillingListTransactionsQuery,
  DirectBillingTransactionDetails,
  DirectBillingTransactionItem,
} from "../../../types/directbilling/index.js";
import type { ApiResponse } from "../../../types/index.js";

export class DirectBillingTransactionsApi {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Returns a list of direct billing transactions for a service.
   *
   * @param serviceId - Service ID.
   * @param query - Optional transaction filters.
   * @returns Array of direct billing transactions.
   * @throws SimPayValidationError When serviceId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async list(
    serviceId: string,
    query?: DirectBillingListTransactionsQuery,
  ): Promise<DirectBillingTransactionItem[]> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }

    const params = new URLSearchParams();
    if (query?.filter?.status) {
      params.set("filter[status]", query.filter.status);
    }
    if (query?.filter?.phoneNumber) {
      params.set("filter[phoneNumber]", query.filter.phoneNumber);
    }
    if (query?.filter?.control) {
      params.set("filter[control]", query.filter.control);
    }

    const qs = params.toString();
    const path = `/directbilling/${serviceId}/transactions${qs ? `?${qs}` : ""}`;

    const response = await this.httpClient.request<
      ApiResponse<DirectBillingTransactionItem[]>
    >({
      method: "GET",
      path,
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
   * Returns details of a single direct billing transaction.
   *
   * @param serviceId - Service ID.
   * @param transactionId - Transaction ID.
   * @returns Direct billing transaction details.
   * @throws SimPayValidationError When serviceId or transactionId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async get(
    serviceId: string,
    transactionId: string,
  ): Promise<DirectBillingTransactionDetails> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!transactionId) {
      throw new SimPayValidationError("transactionId is required");
    }

    const response = await this.httpClient.request<
      ApiResponse<DirectBillingTransactionDetails>
    >({
      method: "GET",
      path: `/directbilling/${serviceId}/transactions/${transactionId}`,
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
   * Creates a new direct billing transaction for a service.
   *
   * @param serviceId - Service ID.
   * @param payload - Transaction creation payload.
   * @returns Created transaction identifiers and redirect URL.
   * @throws SimPayValidationError When required params are missing or amount is invalid.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async create(
    serviceId: string,
    payload: DirectBillingCreateTransactionRequest,
  ): Promise<DirectBillingCreateTransactionResponse> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!payload || !Number.isFinite(payload.amount) || payload.amount <= 0) {
      throw new SimPayValidationError("amount must be greater than 0");
    }

    const response = await this.httpClient.request<
      ApiResponse<DirectBillingCreateTransactionResponse>
    >({
      method: "POST",
      path: `/directbilling/${serviceId}/transactions`,
      body: payload,
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
