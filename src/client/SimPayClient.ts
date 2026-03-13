import { DirectBillingModule } from "../modules/directbilling/DirectBillingModule.js";
import { NotificationsModule } from "../modules/notifications/NotificationsModule.js";
import { PaymentsModule } from "../modules/payments/PaymentsModule.js";
import { SmsModule } from "../modules/sms/SmsModule.js";
import {
  type ResolvedSimPayClientConfig,
  resolveClientConfig,
  type SimPayClientConfig,
} from "./config.js";
import { createHttpClient, type HttpClient } from "./createHttpClient.js";

export class SimPayClient {
  public readonly payments: PaymentsModule;
  public readonly notifications: NotificationsModule;
  public readonly sms: SmsModule;
  public readonly directBilling: DirectBillingModule;

  private readonly config: ResolvedSimPayClientConfig;
  private readonly httpClient: HttpClient;

  constructor(config: SimPayClientConfig) {
    this.config = resolveClientConfig(config);

    this.httpClient = createHttpClient({
      apiPassword: this.config.api.password,
      timeout: this.config.api.timeout,
    });

    this.payments = new PaymentsModule(this.httpClient);
    this.notifications = new NotificationsModule(this.config, this.httpClient);
    this.sms = new SmsModule(this.httpClient);
    this.directBilling = new DirectBillingModule(this.httpClient);
  }
}
