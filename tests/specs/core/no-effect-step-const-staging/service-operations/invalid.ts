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

/**
 * Correctly exposes complete workflows through the returned API. Query effects
 * and callable operations each describe the complete work their caller requests.
 */
export const makeWorkOperations = (store: WorkStore) =>
  Effect.gen(function* () {
    const resetWork = Effect.gen(function* () {
      yield* store.clearPending;
      yield* store.clearCompleted;
      yield* store.invalidateSummary;
    });
    const prepare = store.loadItems.pipe(Effect.flatMap(store.prepareItems));
    const load = pipe(
      store.loadItems,
      Effect.map((items) => items.trim()),
    );
    const refresh = Effect.fnUntraced(function* () {
      const items = yield* store.fetchItems;
      yield* store.saveItems(items);
      return items;
    });
    const reload = Effect.fn(function* () {
      return yield* store.fetchItems;
    });
    const tracedReload = Effect.fn("reload")(function* () {
      return yield* store.fetchItems;
    });
    return { resetWork, prepare, load, refresh, reload, tracedReload };
  });

/**
 * Incorrectly stages clock reads before exposed queries and inside an operation.
 * The API members need continuous pipelines within their own operation bodies.
 */
export const makeTimeOperations = () =>
  Effect.gen(function* () {
    const staged = Effect.clockWith((clock) => clock.currentTimeMillis);
    const run = Effect.gen(function* () {
      const read = Effect.clockWith((clock) => clock.currentTimeMillis);
      const formatted = read.pipe(
        Effect.map((time) => new Date(time).toISOString()),
      );
      return yield* formatted;
    });
    const load = staged.pipe(
      Effect.map((time) => new Date(time).toISOString()),
    );
    return { run, load };
  });
