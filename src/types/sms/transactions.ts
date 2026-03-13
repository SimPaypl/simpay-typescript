import type { SmsServiceNumber } from "./numbers.js";

export interface SmsTransaction {
  id: number;
  from: number;
  code: string;
  used: boolean;
  send_number: SmsServiceNumber;
  value: number;
  send_at: string;
}
