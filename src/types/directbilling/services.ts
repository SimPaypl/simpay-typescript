export type DirectBillingServiceStatus =
  | "service_new"
  | "service_active"
  | "service_blocked"
  | "service_rejected"
  | "service_verify"
  | "service_ongoing_registration";

export interface DirectBillingServiceItem {
  id: string;
  name: string;
  suffix: string;
  status: DirectBillingServiceStatus;
  created_at: string;
}
