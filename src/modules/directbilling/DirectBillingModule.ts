import type { HttpClient } from "../../client/createHttpClient.js";
import { DirectBillingCalculationApi } from "./calculation/DirectBillingCalculationApi.js";
import { DirectBillingServicesApi } from "./services/DirectBillingServicesApi.js";
import { DirectBillingTransactionsApi } from "./transactions/DirectBillingTransactionsApi.js";

export class DirectBillingModule {
  public readonly services: DirectBillingServicesApi;
  public readonly calculation: DirectBillingCalculationApi;
  public readonly transactions: DirectBillingTransactionsApi;

  constructor(private readonly httpClient: HttpClient) {
    this.services = new DirectBillingServicesApi(this.httpClient);
    this.calculation = new DirectBillingCalculationApi(this.httpClient);
    this.transactions = new DirectBillingTransactionsApi(this.httpClient);
  }
}
