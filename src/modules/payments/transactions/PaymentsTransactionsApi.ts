import type { HttpClient } from "../../../client/createHttpClient.js";
import {
  SimPayApiError,
  SimPayValidationError,
} from "../../../errors/index.js";
import type {
  ApiResponse,
  CreateTransactionRequest,
  CreateTransactionResponse,
  TransactionDetails,
} from "../../../types/index.js";

export class PaymentsTransactionsApi {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Returns a list of transactions for a given service.
   *
   * @param serviceId - Service ID.
   * @param page - Optional page number (default: 1).
   * @returns Array of transactions.
   * @throws SimPayValidationError When serviceId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async list(
    serviceId: string,
    page?: number,
  ): Promise<TransactionDetails[]> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }

    const response = await this.httpClient.request<
      ApiResponse<TransactionDetails[]>
    >({
      method: "GET",
      path: `/payment/${serviceId}/transactions?page=${page ?? 1}`,
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
   * Returns details of a single transaction identified by transactionId.
   *
   * @param serviceId - Service ID.
   * @param transactionId - Transaction ID.
   * @returns Transaction details.
   * @throws SimPayValidationError When required params are missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async get(
    serviceId: string,
    transactionId: string,
  ): Promise<TransactionDetails> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!transactionId) {
      throw new SimPayValidationError("transactionId is required");
    }

    const response = await this.httpClient.request<
      ApiResponse<TransactionDetails>
    >({
      method: "GET",
      path: `/payment/${serviceId}/transactions/${transactionId}`,
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
   * Creates a new transaction for the given service.
   *
   * @param serviceId - Service ID.
   * @param payload - Request body for transaction creation.
   * @returns Created transaction payload.
   * @throws SimPayValidationError When serviceId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async create(
    serviceId: string,
    payload: CreateTransactionRequest,
  ): Promise<CreateTransactionResponse> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }

    const response = await this.httpClient.request<
      ApiResponse<CreateTransactionResponse>
    >({
      method: "POST",
      path: `/payment/${serviceId}/transactions`,
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
