Oficjalne SDK SimPay dla TypeScript i Node.js.

Biblioteka udostępnia klienta `SimPayClient` oraz moduły dla:

- płatności online (`payments`)
- SMS Premium (`sms`)
- Direct Billing (`directBilling`)
- notyfikacji IPN (`notifications`)

SDK działa w środowisku Node.js i korzysta z natywnego `fetch`.

---

## Wymagania

- Node.js `>= 18`

---

## Instalacja

```bash
npm install @simpay/typescript
```

---

## Szybki start

```ts
import { SimPayClient } from "@simpay/typescript";

const simpay = new SimPayClient({
  api: {
    password: process.env.SIMPAY_API_PASSWORD!,
  },
  service: {
    id: process.env.SIMPAY_SERVICE_ID!,
  },
  ipn: {
    signatureKey: process.env.SIMPAY_IPN_SIGNATURE_KEY!,
    validateSourceIp: true,
  },
});
```

---

## Konfiguracja klienta

```ts
import type { SimPayClientConfig } from "@simpay/typescript";

const config: SimPayClientConfig = {
  api: {
    password: "YOUR_API_PASSWORD",
    timeout: 10000,
  },
  service: {
    id: "YOUR_DEFAULT_SERVICE_ID",
  },
  ipn: {
    signatureKey: "YOUR_IPN_SIGNATURE_KEY",
    validateSourceIp: false,
  },
};
```

### Pola konfiguracji

#### `api.password`
Hasło API SimPay używane do autoryzacji `Bearer`.

#### `api.timeout`
Timeout requestów HTTP w milisekundach. Jeśli nie podasz własnej wartości, SDK użyje `10000` ms.

#### `service.id`
Domyślne ID usługi. Nadal możesz przekazywać `serviceId` jawnie do metod modułów.

#### `ipn.signatureKey`
Klucz do weryfikacji podpisów IPN.

#### `ipn.validateSourceIp`
Czy weryfikować adres źródłowy IPN przez allowlistę SimPay.

---

# Publiczne API

## Runtime

- `SimPayClient`

## Błędy

- `SimPayError`
- `SimPayApiError`
- `SimPayValidationError`
- `SimPaySignatureError`
- `SimPayNetworkError`
- `SimPayIpnError`

## Typy

SDK eksportuje publiczne typy dla:

- `payments`
- `sms`
- `directbilling`
- `notifications`
- `common`

Przykład:

```ts
import type {
  CreateTransactionRequest,
  VerifyCodePayload,
  DirectBillingCreateTransactionRequest,
  PaymentIpnNotification,
} from "@simpay/typescript";
```

---

# Moduły

## Payments

Dostęp przez:

```ts
simpay.payments
```

### Dostępne podmoduły

- `simpay.payments.services`
- `simpay.payments.channels`
- `simpay.payments.transactions`
- `simpay.payments.refunds`
- `simpay.payments.blikLevel0`
- `simpay.payments.blikRecurrent`

---

## Payments → Services

### Lista usług płatności

```ts
const services = await simpay.payments.services.list();
```

### Szczegóły usługi

```ts
const service = await simpay.payments.services.get("service_id");
```

---

## Payments → Channels

### Lista kanałów płatności

```ts
const channels = await simpay.payments.channels.list("service_id");
```

---

## Payments → Transactions

### Utworzenie transakcji

```ts
const transaction = await simpay.payments.transactions.create("service_id", {
  amount: 12.5,
  currency: "PLN",
  description: "Order #123",
  control: "order_123",
  customer: {
    email: "john@example.com",
    name: "John Doe",
  },
  returns: {
    success: "https://twoja-strona.pl/payment/success",
    failure: "https://twoja-strona.pl/payment/failure",
  },
});
```

Przykładowa odpowiedź:

```ts
const response = {
  transactionId: "tx_123",
  redirectUrl: "https://...",
};
```

### Lista transakcji

```ts
const transactions = await simpay.payments.transactions.list("service_id");
```

### Szczegóły transakcji

```ts
const details = await simpay.payments.transactions.get(
  "service_id",
  "transaction_id",
);
```

---

## Payments → Refunds

### Lista refundów transakcji

```ts
const refunds = await simpay.payments.refunds.list(
  "service_id",
  "transaction_id",
);
```

### Szczegóły refundu

```ts
const refund = await simpay.payments.refunds.get(
  "service_id",
  "transaction_id",
  "refund_id",
);
```

### Utworzenie refundu

