import type { HttpClient } from "../../../client/createHttpClient.js";
import { SimPayValidationError } from "../../../errors/index.js";

export class BlikLevel0Api {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Submits a 6-digit BLIK code for a Level 0 transaction.
   *
   * 204 No Content means the code was accepted for processing.
   * Final code/transaction result should be handled via IPN:
   * `transaction_blik_level0:code_status_changed`.
   *
   * @param serviceId - Service ID.
   * @param transactionId - Transaction ID.
   * @param code - 6-digit BLIK code.
   * @returns Confirmation that submission request was accepted.
   * @throws SimPayValidationError When required params are missing or code format is invalid.
   * @throws SimPayApiError When SimPay API returns HTTP error response.
   */
  public async submitCode(
    serviceId: string,
    transactionId: string,
    code: string,
  ): Promise<{ accepted: true }> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!transactionId) {
      throw new SimPayValidationError("transactionId is required");
    }
    if (!code) {
      throw new SimPayValidationError("code is required");
    }
    if (!/^\d{6}$/.test(code)) {
      throw new SimPayValidationError("code must be a 6-digit string");
    }

    await this.httpClient.request<void>({
      method: "POST",
      path: `/payment/${serviceId}/blik/level0/${transactionId}`,
      body: {
        ticket: {
          T6: code,
        },
      },
    });

    return { accepted: true };
  }
}
