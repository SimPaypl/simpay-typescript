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

export interface TransactionDetails {
  id: string;
  serviceId: string;
  amount: number;
  currency: string;
  status: string;
  channel?: string;
  description?: string;
  control?: string;
  createdAt?: string;
  updatedAt?: string;
  customerEmail?: string;
  customerName?: string;
  [key: string]: unknown;
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
