import { Data, Effect, Option, Schema } from "effect";

const InvitationRequest = Schema.Struct({
  workspace: Schema.NonEmptyString,
  invitationUrl: Schema.NonEmptyString,
  recipient: Schema.optional(Schema.NullOr(Schema.NonEmptyString)),
  accountEmail: Schema.optional(Schema.NullOr(Schema.NonEmptyString)),
});

export class InvitationRecipientMissing extends Data.TaggedError(
  "InvitationRecipientMissing",
)<{ readonly workspace: string }> {}

/**
 * The prepareInvitation function replaces null or undefined before
 * Option.fromNullishOr handles those values again. The extra fallbacks
 * leave the chosen recipient unchanged.
 */
export const prepareInvitation = Effect.fn("prepareInvitation")(function* (
  input: unknown,
) {
  const request = yield* Schema.decodeUnknownEffect(InvitationRequest)(input);

  // Neither fallback changes which address receives the invitation.
  const recipient = yield* Option.fromNullishOr(request.recipient ?? null).pipe(
    Option.orElse(() =>
      Option.fromNullishOr(request.accountEmail ?? undefined),
    ),
    Effect.fromOption(
      () => new InvitationRecipientMissing({ workspace: request.workspace }),
    ),
  );

  return {
    to: recipient,
    subject: `Invitation to ${request.workspace}`,
    body: `Join ${request.workspace}: ${request.invitationUrl}`,
  };
});
