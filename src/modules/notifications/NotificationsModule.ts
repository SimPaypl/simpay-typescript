import type { ResolvedSimPayClientConfig } from "../../client/config.js";
import type { HttpClient } from "../../client/createHttpClient.js";
import { DirectBillingIpnSignature } from "./directbilling/DirectBillingIpnSignature.js";
import { DirectBillingIpnVerifier } from "./directbilling/DirectBillingIpnVerifier.js";
import { PaymentIpnIpValidator } from "./payment/PaymentIpnIpValidator.js";
import { PaymentIpnSignature } from "./payment/PaymentIpnSignature.js";
import { PaymentIpnVerifier } from "./payment/PaymentIpnVerifier.js";

export class NotificationsModule {
  public readonly payment: PaymentIpnVerifier;
  public readonly directbilling: DirectBillingIpnVerifier;

  constructor(
    private readonly config: ResolvedSimPayClientConfig,
    private readonly httpClient: HttpClient,
  ) {
    const paymentSignature = new PaymentIpnSignature();
    const directBillingSignature = new DirectBillingIpnSignature();
    const ipValidator = new PaymentIpnIpValidator(this.httpClient);

    this.payment = new PaymentIpnVerifier(
      paymentSignature,
      ipValidator,
      this.config,
    );
    this.directbilling = new DirectBillingIpnVerifier(
      directBillingSignature,
      ipValidator,
      this.config,
    );
  }
}
