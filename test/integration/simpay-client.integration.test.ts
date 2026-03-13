import { afterEach, describe, expect, it, vi } from "vitest";
import { SimPayClient } from "../../src/index.js";
import { DirectBillingIpnSignature } from "../../src/modules/notifications/directbilling/DirectBillingIpnSignature.js";
import { PaymentIpnSignature } from "../../src/modules/notifications/payment/PaymentIpnSignature.js";
import type { DirectBillingTransactionNotification } from "../../src/types/index.js";

type MockFetch = typeof globalThis.fetch;

function createJsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("SimPayClient integrations", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("integrates SimPayClient -> payments.services.list()", async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse({
        success: true,
        data: [
          {
            id: "payment_service_1",
            name: "Online payments",
            status: "service_active",
            created_at: "2026-03-23T10:00:00+01:00",
          },
        ],
      }),
    ) as MockFetch;

    globalThis.fetch = fetchMock;

    const client = new SimPayClient({
      api: { password: "api_password" },
      service: { id: "service_id" },
      ipn: { signatureKey: "ipn_secret" },
    });

    const result = await client.payments.services.list();

    expect(result).toEqual([
      {
        id: "payment_service_1",
        name: "Online payments",
        status: "service_active",
        created_at: "2026-03-23T10:00:00+01:00",
      },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.simpay.pl/payment",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer api_password",
          Accept: "application/json",
        }),
      }),
    );
  });

  it("integrates SimPayClient -> payments.transactions.create()", async () => {
    const fetchMock = vi.fn(async (_input, init) => {
      expect(init).toEqual(
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer api_password",
            Accept: "application/json",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            amount: 12.5,
            currency: "PLN",
            description: "Order #123",
            customer: {
              email: "john@example.com",
              name: "John Doe",
            },
          }),
        }),
      );

      return createJsonResponse({
        success: true,
        data: {
          transactionId: "tx_123",
          redirectUrl: "https://example.test/redirect/tx_123",
        },
      });
    }) as MockFetch;

    globalThis.fetch = fetchMock;

    const client = new SimPayClient({
      api: { password: "api_password" },
      service: { id: "service_id" },
      ipn: { signatureKey: "ipn_secret" },
    });

    const result = await client.payments.transactions.create("service_id", {
      amount: 12.5,
      currency: "PLN",
      description: "Order #123",
      customer: {
        email: "john@example.com",
        name: "John Doe",
      },
    });

    expect(result).toEqual({
      transactionId: "tx_123",
      redirectUrl: "https://example.test/redirect/tx_123",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.simpay.pl/payment/service_id/transactions",
      expect.any(Object),
    );
  });

  it("integrates SimPayClient -> notifications.payment.verify()", async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse({
        success: true,
        data: ["127.0.0.1"],
      }),
    ) as MockFetch;

    globalThis.fetch = fetchMock;

    const client = new SimPayClient({
      api: { password: "api_password" },
      service: { id: "service_id" },
      ipn: {
        signatureKey: "ipn_secret",
        validateSourceIp: true,
      },
    });

    const basePayload = {
      type: "transaction:status_changed",
      notification_id: "notif_1",
      date: "2026-03-23T12:00:00+01:00",
      data: {
        id: "tx_123",
        payer_transaction_id: "payer_tx_123",
        service_id: "service_id",
        status: "transaction_paid",
        amount: {
          final_currency: "PLN",
          final_value: "12.50",
          original_currency: "PLN",
          original_value: "12.50",
          commission_system: null,
          commission_partner: null,
          commission_currency: null,
        },
        payment: {
          channel: "blik",
          type: "online",
        },
        customer: {
          country_code: "PL",
        },
        created_at: "2026-03-23T12:00:00+01:00",
      },
    };

    const signature = new PaymentIpnSignature().generate(
      basePayload,
      "ipn_secret",
    );

    const result = await client.notifications.payment.verify({
      payload: {
        ...basePayload,
        signature,
      },
      sourceIp: "127.0.0.1",
    });

    expect(result).toBe("OK");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("integrates SimPayClient -> sms.services.list()", async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse({
        success: true,
        data: [
          {
            id: "sms_service_1",
            type: "oneway",
            status: "service_active",
            name: "SMS Premium",
            prefix: "TEST",
            suffix: "7055",
            adult: false,
            created_at: "2026-03-23T10:00:00+01:00",
          },
        ],
      }),
    ) as MockFetch;

    globalThis.fetch = fetchMock;

    const client = new SimPayClient({
      api: { password: "api_password" },
      service: { id: "service_id" },
      ipn: { signatureKey: "ipn_secret" },
    });

    const result = await client.sms.services.list();

    expect(result).toEqual([
      {
        id: "sms_service_1",
        type: "oneway",
        status: "service_active",
        name: "SMS Premium",
        prefix: "TEST",
        suffix: "7055",
        adult: false,
        created_at: "2026-03-23T10:00:00+01:00",
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.simpay.pl/sms",
      expect.objectContaining({
        method: "GET",
      }),
    );
  });

  it("integrates SimPayClient -> sms.verification.verify()", async () => {
    const fetchMock = vi.fn(async (_input, init) => {
      expect(init).toEqual(
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            code: "ABC123",
            number: 7055,
          }),
        }),
      );

      return createJsonResponse({
        success: true,
        data: {
          used: false,
          code: "ABC123",
          test: true,
          from: "48500100200",
          number: 7055,
          value: 5,
        },
      });
    }) as MockFetch;

    globalThis.fetch = fetchMock;

    const client = new SimPayClient({
      api: { password: "api_password" },
      service: { id: "service_id" },
      ipn: { signatureKey: "ipn_secret" },
    });

    const result = await client.sms.verification.verify("sms_service_1", {
      code: "ABC123",
      number: 7055,
    });

    expect(result).toEqual({
      used: false,
      code: "ABC123",
      test: true,
      from: "48500100200",
      number: 7055,
      value: 5,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.simpay.pl/sms/sms_service_1",
      expect.any(Object),
    );
  });

  it("integrates SimPayClient -> directBilling.services.list()", async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse({
        success: true,
        data: [
          {
            id: "db_service_1",
            name: "Direct Billing Service",
            suffix: "1234",
            status: "service_active",
            created_at: "2026-03-23T10:00:00+01:00",
          },
        ],
      }),
    ) as MockFetch;

    globalThis.fetch = fetchMock;

    const client = new SimPayClient({
      api: { password: "api_password" },
      service: { id: "service_id" },
      ipn: { signatureKey: "ipn_secret" },
    });

    const result = await client.directBilling.services.list();

    expect(result).toEqual([
      {
        id: "db_service_1",
        name: "Direct Billing Service",
        suffix: "1234",
        status: "service_active",
        created_at: "2026-03-23T10:00:00+01:00",
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.simpay.pl/directbilling",
      expect.objectContaining({
        method: "GET",
      }),
    );
  });

  it("integrates SimPayClient -> directBilling.transactions.create()", async () => {
    const fetchMock = vi.fn(async (_input, init) => {
      expect(init).toEqual(
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            amount: 19.99,
            amountType: "gross",
            description: "Subscription renewal",
            control: "order_123",
            phoneNumber: "500600700",
          }),
        }),
      );

      return createJsonResponse({
        success: true,
        data: {
          transactionId: "db_tx_1",
          redirectUrl: "https://example.test/directbilling/db_tx_1",
        },
      });
    }) as MockFetch;

    globalThis.fetch = fetchMock;

    const client = new SimPayClient({
      api: { password: "api_password" },
      service: { id: "service_id" },
      ipn: { signatureKey: "ipn_secret" },
    });

    const result = await client.directBilling.transactions.create(
      "db_service_1",
      {
        amount: 19.99,
        amountType: "gross",
        description: "Subscription renewal",
        control: "order_123",
        phoneNumber: "500600700",
      },
    );

    expect(result).toEqual({
      transactionId: "db_tx_1",
      redirectUrl: "https://example.test/directbilling/db_tx_1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.simpay.pl/directbilling/db_service_1/transactions",
      expect.any(Object),
    );
  });

  it("integrates SimPayClient -> notifications.directbilling.verify()", async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse({
        success: true,
        data: ["127.0.0.1"],
      }),
    ) as MockFetch;

    globalThis.fetch = fetchMock;

    const client = new SimPayClient({
      api: { password: "api_password" },
      service: { id: "service_id" },
      ipn: {
        signatureKey: "ipn_secret",
        validateSourceIp: true,
      },
    });

    const basePayload: DirectBillingTransactionNotification = {
      id: "dc261d4f-31ef-4728-bfd6-97bbe2a5ef0a",
      serviceId: "e14f8074",
      status: "transaction_db_payed",
      values: {
        net: 11.07,
        gross: 13.61,
        partner: 5,
      },
      returns: {
        complete: "https://www.simpay.pl/complete",
        failure: "https://www.simpay.pl/failure",
      },
      control: "test",
      number_from: "48123123123",
      provider: 1,
      signature: "",
    };

    const signature = new DirectBillingIpnSignature().generate(
      basePayload,
      "ipn_secret",
    );

    const result = await client.notifications.directbilling.verify({
      payload: {
        ...basePayload,
        signature,
      },
      sourceIp: "127.0.0.1",
    });

    expect(result).toBe("OK");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("integrates SimPayClient -> notifications.directbilling.verify() invalid signature", async () => {
    const client = new SimPayClient({
      api: { password: "api_password" },
      service: { id: "service_id" },
      ipn: {
        signatureKey: "ipn_secret",
        validateSourceIp: false,
      },
    });

    await expect(
      client.notifications.directbilling.verify({
        payload: {
          id: "dc261d4f-31ef-4728-bfd6-97bbe2a5ef0a",
          serviceId: "e14f8074",
          status: "transaction_db_payed",
          values: {
            net: 11.07,
            gross: 13.61,
            partner: 5,
          },
          number_from: "48123123123",
          provider: 1,
          signature: "a".repeat(64),
        },
      }),
    ).rejects.toMatchObject({
      code: "INVALID_SIGNATURE",
    });
  });
});
