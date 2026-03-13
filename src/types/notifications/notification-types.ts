export type TransactionStatusEnum =
  | "transaction_new"
  | "transaction_confirmed"
  | "transaction_generated"
  | "transaction_paid"
  | "transaction_failure"
  | "transaction_expired"
  | "transaction_canceled"
  | "transaction_refunded"
  | "transaction_fraud"
  | "transaction_fraud_possibility";

export type RefundStatusEnum =
  | "refund_new"
  | "refund_pending"
  | "refund_completed"
  | "refund_rejected"
  | "refund_failed";

export type BlikAliasStatusEnum =
  | "alias_pending_registration"
  | "alias_active"
  | "alias_expired"
  | "alias_unregistered";

export type SubscriptionStatusEnum =
  | "subscription_pending"
  | "subscription_active"
  | "subscription_cancelled"
  | "subscription_expired"
  | "subscription_finished"
  | "subscription_fraudulent";

export type SubscriptionModeEnum = "BLIK" | "CARD";
export type BlikSubscriptionModelEnum = "A" | "O" | "M";

export type PaymentIpnType =
  | "transaction:status_changed"
  | "transaction_refund:status_changed"
  | "ipn:test"
  | "transaction_blik_level0:code_status_changed"
  | "blik:alias_status_changed"
  | "subscription:status_changed";

export interface PaymentIpnBaseEnvelope<TType extends PaymentIpnType, TData> {
  type: TType;
  notification_id: string;
  date: string;
  data: TData;
  signature: string;
}

export interface TransactionStatusChangedData {
  id: string;
  payer_transaction_id: string;
  service_id: string;
  status: TransactionStatusEnum;
  amount: {
    final_currency: string;
    final_value: string;
    original_currency: string;
    original_value: string;
    commission_system: string | null;
    commission_partner: string | null;
    commission_currency: string | null;
  };
  control?: string;
  payment: {
    channel: string;
    type: string;
  };
  customer: {
    country_code: string | null;
  };
  paid_at?: string | null;
  created_at: string;
}

export interface TransactionRefundStatusChangedData {
  id: string;
  service_id: string;
  status: RefundStatusEnum;
  amount: {
    currency: string;
    value: string;
    wallet_currency: string;
    wallet_value: string;
  };
  transaction: {
    id: string;
    payment_channel: string;
    payment_type: string;
  };
}

export interface IpnTestData {
  service_id: string;
  nonce: string;
}

export interface TransactionBlikLevel0CodeStatusChangedData {
  ticket_status: string;
  transaction: {
    id: string;
    payer_transaction_id: string;
    service_id: string;
    status: TransactionStatusEnum;
    amount: {
      final_currency: string;
      final_value: string;
      original_currency: string;
      original_value: string;
      commission_system: string | null;
      commission_partner: string | null;
      commission_currency: string | null;
    };
    control: string | null;
  };
}

export interface BlikAliasStatusChangedData {
  id: string;
  service_id: string;
  type: string;
  value: string;
  label: string;
  status: BlikAliasStatusEnum;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStatusChangedData {
  id: string;
  service_id: string;
  status: SubscriptionStatusEnum;
  mode: SubscriptionModeEnum;
  created_at: string;
  updated_at: string;
  blik?: {
    model: BlikSubscriptionModelEnum;
    currency: string;
    alias: {
      id: string;
      type: string;
      value: string;
      label: string;
      status: BlikAliasStatusEnum;
      created_at: string;
      updated_at: string;
    };
  };
}

export type TransactionStatusChangedNotification = PaymentIpnBaseEnvelope<
  "transaction:status_changed",
  TransactionStatusChangedData
>;

export type TransactionRefundStatusChangedNotification = PaymentIpnBaseEnvelope<
  "transaction_refund:status_changed",
  TransactionRefundStatusChangedData
>;

export type IpnTestNotification = PaymentIpnBaseEnvelope<
  "ipn:test",
  IpnTestData
>;

export type TransactionBlikLevel0CodeStatusChangedNotification =
  PaymentIpnBaseEnvelope<
    "transaction_blik_level0:code_status_changed",
    TransactionBlikLevel0CodeStatusChangedData
  >;

export type BlikAliasStatusChangedNotification = PaymentIpnBaseEnvelope<
  "blik:alias_status_changed",
  BlikAliasStatusChangedData
>;

export type SubscriptionStatusChangedNotification = PaymentIpnBaseEnvelope<
  "subscription:status_changed",
  SubscriptionStatusChangedData
>;

export type PaymentIpnNotification =
  | TransactionStatusChangedNotification
  | TransactionRefundStatusChangedNotification
  | IpnTestNotification
  | TransactionBlikLevel0CodeStatusChangedNotification
  | BlikAliasStatusChangedNotification
  | SubscriptionStatusChangedNotification;

export interface DirectBillingTransactionNotificationValues {
  net: number;
  gross: number;
  partner: number;
}

export interface DirectBillingTransactionNotificationReturns {
  complete?: string;
  failure?: string;
}

export interface DirectBillingTransactionNotification {
  id: string;
  serviceId: string;
  status:
    | "transaction_db_new"
    | "transaction_db_confirmed"
    | "transaction_db_payed"
    | "transaction_db_rejected";
  values: DirectBillingTransactionNotificationValues;
  returns?: DirectBillingTransactionNotificationReturns;
  control?: string;
  number_from: string;
  provider: number;
  signature: string;
}
