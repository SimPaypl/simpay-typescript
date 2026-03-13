import { SimPayError } from "./SimPayError.js";

export class SimPayNetworkError extends SimPayError {
  public cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);

    this.name = "SimPayNetworkError";
    this.cause = cause;
  }
}
