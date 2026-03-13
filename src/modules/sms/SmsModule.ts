import type { HttpClient } from "../../client/createHttpClient.js";
import { SmsNumbersApi } from "./numbers/SmsNumbersApi.js";
import { SmsServiceApi } from "./services/SmsServiceApi.js";
import { SmsTransactionsApi } from "./transactions/SmsTransactionsApi.js";
import { SmsVerificationApi } from "./verification/SmsVerificationApi.js";

export class SmsModule {
  public readonly services: SmsServiceApi;
  public readonly transactions: SmsTransactionsApi;
  public readonly verification: SmsVerificationApi;
  public readonly numbers: SmsNumbersApi;

  constructor(httpClient: HttpClient) {
    this.services = new SmsServiceApi(httpClient);
    this.transactions = new SmsTransactionsApi(httpClient);
    this.verification = new SmsVerificationApi(httpClient);
    this.numbers = new SmsNumbersApi(httpClient);
  }
}
