export type DirectBillingTransactionStatus =
  | "transaction_db_new"
  | "transaction_db_confirmed"
  | "transaction_db_payed"
  | "transaction_db_rejected";

export type DirectBillingOperator = "orange" | "plus" | "play" | "t-mobile";
export type DirectBillingAmountType = "required" | "net" | "gross";

export interface DirectBillingTransactionItem {
  id: string;
  status: DirectBillingTransactionStatus;
  value: number;
  value_netto: number;
  operator: DirectBillingOperator | null;
  created_at: string;
  updated_at: string;
}

export interface DirectBillingTransactionDetails
  extends DirectBillingTransactionItem {
  phoneNumber: string | null;
  control: string | null;
  notify: {
    is_send: boolean;
    last_send_at: string;
    count: number;
  };
}

export interface DirectBillingListTransactionsQuery {
  filter?: {
    status?: DirectBillingTransactionStatus;
    phoneNumber?: string;
    control?: string;
  };
}

export interface DirectBillingCreateTransactionRequest {
  amount: number;
  amountType?: DirectBillingAmountType;
  description?: string;
  control?: string;
  returns?: {
    success?: string;
    failure?: string;
  };
  phoneNumber?: string;
  steamid?: string;
}

export interface DirectBillingCreateTransactionResponse {
  transactionId: string;
  redirectUrl: string;
}
