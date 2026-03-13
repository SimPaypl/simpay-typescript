import type { HttpClient } from "../../client/createHttpClient.js";
import { BlikLevel0Api } from "./blik/BlikLevel0Api.js";
import { BlikRecurrentApi } from "./blik/BlikRecurrentApi.js";
import { PaymentsChannelsApi } from "./channels/PaymentsChannelsApi.js";
import { PaymentsRefundsApi } from "./refunds/PaymentsRefundsApi.js";
import { PaymentsServicesApi } from "./services/PaymentsServicesApi.js";
import { PaymentsTransactionsApi } from "./transactions/PaymentsTransactionsApi.js";

export class PaymentsModule {
  public readonly services: PaymentsServicesApi;
  public readonly channels: PaymentsChannelsApi;
  public readonly transactions: PaymentsTransactionsApi;
  public readonly refunds: PaymentsRefundsApi;
  public readonly blikLevel0: BlikLevel0Api;
  public readonly blikRecurrent: BlikRecurrentApi;

  constructor(private readonly httpClient: HttpClient) {
    this.services = new PaymentsServicesApi(this.httpClient);
    this.channels = new PaymentsChannelsApi(this.httpClient);
    this.transactions = new PaymentsTransactionsApi(this.httpClient);
    this.refunds = new PaymentsRefundsApi(this.httpClient);
    this.blikLevel0 = new BlikLevel0Api(this.httpClient);
    this.blikRecurrent = new BlikRecurrentApi(this.httpClient);
  }
}
