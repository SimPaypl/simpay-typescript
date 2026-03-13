export type RefundStatus =
  | "refund_new"
  | "refund_pending"
  | "refund_completed"
  | "refund_rejected"
  | "refund_failed";

export interface CreateRefundRequest {
  amount?: number;
  [key: string]: unknown;
}

export interface CreateRefundResponse {
  refund_id: string;
}

export interface RefundDetails {
  id: string;
  status: RefundStatus;
  amount: number;
  currency: string;
  wallet_amount: number;
  wallet_currency: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}
