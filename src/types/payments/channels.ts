export interface PaymentChannelAmount {
  min: number;
  max: number;
}

export interface PaymentChannel {
  id: string;
  name: string;
  type: string;
  img: string;
  commission: number;
  currencies: string[];
  amount: PaymentChannelAmount;
}
