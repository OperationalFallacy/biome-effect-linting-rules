import { Data, Effect, Match, Schema } from "effect";

const RepairQuote = Schema.Struct({
  deviceId: Schema.NonEmptyString,
  repairCost: Schema.Finite.check(Schema.isGreaterThanOrEqualTo(0)),
  replacementCost: Schema.Finite.check(Schema.isGreaterThan(0)),
});

type RepairQuote = typeof RepairQuote.Type;

type RepairDecision = Data.TaggedEnum<{
  ApproveRepair: {
    readonly deviceId: string;
    readonly cost: number;
    readonly savings: number;
  };
  ReplaceDevice: { readonly deviceId: string; readonly cost: number };
}>;
const RepairDecision = Data.taggedEnum<RepairDecision>();

/**
 * The repair decision incorrectly treats an assertion as validation of the quote.
 * A string-valued repair cost can enter the comparison and produce an approval
 * with an unusable cost and savings.
 */
export const assessRepair = Effect.fn("assessRepair")(function* (
  input: unknown,
) {
  const quote = <RepairQuote>input;

  return Match.value(quote.repairCost >= quote.replacementCost).pipe(
    Match.when(true, () =>
      RepairDecision.ReplaceDevice({
        deviceId: quote.deviceId,
        cost: quote.replacementCost,
      }),
    ),
    Match.orElse(() =>
      RepairDecision.ApproveRepair({
        deviceId: quote.deviceId,
        cost: quote.repairCost,
        savings: quote.replacementCost - quote.repairCost,
      }),
    ),
  );
});
