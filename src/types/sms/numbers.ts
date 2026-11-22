export type SmsServiceNumber =
  | 7055
  | 7155
  | 7255
  | 7355
  | 7455
  | 7555
  | 7636
  | 77464
  | 78464
  | 7936
  | 91055
  | 91155
  | 91455
  | 91664
  | 91955
  | 92055
  | 92555
  | 70908
  | 71908
  | 72998
  | 73908
  | 75908
  | 76908
  | 79908
  | 91998
  | 92598;

export interface SmsNumber {
  number: SmsServiceNumber;
  value: number;
  value_gross: number;
  adult: boolean;
}
