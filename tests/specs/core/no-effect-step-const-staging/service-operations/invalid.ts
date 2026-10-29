import { Effect, pipe } from "effect";

interface WorkStore {
  readonly clearPending: Effect.Effect<void>;
  readonly clearCompleted: Effect.Effect<void>;
  readonly invalidateSummary: Effect.Effect<void>;
  readonly loadItems: Effect.Effect<string>;
  readonly prepareItems: (items: string) => Effect.Effect<string>;
  readonly fetchItems: Effect.Effect<string>;
  readonly saveItems: (items: string) => Effect.Effect<void>;
}

declare const workStore: WorkStore;

const makeWorkOperations = () =>
  Effect.gen(function* () {
    const resetWork = Effect.gen(function* () {
      yield* workStore.clearPending;
      yield* workStore.clearCompleted;
      yield* workStore.invalidateSummary;
    });
    const prepare = workStore.loadItems.pipe(Effect.flatMap(workStore.prepareItems));
    const load = pipe(
      workStore.loadItems,
      Effect.map((items) => items),
    );
    const refresh = Effect.fnUntraced(function* () {
      const items = yield* workStore.fetchItems;
      yield* workStore.saveItems(items);
      return items;
    });
    const reload = Effect.fn(function* () {
      return yield* workStore.fetchItems;
    });
    const tracedReload = Effect.fn("reload")(function* () {
      return yield* workStore.fetchItems;
    });

    return { resetWork, prepare, load, refresh, reload, tracedReload };
  });

makeWorkOperations satisfies () => Effect.Effect<{
  readonly resetWork: Effect.Effect<void>;
  readonly prepare: Effect.Effect<string>;
  readonly load: Effect.Effect<string>;
  readonly refresh: () => Effect.Effect<string>;
  readonly reload: () => Effect.Effect<string>;
  readonly tracedReload: () => Effect.Effect<string>;
}>;

const makeOperations = () =>
  Effect.gen(function* () {
    const staged = Effect.succeed(1);
    const run = Effect.gen(function* () {
      const parsed = Effect.succeed(2);
      const evaluated = parsed.pipe(Effect.map((value) => value + 1));
      return yield* evaluated;
    });
    const load = staged.pipe(Effect.map((value) => value + 1));

    return { run, load };
  });
