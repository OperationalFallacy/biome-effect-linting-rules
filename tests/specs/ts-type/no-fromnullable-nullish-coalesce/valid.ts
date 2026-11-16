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
 * The prepareInvitation function passes each address directly to
 * Option.fromNullishOr. It uses the account email when the request has no
 * recipient. It fails when the request contains no address.
 */
export const prepareInvitation = Effect.fn("prepareInvitation")(function* (
  input: unknown,
) {
  const request = yield* Schema.decodeUnknownEffect(InvitationRequest)(input);

  // The function uses the account email when the request has no recipient.
  const recipient = yield* Option.fromNullishOr(request.recipient).pipe(
    Option.orElse(() => Option.fromNullishOr(request.accountEmail)),
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
