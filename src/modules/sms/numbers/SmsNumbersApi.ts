import type { HttpClient } from "../../../client/createHttpClient.js";
import {
  SimPayApiError,
  SimPayValidationError,
} from "../../../errors/index.js";
import type {
  ApiResponse,
  SmsNumber,
  SmsServiceNumber,
} from "../../../types/index.js";

export class SmsNumbersApi {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Returns a list of all available sms numbers.
   *
   * @returns Array of sms numbers.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async list(): Promise<SmsNumber[]> {
    const response = await this.httpClient.request<ApiResponse<SmsNumber[]>>({
      method: "GET",
      path: "/sms/numbers",
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
   * Returns details of a single sms number.
   *
   * @param number - Sms number.
   * @returns Sms number details.
   * @throws SimPayValidationError When number is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async get(number: SmsServiceNumber): Promise<SmsNumber> {
    if (!number) {
      throw new SimPayValidationError("number is required");
    }

    const response = await this.httpClient.request<ApiResponse<SmsNumber>>({
      method: "GET",
      path: `/sms/numbers/${number}`,
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
   * Returns a list of sms numbers available for a service.
   *
   * @param serviceId - Service ID.
   * @returns Array of sms numbers.
   * @throws SimPayValidationError When serviceId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async listByService(serviceId: string): Promise<SmsNumber[]> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }

    const response = await this.httpClient.request<ApiResponse<SmsNumber[]>>({
      method: "GET",
      path: `/sms/${serviceId}/numbers`,
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
   * Returns details of a single sms number for a service.
   *
   * @param serviceId - Service ID.
   * @param number - Sms number.
   * @returns Sms number details.
   * @throws SimPayValidationError When serviceId or number is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async getByService(
    serviceId: string,
    number: SmsServiceNumber,
  ): Promise<SmsNumber> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!number) {
      throw new SimPayValidationError("number is required");
    }

    const response = await this.httpClient.request<ApiResponse<SmsNumber>>({
      method: "GET",
      path: `/sms/${serviceId}/numbers/${number}`,
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
