export interface TransactionCustomer {
  name?: string;
  email: string;
  ip?: string;
  countryCode?: string;
}

export interface TransactionAntifraud {
  useragent?: string;
  steamid?: number;
  mcusername?: string;
  mcid?: string;
}

export interface TransactionAddress {
  name?: string;
  surname?: string;
  street?: string;
  building?: string;
  flat?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  company?: string;
}

export interface TransactionCartItem {
  name: string;
  quantity: number;
  price: number;
  producer?: string;
  category?: string;
  code?: string;
}

export interface TransactionReturns {
  success?: string;
  failure?: string;
}

export interface TransactionChannelTypes {
  blik?: boolean;
  transfer?: boolean;
  cards?: boolean;
  ewallets?: boolean;
  paypal?: boolean;
  paysafe?: boolean;
  latam?: boolean;
}

export interface CreateTransactionRequest {
  amount: number;
  currency?: string;
  description?: string;
  control?: string;
  customer?: TransactionCustomer;
  antifraud?: TransactionAntifraud;
  billing?: TransactionAddress;
  shipping?: TransactionAddress;
  cart?: TransactionCartItem[];
  returns?: TransactionReturns;
  directChannel?: string;
  channels?: string[];
  channelTypes?: TransactionChannelTypes;
  referer?: string;
}

export interface CreateTransactionResponse {
  transactionId: string;
  redirectUrl: string;
}

/** Item returned by `payments.transactions.list()`. */
export interface TransactionListItem {
  id: string;
  status: string;
  amount: number;
  control: string | null;
  channel: string | null;
  paid_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TransactionAmount {
  value: number;
  currency: string;
  /** Decimal values may arrive as strings, such as "0.25". */
  commission: number | string;
  commission_currency: string;
  commission_mode: string;
  /** Present when the transaction was created in a currency converted to PLN. */
  original?: {
    value: number;
    currency: string;
    pln_rate: number | string | null;
  };
}

/** Returned by `payments.transactions.get()`. */
export interface TransactionDetails {
  id: string;
  payer_transaction_id: string | null;
  status: string;
  amount: TransactionAmount;
  channel: string | null;
  control: string | null;
  description: string | null;
  redirect: {
    success: string | null;
    failure: string | null;
    pending: string | null;
  };
  customer: {
    name: string | null;
    email: string | null;
    ip: string | null;
    country: string | null;
  };
  billing?: TransactionAddress | null;
  shipping?: TransactionAddress | null;
  cart?: TransactionCartItem[];
  additional: Record<string, unknown> | null;
  paid_at: string | null;
  expires_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  checkout_url: string | null;
}

export interface TransactionListQuery {
  page?: number;
  limit?: number;
  status?: string;
  from?: string;
  to?: string;
  control?: string;
  [key: string]: unknown;
}
