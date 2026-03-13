import { SimPayError } from "./SimPayError.js";

export class SimPayValidationError extends SimPayError {
  constructor(message: string) {
    super(message);

    this.name = "SimPayValidationError";
  }
}
