import { SimPayError } from "./SimPayError.js";

export class SimPayIpnError extends SimPayError {
  public readonly code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = "SimPayIpnError";
    this.code = code;
  }
}