```ts
const createdRefund = await simpay.payments.refunds.create(
  "service_id",
  "transaction_id",
  {
    amount: 10,
  },
);
```

---

## Payments → BLIK Level 0

### Wysłanie 6-cyfrowego kodu BLIK

```ts
const result = await simpay.payments.blikLevel0.submitCode(
  "service_id",
  "transaction_id",
  "123456",
);
```

Odpowiedź:

```ts
{ accepted: true }
```

---

## Payments → BLIK Recurrent

Pełna dokumentacja SimPay dla BLIK Recurrent:
https://docs.simpay.pl/payment/blik-recurrent

### Flow Płatności Powtarzalnej BLIK (krok po kroku)

#### 1) Rejestracja subskrypcji (zgoda użytkownika)

Najpierw tworzysz **pierwszą transakcję** dla kanału `blik-recurrent`.
Ta transakcja zakłada zgodę użytkownika i pozwala potem utworzyć subskrypcję.

```ts
const firstTransaction = await simpay.payments.transactions.create("service_id", {
  amount: 0, // może być 0 tylko przy rejestracji zgody
  currency: "PLN", // BLIK recurrent działa w PLN
  description: "Subskrypcja premium",
  control: "SUB-123",
  directChannel: "blik-recurrent",
  customer: {
    email: "user@example.com",
    ip: "1.2.3.4",
    countryCode: "PL",
  },
  antifraud: {
    useragent: "Mozilla/5.0 ...",
    systemId: "user-123", // stałe ID użytkownika w Twoim systemie
  },
});
```

Potem tworzysz subskrypcję BLIK (model A/O/M) i podajesz kod BLIK (`ticket.T6`):

```ts
const created = await simpay.payments.blikRecurrent.create("service_id", {
  transactionId: firstTransaction.transactionId,
  ticket: { T6: "123456" },
  alias: {
    value: "AABBCC",
    type: "PAYID",
    label: "Subskrypcja premium",
  },
  options: {
    // przykład modelu A (AUTO)
    model: "A",
    expiresAt: "2030-12-31T23:59:59+01:00",
    frequency: "1M",
    amountLimitPerTransaction: 49.99,
    initiationDate: "2026-05-01T10:00:00+02:00",
    amountLimitTotal: 2000,
  },
});
```

Jeśli rejestracja się powiedzie, dostajesz m.in.:

- `subscriptionId`
- `aliasId`

> Ważne: samo `subscriptionId` **nie oznacza**, że subskrypcja jest aktywna.

#### 2) Czekasz na IPN aktywujący subskrypcję

Subskrypcja jest gotowa do obciążeń dopiero po notyfikacji IPN:

- `subscription:status_changed`
- ze statusem `subscription_active`

#### 3) Kolejne obciążenia aktywnej subskrypcji

Dopiero wtedy wywołujesz autopayment:

```ts
const autopayment = await simpay.payments.blikRecurrent.autopayment(
  "service_id",
  "subscription_id",
  {
    transactionId: "order-2026-001",
    attempt: 0, // zakres 0-9
    alias: {
      noDelay: true,
    },
  },
);
```

Technicznie odpowiada to endpointowi:

`POST /payment/{serviceId}/blik/subscriptions/{subscriptionId}/autopayment`

#### Zasady pracy z `attempt`

- `attempt` wysyłasz w zakresie `0-9`.
- Pierwsza próba to `attempt: 0`, każda kolejna próba musi zwiększać numer o `+1`.
- Dobrą praktyką jest iterowanie prób sekwencyjnie (`0 -> 1 -> 2 ...`).
- **Nie wysyłaj kolejnej próby, dopóki poprzednia nie jest zakończona** (np. przez finalny status transakcji/IPN). Równoległe próby dla tego samego obciążenia mogą powodować błędy walidacji lub niespójny stan.

### Modele subskrypcji i `options`

- **Model A** (stała kwota, bez kolejnych potwierdzeń):
  - `options.expiresAt` (wymagane)
  - `options.frequency` (wymagane)
  - `options.amountLimitPerTransaction` (wymagane)
  - `options.initiationDate` (wymagane)
  - `options.amountLimitTotal` (wymagane)
- **Model O** (kwota zmienna, bez potwierdzania):
  - zazwyczaj używane: `options.initiationDate`, `options.expiresAt`
- **Model M** (kwota zmienna, z potwierdzaniem każdej płatności):
  - opcjonalnie: `options.initiationDate`, `options.expiresAt`, `options.frequency`

