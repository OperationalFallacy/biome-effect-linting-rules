import { Effect, Match, Schema } from "effect";

const Reservation = Schema.Struct({
  itemId: Schema.NonEmptyString,
  quantity: Schema.Int.check(Schema.isGreaterThan(0)),
  available: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
});

/**
 * The reservation decision incorrectly identifies its branches with string
 * constants. The status field widens to string, so callers cannot use it to
 * narrow the quantities available on each branch. reservationMessage must
 * check quantity again before it can report an approved reservation.
 */
export const planReservation = Effect.fn("planReservation")(function* (
  input: unknown,
) {
  const request = yield* Schema.decodeUnknownEffect(Reservation)(input);

  // It incorrectly declares a string token for the reservation choice.
  const status = "reserve";
  const rejectionStatus = "insufficient-stock";

  return Match.value(request.available >= request.quantity).pipe(
    Match.when(true, () => ({
      status,
      itemId: request.itemId,
      quantity: request.quantity,
    })),
    Match.orElse(() => ({
      status: rejectionStatus,
      itemId: request.itemId,
      requested: request.quantity,
      available: request.available,
    })),
  );
});

/**
 * reservationMessage displays the reserved quantity or explains the stock
 * shortage. The widened status cannot prove that quantity exists, so the
 * approval pattern repeats that field's numeric check.
 */
export const reservationMessage = Effect.fn("reservationMessage")(
  (input: unknown) =>
    planReservation(input).pipe(
      Effect.map((decision) =>
        Match.value(decision).pipe(
          Match.when(
            { status: "reserve", quantity: Match.number },
            ({ quantity }) => `Reserved ${quantity} items`,
          ),
          Match.when(
            {
              status: "insufficient-stock",
              requested: Match.number,
              available: Match.number,
            },
            ({ requested, available }) =>
              `Requested ${requested} items; ${available} available`,
          ),
          Match.orElse(() => "Reservation data unavailable"),
        ),
      ),
    ),
);
