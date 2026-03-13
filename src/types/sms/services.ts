export interface SmsService {
  id: string;
  type: string;
  status: string;
  name: string;
  prefix: string;
  suffix: string;
  adult: boolean;
  created_at: string;
}
