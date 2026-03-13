import type { HttpClient } from "../../../client/createHttpClient.js";
import {
  SimPayApiError,
  SimPayValidationError,
} from "../../../errors/index.js";
import type {
  ApiResponse,
  AutoPaymentRequest,
  AutoPaymentResponse,
  BlikAliasItem,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  DeleteAliasRequest,
  ListAliasesQuery,
  ListAliasesResponse,
  ListSubscriptionsQuery,
  ListSubscriptionsResponse,
  Pagination,
  SubscriptionItem,
} from "../../../types/index.js";

export class BlikRecurrentApi {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Returns subscriptions list for a service.
   *
   * @param serviceId - Service ID.
   * @param query - Optional filters, pagination and sorting.
   * @returns Object containing subscriptions data and pagination.
   * @throws SimPayValidationError When serviceId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async list(
    serviceId: string,
    query?: ListSubscriptionsQuery,
  ): Promise<{ data: SubscriptionItem[]; pagination: Pagination }> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }

    const qs = this.buildQueryString({
      status: query?.filter?.status,
      mode: query?.filter?.mode,
      uuid: query?.filter?.uuid,
      page: query?.page,
      perPage: query?.perPage,
      sort: query?.sort,
    });
    const path = `/payment/${serviceId}/subscriptions${qs}`;

    const response = await this.httpClient.request<ListSubscriptionsResponse>({
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

    return { data: response.data, pagination: response.pagination };
  }

  /**
   * Returns BLIK aliases list for a service.
   *
   * @param serviceId - Service ID.
   * @param query - Optional alias filters, pagination and sorting.
   * @returns Object containing aliases data and pagination.
   * @throws SimPayValidationError When serviceId is missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async listAliases(
    serviceId: string,
    query?: ListAliasesQuery,
  ): Promise<{ data: BlikAliasItem[]; pagination: Pagination }> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }

    const qs = this.buildQueryString({
      status: query?.filter?.status,
      type: query?.filter?.type,
      uuid: query?.filter?.uuid,
      value: query?.filter?.value,
      page: query?.page,
      perPage: query?.perPage,
      sort: query?.sort,
    });
    const path = `/payment/${serviceId}/blik/aliases${qs}`;

    const response = await this.httpClient.request<ListAliasesResponse>({
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

    return { data: response.data, pagination: response.pagination };
  }

  /**
   * Creates a BLIK recurrent subscription.
   *
   * @param serviceId - Service ID.
   * @param payload - Subscription creation payload.
   * @returns Created subscription identifiers.
   * @throws SimPayValidationError When required params are missing or invalid.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async create(
    serviceId: string,
    payload: CreateSubscriptionRequest,
  ): Promise<CreateSubscriptionResponse> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!payload?.transactionId) {
      throw new SimPayValidationError("transactionId is required");
    }
    if (!payload?.ticket?.T6) {
      throw new SimPayValidationError("ticket.T6 is required");
    }
    if (!/^\d{6}$/.test(payload.ticket.T6)) {
      throw new SimPayValidationError("ticket.T6 must be a 6-digit string");
    }
    if (!payload?.alias?.value) {
      throw new SimPayValidationError("alias.value is required");
    }
    if (payload?.alias?.type !== "PAYID") {
      throw new SimPayValidationError("alias.type must be PAYID");
    }

    const response = await this.httpClient.request<
      ApiResponse<CreateSubscriptionResponse>
    >({
      method: "POST",
      path: `/payment/${serviceId}/blik/subscriptions`,
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

  /**
   * Triggers BLIK recurrent autopayment for an existing subscription.
   *
   * @param serviceId - Service ID.
   * @param subscriptionId - Subscription ID.
   * @param payload - Autopayment payload.
   * @returns Autopayment processing info.
   * @throws SimPayValidationError When required params are missing.
   * @throws SimPayApiError When SimPay API returns unsuccessful response payload.
   */
  public async autopayment(
    serviceId: string,
    subscriptionId: string,
    payload: AutoPaymentRequest,
  ): Promise<AutoPaymentResponse> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!subscriptionId) {
      throw new SimPayValidationError("subscriptionId is required");
    }
    if (!payload?.transactionId) {
      throw new SimPayValidationError("transactionId is required");
    }

    const response = await this.httpClient.request<
      ApiResponse<AutoPaymentResponse>
    >({
      method: "POST",
      path: `/payment/${serviceId}/blik/subscriptions/${subscriptionId}/autopayment`,
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

  /**
   * Unregisters a BLIK alias for a service.
   *
   * @param serviceId - Service ID.
   * @param aliasId - Alias ID.
   * @param payload - Optional unregister payload with reason.
   * @returns Resolves when API accepts unregister request.
   * @throws SimPayValidationError When required params are missing.
   */
  public async deleteAlias(
    serviceId: string,
    aliasId: string,
    payload?: DeleteAliasRequest,
  ): Promise<void> {
    if (!serviceId) {
      throw new SimPayValidationError("serviceId is required");
    }
    if (!aliasId) {
      throw new SimPayValidationError("aliasId is required");
    }

    await this.httpClient.request<void>({
      method: "DELETE",
      path: `/payment/${serviceId}/blik/aliases/${aliasId}`,
      body: payload,
    });
  }

  private buildQueryString(query: {
    status?: string;
    mode?: string;
    type?: string;
    uuid?: string;
    value?: string;
    page?: number;
    perPage?: number;
    sort?: string;
  }): string {
    const params = new URLSearchParams();

    if (query.status) params.set("filter[status]", query.status);
    if (query.mode) params.set("filter[mode]", query.mode);
    if (query.type) params.set("filter[type]", query.type);
    if (query.uuid) params.set("filter[uuid]", query.uuid);
    if (query.value) params.set("filter[value]", query.value);
    if (typeof query.page !== "undefined")
      params.set("page", String(query.page));
    if (typeof query.perPage !== "undefined")
      params.set("perPage", String(query.perPage));
    if (query.sort) params.set("sort", query.sort);

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}
