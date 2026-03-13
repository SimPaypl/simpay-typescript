import crypto from "node:crypto";

export class PaymentIpnSignature {
  /**
   * Generates SHA-256 signature for IPN payload.
   *
   * Concatenation format:
   * type|notification_id|date|data_value1|...|data_valueN|signatureKey
   * Field `signature` from payload is ignored.
   *
   * @param payload - Raw IPN payload.
   * @param signatureKey - Service IPN secret key.
   * @returns Lowercase SHA-256 hex signature.
   */
  public generate(payload: unknown, signatureKey: string): string {
    const data = this.flattenArray(payload);
    data.push(signatureKey);

    return crypto.createHash("sha256").update(data.join("|")).digest("hex");
  }

  /**
   * Verifies payload signature using timing-safe comparison.
   *
   * @param payload - Raw IPN payload with `signature` field.
   * @param signatureKey - Service IPN secret key.
   * @returns `true` when signature is valid, otherwise `false`.
   */
  public isValid(payload: unknown, signatureKey: string): boolean {
    if (!payload || typeof payload !== "object") {
      return false;
    }

    const signature = this.generate(payload, signatureKey);
    const payloadSignature = String(
      (payload as Record<string, unknown>).signature ?? "",
    );

    if (!this.isValidHex(payloadSignature)) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(payloadSignature, "hex"),
    );
  }

  private isValidHex(str: string): boolean {
    if (typeof str !== "string" || str.length !== 64) {
      return false;
    }

    return /^[0-9a-fA-F]+$/.test(str);
  }

  private flattenArray(payload: unknown): string[] {
    if (!payload || typeof payload !== "object") {
      return [];
    }

    const arrayClone = { ...(payload as Record<string, unknown>) };
    delete arrayClone.signature;

    const result: string[] = [];

    const flatten = (obj: unknown): void => {
      if (Array.isArray(obj)) {
        obj.forEach((item) => {
          flatten(item);
        });
      } else if (typeof obj === "object" && obj !== null) {
        Object.values(obj as Record<string, unknown>).forEach((value) => {
          flatten(value);
        });
      } else {
        result.push(String(obj));
      }
    };

    flatten(arrayClone);
    return result;
  }
}
