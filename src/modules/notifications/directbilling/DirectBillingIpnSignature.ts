import crypto from "node:crypto";
import type { DirectBillingTransactionNotification } from "../../../types/index.js";

export class DirectBillingIpnSignature {
  public generate(
    payload: DirectBillingTransactionNotification,
    signatureKey: string,
  ): string {
    const clone = { ...payload } as Record<string, unknown>;
    delete clone.signature;

    const parts: string[] = [];
    this.flattenValues(clone, parts);
    parts.push(signatureKey);

    return crypto.createHash("sha256").update(parts.join("|")).digest("hex");
  }

  public isValid(
    payload: DirectBillingTransactionNotification,
    signatureKey: string,
  ): boolean {
    const expected = this.generate(payload, signatureKey);
    const provided = payload.signature;

    if (!this.isValidHex(provided)) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(provided, "hex"),
    );
  }

  private flattenValues(value: unknown, out: string[]): void {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        this.flattenValues(item, out);
      });
      return;
    }

    if (value && typeof value === "object") {
      Object.values(value as Record<string, unknown>).forEach((item) => {
        this.flattenValues(item, out);
      });
      return;
    }

    out.push(String(value));
  }

  private isValidHex(str: string): boolean {
    return (
      typeof str === "string" && str.length === 64 && /^[0-9a-fA-F]+$/.test(str)
    );
  }
}
