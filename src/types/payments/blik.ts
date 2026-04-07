import type { ApiResponse, Pagination } from "../common/api.js";

export type SubscriptionStatus =
  | "subscription_pending"
  | "subscription_active"
  | "subscription_cancelled"
  | "subscription_expired"
  | "subscription_finished"
  | "subscription_fraudulent";

export type SubscriptionMode = "BLIK" | "CARD";
export type BlikModel = "A" | "O" | "M";
export type AliasType = "PAYID" | "UID";
export type AliasStatus =
  | "alias_pending_registration"
  | "alias_active"
  | "alias_expired"
  | "alias_unregistered";
export type SubscriptionsSort = "-created_at" | "created_at";

type FrequencyUnit = "D" | "W" | "M" | "Y";
type NonZeroDigit = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Digit = "0" | NonZeroDigit;

/**
 * Frequency format accepted by SimPay recurrent subscriptions.
 * Examples: "1D", "2W", "12M", "365D", "1Y".
 */
export type SubscriptionFrequency =
  | `${NonZeroDigit}${FrequencyUnit}`
  | `${NonZeroDigit}${Digit}${FrequencyUnit}`
  | `${NonZeroDigit}${Digit}${Digit}${FrequencyUnit}`;

export interface CreateSubscriptionOptionsModelA {
  model: "A";
  /** Datetime string (ISO 8601), max +10 years. */
  expiresAt: string;
  /** Frequency, e.g. 1M, 7D, 1Y. */
  frequency: SubscriptionFrequency;
  /** Amount limit per single recurrent charge. */
  amountLimitPerTransaction: number;
  /** Date string (YYYY-MM-DD / API date format) for first allowed recurrent charge. */
  initiationDate: string;
  /** Total amount limit for whole subscription. */
  amountLimitTotal: number;
  /** Optional max number of recurrent charges in one alias. */
  transactionsCountLimit?: number;
}

export interface CreateSubscriptionOptionsModelO {
  model: "O";
  /** Date string (YYYY-MM-DD / API date format) for first allowed recurrent charge. */
  initiationDate?: string;
  /** Datetime string (ISO 8601), max +10 years. */
  expiresAt?: string;
}

export interface CreateSubscriptionOptionsModelM {
  model: "M";
  /** Frequency, e.g. 1M, 7D, 1Y. */
  frequency?: SubscriptionFrequency;
  /** Datetime string (ISO 8601), max +10 years. */
  expiresAt?: string;
  /** Date string (YYYY-MM-DD / API date format) for first allowed recurrent charge. */
  initiationDate?: string;
}

export type CreateSubscriptionOptions =
  | CreateSubscriptionOptionsModelA
  | CreateSubscriptionOptionsModelO
  | CreateSubscriptionOptionsModelM;

export interface SubscriptionAlias {
  id: string;
  type: AliasType;
  value: string;
  label: string;
  blik_key: string | null;
  status: AliasStatus;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionCancelled {
  by: "system" | "antifraud" | "merchant" | "payer" | "blik";
  reason: string | null;
}

export interface SubscriptionBlikData {
  model: BlikModel;
  alias: SubscriptionAlias;
}

export interface SubscriptionItem {
  id: string;
  status: SubscriptionStatus;
  mode: SubscriptionMode;
  blik?: SubscriptionBlikData;
  frequency: string | null;
  initiation_date: string | null;
  total_amount_limit: number | null;
  total_transactions_limit: number | null;
  cancelled: SubscriptionCancelled | null;
  created_at: string;
  updated_at: string;
}

export interface BlikAliasSubscription {
  id: string;
  status: SubscriptionStatus;
  mode: SubscriptionMode;
  blik?: {
    model: BlikModel;
  };
  frequency: string | null;
  initiation_date: string | null;
  total_amount_limit: number | null;
  total_transactions_limit: number | null;
  cancelled: SubscriptionCancelled | null;
  created_at: string;
  updated_at: string;
}

export interface BlikAliasItem {
  id: string;
  type: AliasType;
  value: string;
  label: string;
  blik_key: string | null;
  status: AliasStatus;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  subscription: BlikAliasSubscription;
}

export type ListSubscriptionsResponse = ApiResponse<SubscriptionItem[]> & {
  pagination: Pagination;
};

export type ListAliasesResponse = ApiResponse<BlikAliasItem[]> & {
  pagination: Pagination;
};

export interface ListSubscriptionsFilters {
  status?: SubscriptionStatus;
  mode?: SubscriptionMode;
  uuid?: string;
}

export interface ListAliasesFilters {
  status?: AliasStatus;
  type?: AliasType;
  uuid?: string;
  value?: string;
}

export interface ListSubscriptionsQuery {
  filter?: ListSubscriptionsFilters;
  page?: number;
  perPage?: number;
  sort?: SubscriptionsSort;
}

export interface ListAliasesQuery {
  filter?: ListAliasesFilters;
  page?: number;
  perPage?: number;
  sort?: SubscriptionsSort;
}

export interface CreateSubscriptionRequest {
  transactionId: string;
  ticket: { T6: string };
  alias: { value: string; type: "PAYID"; label?: string };
  options: CreateSubscriptionOptions;
  descriptions?: {
    line1?: string | null;
    line2?: string | null;
    line3?: string | null;
  } | null;
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  aliasId: string;
}

export interface AutoPaymentRequest {
  transactionId: string;
  attempt?: number | null;
  descriptions?: {
    line1?: string | null;
    line2?: string | null;
    line3?: string | null;
  } | null;
  alias?: { label?: string | null; noDelay?: boolean | null } | null;
}

export interface AutoPaymentResponse {
  needsUserConfirmation: boolean;
}

export interface DeleteAliasRequest {
  reason?: string | null;
}
