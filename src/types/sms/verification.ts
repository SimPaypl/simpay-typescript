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
  value: number;
  send_at?: string;
}
