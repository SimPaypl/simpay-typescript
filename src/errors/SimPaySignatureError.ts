import { SimPayError } from "./SimPayError.js";

export class SimPaySignatureError extends SimPayError {
  constructor(message: string) {
    super(message);

    this.name = "SimPaySignatureError";
  }
}