### Najważniejsze rzeczy, o których łatwo zapomnieć

- `antifraud.systemId` musi być stałe dla tego samego użytkownika.
- `amount: 0` jest dozwolone tylko przy rejestracji zgody (pierwsza transakcja).
- Kolejnych obciążeń nie wykonujesz na `0 PLN`.
- BLIK recurrent działa tylko dla `PLN` i `customer.countryCode = "PL"`.
- Przy pierwszej transakcji wysyłasz `customer.ip` i `antifraud.useragent`; przy kolejnych obciążeniach już nie.

### Lista subskrypcji BLIK

```ts
const result = await simpay.payments.blikRecurrent.list("service_id", {
  filter: {
    status: "subscription_active",
    mode: "BLIK",
  },
  page: 1,
  perPage: 20,
  sort: "-created_at",
});
```

### Utworzenie subskrypcji BLIK

```ts
const created = await simpay.payments.blikRecurrent.create("service_id", {
  transactionId: "tx_123",
  ticket: { T6: "123456" },
  alias: {
    value: "AABBCC",
    type: "PAYID",
    label: "Subskrypcja premium",
  },
  options: {
    model: "O",
  },
});
```

### Autopayment dla subskrypcji

```ts
const autopayment = await simpay.payments.blikRecurrent.autopayment(
  "service_id",
  "subscription_id",
  {
    transactionId: "tx_456",
    attempt: 0,
  },
);
```

### Lista aliasów BLIK

```ts
const aliases = await simpay.payments.blikRecurrent.listAliases("service_id", {
  filter: {
    status: "alias_active",
    type: "PAYID",
  },
  page: 1,
  perPage: 20,
  sort: "-created_at",
});
```

### Wyrejestrowanie aliasu BLIK

```ts
await simpay.payments.blikRecurrent.deleteAlias(
  "service_id",
  "alias_id",
  {
    reason: "Rezygnacja użytkownika",
  },
);
```

---

# SMS Premium

Dostęp przez:

```ts
simpay.sms
```

### Dostępne podmoduły

- `simpay.sms.services`
- `simpay.sms.transactions`
- `simpay.sms.verification`
- `simpay.sms.numbers`

---

## SMS → Services

### Lista usług SMS

```ts
const services = await simpay.sms.services.list();
```

### Szczegóły usługi SMS

```ts
const service = await simpay.sms.services.get("service_id");
```

---

## SMS → Transactions

### Lista transakcji SMS

```ts
const transactions = await simpay.sms.transactions.list("service_id");
```

### Szczegóły transakcji SMS

```ts
const transaction = await simpay.sms.transactions.get("service_id", 123456);
```

---

## SMS → Verification

### Weryfikacja kodu SMS

```ts
const result = await simpay.sms.verification.verify("service_id", {
  code: "ABC123",
  number: 7055,
});
```

Przykładowa odpowiedź:

```ts
const response = {
  used: false,
  code: "ABC123",
  test: true,
  from: "48500100200",
  number: 7055,
  value: 5,
};
```

---

## SMS → Numbers

### Lista wszystkich numerów SMS

```ts
const numbers = await simpay.sms.numbers.list();
```

### Szczegóły numeru

```ts
const number = await simpay.sms.numbers.get(7055);
```

### Lista numerów dla usługi

```ts
const serviceNumbers = await simpay.sms.numbers.listByService("service_id");
```

### Szczegóły numeru dla usługi

```ts
const serviceNumber = await simpay.sms.numbers.getByService("service_id", 7055);
```

---

# Direct Billing

Dostęp przez:

```ts
simpay.directBilling
```

### Dostępne podmoduły

- `simpay.directBilling.services`
- `simpay.directBilling.calculation`
- `simpay.directBilling.transactions`

---

## Direct Billing → Services

### Lista usług Direct Billing

```ts
const services = await simpay.directBilling.services.list();
```

### Szczegóły usługi Direct Billing

```ts
const service = await simpay.directBilling.services.get("service_id");
```

---

## Direct Billing → Calculation

### Kalkulacja prowizji

```ts
const calculation = await simpay.directBilling.calculation.calculate(
  "service_id",
  25,
);
```

---

## Direct Billing → Transactions

### Utworzenie transakcji Direct Billing

```ts
const transaction = await simpay.directBilling.transactions.create(
  "service_id",
  {
    amount: 19.99,
    amountType: "gross",
    description: "Subscription renewal",
    control: "order_123",
    phoneNumber: "500600700",
    returns: {
      success: "https://twoja-strona.pl/db/success",
      failure: "https://twoja-strona.pl/db/failure",
    },
  },
);
```

