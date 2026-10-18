import { Equal, HashMap, HashSet, Option } from "effect";
import { describe, expect, it } from "vitest";
import { itemKey } from "../fixtures/warn-native-collections/invalid-composite-key";

describe("Effect collection key equality", () => {
  it("It catches a native map lookup that misses an equal composite key", () => {
    const stored = itemKey("example", 42);
    const requested = itemKey("example", 42);

    expect(stored).not.toBe(requested);
    expect(Equal.equals(stored, requested)).toBe(true);
    expect(new Map([[stored, "entry"]]).get(requested)).toBeUndefined();
    expect(HashMap.get(HashMap.make([stored, "entry"]), requested)).toEqual(
      Option.some("entry"),
    );
  });

  it("It catches a native set that keeps duplicate composite keys", () => {
    const stored = itemKey("example", 42);
    const requested = itemKey("example", 42);

    expect(new Set([stored, requested]).size).toBe(2);
    expect(HashSet.size(HashSet.make(stored, requested))).toBe(1);
  });

  it("It allows scalar identifiers with native equality", () => {
    const index = new Map([["item-42", "entry"]]);

    expect(index.get(["item", "42"].join("-"))).toBe("entry");
    expect(new Set(["item-42", ["item", "42"].join("-")]).size).toBe(1);
  });
});
