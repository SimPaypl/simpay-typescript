import { SimPayError } from "./SimPayError.js";

export class SimPayApiError extends SimPayError {
  public statusCode: number;
  public errorCode?: string;
  public details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string,
    details?: unknown,
  ) {
    super(message);

    this.name = "SimPayApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}