### Lista transakcji Direct Billing

```ts
const transactions = await simpay.directBilling.transactions.list(
  "service_id",
  {
    filter: {
      status: "transaction_db_payed",
    },
  },
);
```

### Szczegóły transakcji Direct Billing

```ts
const details = await simpay.directBilling.transactions.get(
  "service_id",
  "transaction_id",
);
```

---

# Notifications / IPN

Dostęp przez:

```ts
simpay.notifications
```

### Dostępne podmoduły

- `simpay.notifications.payment`
- `simpay.notifications.directbilling`

---

## Payment IPN

### Weryfikacja IPN płatności

```ts
const result = await simpay.notifications.payment.verify({
  payload: req.body,
  sourceIp: req.ip,
});
```

Po poprawnej walidacji metoda zwraca:

```ts
"OK"
```

### Dodatkowe metody

```ts
const isValid = simpay.notifications.payment.verifySignature(payload);
const isAllowedIp = await simpay.notifications.payment.validateSourceIp(ip);
```

### Przykład z Express.js

Poniższy przykład pokazuje pełny handler webhooka płatności:
- odbiór `req.body`
- weryfikację podpisu i adresu IP
- zawężanie typu notyfikacji przez `switch (payload.type)`
- zwrócenie wymaganej odpowiedzi `OK`

```ts
import express from "express";
import {
  SimPayClient,
  SimPayIpnError,
  type PaymentIpnNotification,
} from "@simpay/typescript";

const app = express();
app.use(express.json());

const simpay = new SimPayClient({
  api: {
    password: process.env.SIMPAY_API_PASSWORD!,
  },
  service: {
    id: process.env.SIMPAY_SERVICE_ID!,
  },
  ipn: {
    signatureKey: process.env.SIMPAY_IPN_SIGNATURE_KEY!,
    validateSourceIp: true,
  },
});

app.post("/webhooks/simpay/payment", async (req, res) => {
  try {
    await simpay.notifications.payment.verify({
      payload: req.body,
      sourceIp: req.ip,
    });

    const payload = req.body as PaymentIpnNotification;

    switch (payload.type) {
      case "transaction:status_changed": {
        const transactionId = payload.data.id;
        const status = payload.data.status;
        const payerTransactionId = payload.data.payer_transaction_id;

        console.log("payment transaction status changed", {
          transactionId,
          payerTransactionId,
          status,
        });
        break;
      }

      case "transaction_refund:status_changed": {
        const refundId = payload.data.id;
        const refundStatus = payload.data.status;
        const transactionId = payload.data.transaction.id;

        console.log("refund status changed", {
          refundId,
          transactionId,
          refundStatus,
        });
        break;
      }

      case "transaction_blik_level0:code_status_changed": {
        const ticketStatus = payload.data.ticket_status;
        const transactionId = payload.data.transaction.id;
        const transactionStatus = payload.data.transaction.status;

        console.log("blik level0 status changed", {
          transactionId,
          ticketStatus,
          transactionStatus,
        });
        break;
      }

      case "blik:alias_status_changed": {
        const aliasId = payload.data.id;
        const aliasStatus = payload.data.status;
        const aliasValue = payload.data.value;

        console.log("blik alias status changed", {
          aliasId,
          aliasStatus,
          aliasValue,
        });
        break;
      }

      case "subscription:status_changed": {
        const subscriptionId = payload.data.id;
        const subscriptionStatus = payload.data.status;
        const mode = payload.data.mode;

        console.log("subscription status changed", {
          subscriptionId,
          subscriptionStatus,
          mode,
        });
        break;
      }

      case "ipn:test": {
        console.log("received payment ipn test", {
          serviceId: payload.data.service_id,
          nonce: payload.data.nonce,
        });
        break;
      }

      default: {
        const neverPayload: never = payload;
        throw new Error(`Unhandled payment notification: ${String(neverPayload)}`);
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    if (error instanceof SimPayIpnError) {
      res.status(400).send(error.code);
      return;
    }

    res.status(500).send("ERROR");
  }
});
```

### Dlaczego `switch` działa dobrze z typami?

Typ `PaymentIpnNotification` jest unią typów rozróżnianą po polu `type`.
To znaczy, że po wejściu do konkretnego `case` TypeScript zawęża `payload.data` do właściwego kształtu.

