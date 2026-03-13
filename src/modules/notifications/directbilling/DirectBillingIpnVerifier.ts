import type { ResolvedSimPayClientConfig } from "../../../client/config.js";
import { SimPayIpnError } from "../../../errors/index.js";
import type {
  DirectBillingTransactionNotification,
  VerifyOptions,
} from "../../../types/index.js";
import type { PaymentIpnIpValidator } from "../payment/PaymentIpnIpValidator.js";
import type { DirectBillingIpnSignature } from "./DirectBillingIpnSignature.js";

export class DirectBillingIpnVerifier {
  constructor(
    private readonly signature: DirectBillingIpnSignature,
    private readonly ipValidator: PaymentIpnIpValidator,
    private readonly config: ResolvedSimPayClientConfig,
  ) {}

  /**
   * Verifies incoming DirectBilling IPN payload.
   *
   * Validation flow:
   * 1) optional source IP validation,
   * 2) signature key presence check,
   * 3) payload shape validation,
   * 4) payload signature verification.
   *
   * On success returns plaintext `OK` (to be sent with HTTP 200).
   *
   * @param options - Verification options with payload and optional source IP.
   * @returns Plaintext `OK`.
   * @throws Error `IP_ADDRESS_NOT_WHITELISTED` when IP check fails.
   * @throws Error `IPN_SIGNATURE_KEY_NOT_CONFIGURED` when key is missing.
   * @throws Error `INVALID_IPN_PAYLOAD` when payload shape is invalid.
   * @throws Error `INVALID_SIGNATURE` when signature is invalid.
   */
  public async verify(options: VerifyOptions): Promise<string> {
    const { payload, sourceIp } = options;

    if (sourceIp && !(await this.ipValidator.validate(sourceIp))) {
      throw new SimPayIpnError("IP_ADDRESS_NOT_WHITELISTED");
    }

    const signatureKey = this.config.ipn.signatureKey;
    if (!signatureKey) {
      throw new SimPayIpnError("IPN_SIGNATURE_KEY_NOT_CONFIGURED");
    }

    if (!this.isDirectBillingNotification(payload)) {
      throw new SimPayIpnError(
        "INVALID_IPN_PAYLOAD",
        "Invalid DirectBilling payload shape",
      );
    }

    if (!this.signature.isValid(payload, signatureKey)) {
      throw new SimPayIpnError("INVALID_SIGNATURE");
    }

    return "OK";
  }

  /**
   * Verifies payload signature only (without source IP validation).
   *
   * @param payload - Raw DirectBilling IPN payload.
   * @returns `true` when signature is valid, otherwise `false`.
   */
  public verifySignature(payload: unknown): boolean {
    const signatureKey = this.config.ipn.signatureKey;
    if (!signatureKey || !this.isDirectBillingNotification(payload)) {
      return false;
    }

    return this.signature.isValid(payload, signatureKey);
  }

  /**
   * Validates source IP only.
   *
   * @param ip - Source IP address.
   * @returns `true` when IP is allowed, otherwise `false`.
   */
  public async validateSourceIp(ip: string): Promise<boolean> {
    return this.ipValidator.validate(ip);
  }

  /**
   * Checks whether payload matches DirectBilling notification shape.
   *
   * @param payload - Raw payload.
   * @returns Type guard result for DirectBilling notification.
   */
  private isDirectBillingNotification(
    payload: unknown,
  ): payload is DirectBillingTransactionNotification {
    if (!payload || typeof payload !== "object") {
      return false;
    }

    const p = payload as Record<string, unknown>;
    return (
      typeof p.id === "string" &&
      typeof p.serviceId === "string" &&
      typeof p.status === "string" &&
      typeof p.values === "object" &&
      p.values !== null &&
      typeof p.number_from === "string" &&
      typeof p.provider === "number" &&
      typeof p.signature === "string"
    );
  }
}
