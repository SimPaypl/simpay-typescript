export class SimPayError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "SimPayError";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
