import { Atom, Result } from "@effect-atom/atom-react";
import { Data, Match, Option } from "effect";
import * as A from "effect/Array";

type Row = {
  readonly key: string;
  readonly category: string;
};

type Collection = {
  readonly keys: ReadonlyArray<string>;
};

type Projection = {
  readonly rows: ReadonlyArray<Row>;
};

declare const rowAtom: (key: string) => Atom.Atom<Result.Result<Row, unknown>>;
declare const collectionAtom: Atom.Atom<Result.Result<Collection, unknown>>;

// Proper usage: this named projection helper traverses keyed atom Results and
// returns a complete domain projection value.
const successfulRows = (
  collection: Collection,
  get: Atom.Context,
): ReadonlyArray<Row> =>
  A.filterMap(collection.keys, (key) =>
    Result.match(get(rowAtom(key)), {
      onInitial: () => Option.none(),
      onFailure: () => Option.none(),
      onSuccess: (success) => Option.some(success.value),
    }),
  );

// Proper usage: this atom projection returns the final projection shape directly.
export const visibleRowsAtom = Atom.make((get) =>
  Result.map(
    get(collectionAtom),
    (collection): Projection => ({
      rows: successfulRows(collection, get).filter(
        (row) => row.category !== "archived",
      ),
    }),
  ),
);

class ConfigError extends Data.TaggedError("ConfigError")<{
  readonly reason: string;
  readonly parameterName: string;
  readonly cause?: unknown;
}> {}

// Proper usage: this constructs one declared tagged error contract directly.
const toConfigError =
  (parameterName: string, reason: string) =>
  (cause?: unknown): ConfigError =>
    new ConfigError({
      reason,
      parameterName,
      cause,
    });

// Proper usage: this normalizes unknown causes into the declared error contract.
export const ensureConfigError =
  (parameterName: string, reason: string) =>
  (cause: unknown): ConfigError =>
    Match.value(cause).pipe(
      Match.when(
        (error: unknown): error is ConfigError => error instanceof ConfigError,
        (error) => error,
      ),
      Match.orElse((error) => toConfigError(parameterName, reason)(error)),
    );
