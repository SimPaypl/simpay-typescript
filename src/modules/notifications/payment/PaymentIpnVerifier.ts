import type { ResolvedSimPayClientConfig } from "../../../client/config.js";
import { SimPayIpnError } from "../../../errors/index.js";
import type {
  PaymentIpnNotification,
  VerifyOptions,
} from "../../../types/index.js";
import type { PaymentIpnIpValidator } from "./PaymentIpnIpValidator.js";
import type { PaymentIpnSignature } from "./PaymentIpnSignature.js";

export class PaymentIpnVerifier {
  constructor(
    private readonly signature: PaymentIpnSignature,
    private readonly ipValidator: PaymentIpnIpValidator,
    private readonly config: ResolvedSimPayClientConfig,
  ) {}

  /**
   * Verifies incoming payment IPN payload.
   *
   * Validation flow:
   * 1) optional source IP validation,
   * 2) signature key presence check,
   * 3) payload signature verification.
   *
   * On success returns plaintext `OK` (to be sent with HTTP 200).
   *
   * @param options - Verification options with payload and optional source IP.
   * @returns Plaintext `OK`.
   * @throws Error `IP_ADDRESS_NOT_WHITELISTED` when IP check fails.
   * @throws Error `IPN_SIGNATURE_KEY_NOT_CONFIGURED` when key is missing.
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

    if (!this.signature.isValid(payload, signatureKey)) {
      throw new SimPayIpnError("INVALID_SIGNATURE");
    }

    if (!this.isPaymentIpnNotification(payload)) {
      throw new SimPayIpnError(
        "INVALID_IPN_PAYLOAD",
        "Invalid IPN payload shape",
      );
    }

    return "OK";
  }

  private isPaymentIpnNotification(
    payload: unknown,
  ): payload is PaymentIpnNotification {
    if (typeof payload !== "object" || payload === null) {
      return false;
    }

    const p = payload as Record<string, unknown>;
    return (
      typeof p.type === "string" &&
      typeof p.notification_id === "string" &&
      typeof p.date === "string" &&
      typeof p.signature === "string" &&
      typeof p.data === "object" &&
      p.data !== null
    );
  }

  /**
   * Verifies payload signature only (without source IP validation).
   *
   * @param payload - Raw IPN payload.
   * @returns `true` when signature is valid, otherwise `false`.
   */
  public verifySignature(payload: unknown): boolean {
    const signatureKey = this.config.ipn.signatureKey;
    if (!signatureKey) return false;
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
}
