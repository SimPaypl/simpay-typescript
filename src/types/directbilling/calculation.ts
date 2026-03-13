export interface DirectBillingCalculationOperatorItem {
  net: number;
  gross: number;
}

export interface DirectBillingCalculationResponse {
  orange: DirectBillingCalculationOperatorItem | null;
  play: DirectBillingCalculationOperatorItem | null;
  "t-mobile": DirectBillingCalculationOperatorItem | null;
  plus: DirectBillingCalculationOperatorItem | null;
}
