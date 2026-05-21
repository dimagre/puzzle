# Monobank Acquiring API: Holds (Pre-Authorization)

## Question

Does Monobank's acquiring API support hold operations (blocking money on a card as a deposit)?

## Method

- Web search for "monobank acquiring API hold", "monobank api блокування коштів"
- Fetched official API docs: monobank.ua/api-docs/acquiring/methods/in-app/

## Findings

### Yes, holds are fully supported.

**API Name**: Monobank Acquiring API (also called "mono pay")

**Hold Flow**:

1. `POST /api/merchant/invoice/create` with `paymentType: "hold"`
   - Blocks the specified `amount` (in kopecks) on the customer's card
   - Hold duration: **9 days** (auto-cancelled if not finalized)
   - Returns `invoiceId` for subsequent operations

2. `GET /api/merchant/invoice/status` — check hold status

3. `POST /api/merchant/invoice/finalize` — capture (full or partial amount)
   - `invoiceId` (required)
   - `amount` (optional) — for partial capture
   - `items` (optional) — for fiscalization

4. To release the hold without charging: simply don't finalize (auto-cancels after 9 days), or use cancellation endpoint

**Other payment types supported**:
- `paymentType: "debit"` — immediate charge (default)
- `paymentType: "hold"` — pre-authorization
- `paymentType: "verification"` — card verification (0 UAH hold)

**Requirements to connect**:
- ФОП (sole proprietor) or ТОВ (LLC) with a monobank business account
- Setup via business cabinet, advertised as "live in 10 minutes"
- Commission: 1.3% domestic cards, 2% international
- Apple Pay, Google Pay supported out of the box

**Authentication**: `X-Token` header (merchant token from business cabinet)

## Application to Our Project

For puzzle rental deposits:
- On order creation: `POST /invoice/create` with `paymentType: "hold"`, amount = deposit sum
- Puzzle returned OK: let hold expire (or cancel explicitly)
- Puzzle damaged/not returned: `POST /invoice/finalize` to charge the deposit
- Rental fee itself: separate `paymentType: "debit"` invoice

**9-day limit consideration**: If rental period exceeds 9 days, we need to either:
- Charge the deposit upfront (debit) and refund on return
- Or create a new hold periodically (complex, bad UX)

Recommendation: for rentals > 9 days, charge deposit as debit and refund manually. For short rentals (majority of use cases), hold is ideal.

## Sources

- https://monobank.ua/api-docs/acquiring/methods/in-app/post--api--merchant--invoice--create
- https://monobank.ua/api-docs/acquiring/methods/in-app/post--api--merchant--invoice--finalize
- https://monobank.ua/en/acquiring
