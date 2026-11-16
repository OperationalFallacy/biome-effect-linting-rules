import { Match } from "effect";

/**
 * quoteArgument quotes text as one argument for a POSIX shell so spaces and
 * shell syntax in the text do not change the command the caller intends to run.
 * Match.value selects text that is safe without quotes or produces a quoted
 * form in explicit branches, as the preset requires.
 */
export const quoteArgument = (argument: string): string =>
  // It correctly uses Match.value for conditional value selection.
  Match.value(/^[\w@%+=:,./-]+$/.test(argument)).pipe(
    Match.when(true, () => argument),
    Match.orElse(() => `'${argument.replaceAll("'", `'\\''`)}'`),
  );
