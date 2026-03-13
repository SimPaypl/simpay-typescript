import type { HttpClient } from "../../../client/createHttpClient.js";
import { SimPayIpnError } from "../../../errors/index.js";
import type { SimPayIpAllowlistResponse } from "../../../types/index.js";
import { time } from "../../../utils/time.js";

export class PaymentIpnIpValidator {
  private static readonly CACHE_TTL_MS = 15 * time.minute;

  private cache: { ips: string[]; expiresAt: number } | null = null;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Validates source IP address against SimPay allowlist.
   *
   * Localhost addresses are accepted for local development.
   * If allowlist endpoint is temporarily unavailable, validation passes (fail-open).
   *
   * @param ip - Source IP address.
   * @returns `true` when IP is allowed, otherwise `false`.
   */
  public async validate(ip: string): Promise<boolean> {
    const normalized = ip.trim();
    if (!normalized) {
      return false;
    }

    // localhost / local dev
    if (
      normalized === "127.0.0.1" ||
      normalized === "::1" ||
      normalized === "::ffff:127.0.0.1"
    ) {
      return true;
    }

    try {
      const ips = await this.getAllowedIps();
      return ips.includes(normalized);
    } catch {
      return true;
    }
  }

  /**
   * Returns cached allowlist or fetches fresh one from `/ip` endpoint.
   *
   * @returns Array of allowed IP addresses.
   */
  private async getAllowedIps(): Promise<string[]> {
    const now = Date.now();
    if (this.cache && this.cache.expiresAt > now) {
      return this.cache.ips;
    }

    const payload = await this.httpClient.request<SimPayIpAllowlistResponse>({
      method: "GET",
      path: "/ip",
    });

    const ips = this.extractIps(payload);

    this.cache = {
      ips,
      expiresAt: now + PaymentIpnIpValidator.CACHE_TTL_MS,
    };

    return ips;
  }

  /**
   * Extracts allowlist IPs from supported endpoint response formats.
   *
   * Supported formats:
   * - string[]
   * - { data: string[] }
   *
   * @param payload - Raw endpoint response.
   * @returns Normalized array of IP addresses.
   * @throws Error when response shape is not recognized.
   */
  private extractIps(payload: SimPayIpAllowlistResponse): string[] {
    if (!payload.success || !Array.isArray(payload.data)) {
      throw new SimPayIpnError("INVALID_IP_ALLOWLIST_RESPONSE");
    }

    return payload.data.map((v) => String(v).trim()).filter(Boolean);
  }
}
