import type { HttpClient } from "../../../client/createHttpClient.js";
import {
  SimPayApiError,
  SimPayValidationError,
} from "../../../errors/index.js";
import type {
  ApiResponse,
  VerifyCodePayload,
  VerifyCodeResponse,
} from "../../../types/index.js";

export class SmsVerificationApi {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Verifies sms code for a given service.
   *
   * @param serviceId - Service ID.
   * @param payload - Sms code payload.
   * @returns Verification result.
   * @throws SimPayValidationError When serviceId or payload.code is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async verify(
    serviceId: string,
    payload: VerifyCodePayload,
  ): Promise<VerifyCodeResponse> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!payload?.code) {
      throw new SimPayValidationError("code is required");
    }

    const response = await this.httpClient.request<
      ApiResponse<VerifyCodeResponse>
    >({
      method: "POST",
      path: `/sms/${serviceId}`,
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
