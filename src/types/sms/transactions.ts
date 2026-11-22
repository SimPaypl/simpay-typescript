import type { SmsServiceNumber } from "./numbers.js";

export interface SmsTransaction {
  id: number;
  from: number;
  code: string | null;
  used: boolean;
  /** Only in `get()`, the list does not include it. */
  send_number?: SmsServiceNumber;
  /** Only in `get()`, the list does not include it. Sent as a string, such as "0.50". */
  value?: number | string;
  send_at: string;
}