Przykład:

```ts
function handlePaymentNotification(payload: PaymentIpnNotification): void {
  switch (payload.type) {
    case "transaction:status_changed":
      payload.data.id;
      payload.data.status;
      payload.data.payer_transaction_id;
      break;

    case "transaction_refund:status_changed":
      payload.data.transaction.id;
      payload.data.amount.value;
      break;
  }
}
```

To daje bardzo wygodny i bezpieczny model obsługi webhooków bez ręcznego rzutowania każdej gałęzi.

---

## Direct Billing IPN

### Weryfikacja IPN Direct Billing

```ts
const result = await simpay.notifications.directbilling.verify({
  payload: req.body,
  sourceIp: req.ip,
});
```

Po poprawnej walidacji metoda zwraca:

```ts
"OK"
```

### Dodatkowe metody

```ts
const isValid = simpay.notifications.directbilling.verifySignature(payload);
const isAllowedIp = await simpay.notifications.directbilling.validateSourceIp(ip);
```

### Przykład z Express.js

```ts
import express from "express";
import {
  SimPayClient,
  SimPayIpnError,
  type DirectBillingTransactionNotification,
} from "@simpay/typescript";

const app = express();
app.use(express.json());

const simpay = new SimPayClient({
  api: {
    password: process.env.SIMPAY_API_PASSWORD!,
  },
  service: {
    id: process.env.SIMPAY_SERVICE_ID!,
  },
  ipn: {
    signatureKey: process.env.SIMPAY_IPN_SIGNATURE_KEY!,
    validateSourceIp: true,
  },
});

app.post("/webhooks/simpay/directbilling", async (req, res) => {
  try {
    await simpay.notifications.directbilling.verify({
      payload: req.body,
      sourceIp: req.ip,
    });

    const payload = req.body as DirectBillingTransactionNotification;

    switch (payload.status) {
      case "transaction_db_new":
      case "transaction_db_confirmed":
      case "transaction_db_payed":
      case "transaction_db_rejected": {
        console.log("direct billing notification", {
          id: payload.id,
          serviceId: payload.serviceId,
          status: payload.status,
          numberFrom: payload.number_from,
          provider: payload.provider,
          net: payload.values.net,
          gross: payload.values.gross,
          partner: payload.values.partner,
          control: payload.control ?? null,
        });
        break;
      }

      default: {
        const neverStatus: never = payload.status;
        throw new Error(`Unhandled direct billing status: ${neverStatus}`);
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    if (error instanceof SimPayIpnError) {
      res.status(400).send(error.code);
      return;
    }

    res.status(500).send("ERROR");
  }
});
```

### Kiedy używać `verify()`, a kiedy `verifySignature()`?

#### `verify()`
Używaj w normalnym webhook handlerze HTTP.
Metoda sprawdza:
- adres IP źródła (jeśli `validateSourceIp: true`)
- obecność klucza podpisu
- kształt payloadu
- podpis notyfikacji

#### `verifySignature()`
Używaj, gdy:
- chcesz sprawdzić tylko podpis,
- payload został już wcześniej zwalidowany inną warstwą,
- testujesz lub debugujesz webhooki poza pełnym requestem HTTP.

---

# Obsługa błędów

SDK rozróżnia kilka klas błędów:

- `SimPayError` – baza
- `SimPayApiError` – API zwróciło błąd
- `SimPayValidationError` – niepoprawne dane wejściowe
- `SimPayNetworkError` – błąd sieci / timeout
- `SimPaySignatureError` – błędy podpisu
- `SimPayIpnError` – błędy IPN / webhooków

Przykład:

```ts
import {
  SimPayApiError,
  SimPayNetworkError,
  SimPayValidationError,
} from "@simpay/typescript";

try {
  const result = await simpay.payments.transactions.create("service_id", {
    amount: 10,
    customer: {
      email: "john@example.com",
    },
  });
} catch (error) {
  if (error instanceof SimPayValidationError) {
    console.error("Validation:", error.message);
  } else if (error instanceof SimPayApiError) {
    console.error("API:", error.statusCode, error.errorCode);
  } else if (error instanceof SimPayNetworkError) {
    console.error("Network:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
}
```

---

# Development

## Uruchamianie testów

```bash
npm test
```

## Typecheck

```bash
npm run typecheck
```

## Lint

```bash
npm run lint
```

## Format

```bash
npm run format
```

## Pełna walidacja

```bash
npm run verify
```

---

