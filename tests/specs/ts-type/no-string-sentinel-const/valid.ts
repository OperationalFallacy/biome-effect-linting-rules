import { Data, Effect, Match, Schema } from "effect";

const Reservation = Schema.Struct({
  itemId: Schema.NonEmptyString,
  quantity: Schema.Int.check(Schema.isGreaterThan(0)),
  available: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
});

type ReservationDecision = Data.TaggedEnum<{
  Reserve: { readonly itemId: string; readonly quantity: number };
  InsufficientStock: {
    readonly itemId: string;
    readonly requested: number;
    readonly available: number;
  };
}>;
const ReservationDecision = Data.taggedEnum<ReservationDecision>();

/**
 * The reservation decision correctly distinguishes approval from insufficient
 * stock through typed variants. Each variant carries the quantities needed
 * to fulfill the request or explain its rejection. reservationMessage selects
 * each variant and reads its quantities directly.
 */
export const planReservation = Effect.fn("planReservation")(function* (
  input: unknown,
) {
  const request = yield* Schema.decodeUnknownEffect(Reservation)(input);

  // It correctly returns tagged reservation choices with their quantities.
  return Match.value(request.available >= request.quantity).pipe(
    Match.when(true, () =>
      ReservationDecision.Reserve({
        itemId: request.itemId,
        quantity: request.quantity,
      }),
    ),
    Match.orElse(() =>
      ReservationDecision.InsufficientStock({
        itemId: request.itemId,
        requested: request.quantity,
        available: request.available,
      }),
    ),
  );
});

/**
 * reservationMessage displays the reserved quantity or explains the stock
 * shortage. Each tag identifies its payload, so the approval branch can use
 * quantity without another field check.
 */
export const reservationMessage = Effect.fn("reservationMessage")(
  (input: unknown) =>
    planReservation(input).pipe(
      Effect.map((decision) =>
        Match.value(decision).pipe(
          Match.tag("Reserve", ({ quantity }) => `Reserved ${quantity} items`),
          Match.tag(
            "InsufficientStock",
            ({ requested, available }) =>
              `Requested ${requested} items; ${available} available`,
          ),
          Match.exhaustive,
        ),
      ),
    ),
);
