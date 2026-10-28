import { Context, Effect, Equal, HashMap, HashSet, Layer, Option, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { describe, expect, it } from "vitest";

describe("Effect API contracts", () => {
  it("It catches native collection lookups that miss structurally equal keys", () => {
    const stored = { shelf: "fiction", position: 7 };
    const requested = { shelf: "fiction", position: 7 };
    expect(Equal.equals(stored, requested)).toBe(true);
    expect(new Map([[stored, "book"]]).get(requested)).toBeUndefined();
    expect(HashMap.get(HashMap.make([stored, "book"]), requested)).toEqual(Option.some("book"));
    expect(new Set([stored, requested]).size).toBe(2);
    expect(HashSet.size(HashSet.make(stored, requested))).toBe(1);
  });

  it("It allows deliberate reference identity and native scalar keys", () => {
    const stored = Equal.byReference({ isbn: "example" });
    const requested = Equal.byReference({ isbn: "example" });
    expect(Equal.equals(stored, requested)).toBe(false);
    expect(new Map([["book-7", "entry"]]).get(["book", "7"].join("-"))).toBe("entry");
  });

  it("It allows schema constructors and JSON codecs for related fields", () => {
    const File = Schema.Union([
      Schema.Struct({ kind: Schema.Literal("document"), format: Schema.Literal("pdf") }),
      Schema.Struct({ kind: Schema.Literal("image"), format: Schema.Literal("png") }),
    ]);
    const json = Schema.fromJsonString(File);
    const value = File.make({ kind: "document", format: "pdf" });
    const encoded = Effect.runSync(Schema.encodeEffect(json)(value));
    expect(Effect.runSync(Schema.decodeUnknownEffect(json)(encoded))).toEqual(value);
    expect(Effect.runSyncExit(Schema.decodeUnknownEffect(json)('{"kind":"image","format":"pdf"}'))._tag).toBe("Failure");
  });

  it("It allows service contracts with explicit layers and reusable operations", () => {
    class Catalog extends Context.Service<Catalog, { readonly count: Effect.Effect<number> }>()("example/Catalog") {}
    const live = Layer.effect(Catalog, Effect.succeed({ count: Effect.succeed(7) }));
    const countBooks = Effect.fn("countBooks")(function* () {
      const catalog = yield* Catalog;
      return yield* catalog.count;
    });
    expect(Effect.runSync(countBooks().pipe(Effect.provide(live)))).toBe(7);
  });

  it("It allows direct Atom Effects and deferred synchronous registry calls", () => {
    const count = Atom.make(0);
    const registry = AtomRegistry.make();
    try {
      const update = Atom.set(count, 7).pipe(Effect.provideService(AtomRegistry.AtomRegistry, registry));
      Effect.runSync(update);
      expect(registry.get(count)).toBe(7);
      const deferred = Effect.sync(() => registry.set(count, 9));
      expect(registry.get(count)).toBe(7);
      Effect.runSync(deferred);
      expect(registry.get(count)).toBe(9);
    } finally {
      registry.dispose();
    }
  });
});
