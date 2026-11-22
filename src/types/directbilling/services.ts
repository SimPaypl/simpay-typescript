export type DirectBillingServiceStatus =
  | "service_active"
  | "service_db_new"
  | "service_db_blocked"
  | "service_db_deleted"
  | "service_db_second_verify"
  | "service_db_rejected"
  | "service_verify"
  | "service_db_ongoing_registration";

export interface DirectBillingServiceItem {
  id: string;
  name: string;
  suffix: string;
  status: DirectBillingServiceStatus;
  created_at: string;
}
