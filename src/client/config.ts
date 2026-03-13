export interface SimPayApiConfig {
  password: string;
  timeout?: number;
}

export interface SimPayServiceConfig {
  id: string;
}

export interface SimPayIpnConfig {
  signatureKey: string;
  validateSourceIp?: boolean;
}

export interface SimPayClientConfig {
  api: SimPayApiConfig;
  service: SimPayServiceConfig;
  ipn: SimPayIpnConfig;
}

export interface ResolvedSimPayClientConfig {
  api: {
    password: string;
    timeout: number;
  };
  service: {
    id: string;
  };
  ipn: {
    signatureKey: string;
    validateSourceIp: boolean;
  };
}

export const API_BASE_URL = "https://api.simpay.pl";
export const DEFAULT_TIMEOUT = 10000;

export function resolveClientConfig(
  config: SimPayClientConfig,
): ResolvedSimPayClientConfig {
  return {
    api: {
      password: config.api.password,
      timeout: config.api.timeout ?? DEFAULT_TIMEOUT,
    },
    service: {
      id: config.service.id,
    },
    ipn: {
      signatureKey: config.ipn.signatureKey,
      validateSourceIp: config.ipn.validateSourceIp ?? false,
    },
  };
}
