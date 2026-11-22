import type { SmsServiceNumber } from "./numbers.js";

export interface VerifyCodePayload {
  code: string;
  number?: SmsServiceNumber;
}

export interface VerifyCodeResponse {
  used: boolean;
  code: string;
  test: boolean;
  from: string;
  number: SmsServiceNumber;
  /** The API sends this decimal as a string, such as "0.50". */
  value: number | string;
  /** Only present when the code had already been used. */
  used_at?: string;
}
