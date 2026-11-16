/**
 * quoteArgument quotes text as one argument for a POSIX shell so spaces and
 * shell syntax in the text do not change the command the caller intends to run.
 * A ternary chooses between text that is safe without quotes and text that
 * needs quotes. The preset requires Match.value branches for this choice.
 */
export const quoteArgument = (argument: string): string =>
  // It incorrectly uses a ternary for conditional value selection.
  /^[\w@%+=:,./-]+$/.test(argument)
    ? argument
    : `'${argument.replaceAll("'", `'\\''`)}'`;
