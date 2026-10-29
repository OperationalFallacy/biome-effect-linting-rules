import { Data, HashMap, HashSet, Effect, Array as Arr } from "effect";
import * as Equal from "effect/Equal";

class Key extends Data.Class<{ readonly id: string }> {}
const byDomainKey = new Map<Key, string>([[new Key({ id: "a" }), "first"]]);
const selectedDomainKeys = new Set<Key>([new Key({ id: "a" })]);

const itemKey = (group: string, id: number) => ({ group, id });
const collectionKeysItems = new Map<ReturnType<typeof itemKey>, string>();
const selectedItems = new Set<ReturnType<typeof itemKey>>();

const cellKey = (row: number, column: number) => [row, column];
const cells = new Map<ReturnType<typeof cellKey>, string>();

const qualifiedKey = (id: string) => ({ id });
const qualifiedIndex = new globalThis.Map<ReturnType<typeof qualifiedKey>, number>();
const qualifiedSelection = new globalThis.Set<ReturnType<typeof qualifiedKey>>();

const plainKey = (id: string) => ({ id });
const plainIndex = new Map<ReturnType<typeof plainKey>, number>();

const structuralIndex = HashMap.empty<ReturnType<typeof itemKey>, string>();
const structuralSelection = HashSet.empty<ReturnType<typeof itemKey>>();
const scalarKeys = HashMap.empty<string, number>();
const selectedScalars = HashSet.empty<string>();
const objectValues = new Map<string, ReturnType<typeof itemKey>>();
const plainStructuralIndex = HashMap.empty<ReturnType<typeof plainKey>, number>();

const bareConstructorsIndex = new Map();
const bareConstructorsSelected = new Set();
const bareConstructorsReady = Effect.succeed(true);

declare const custom: { Map: new () => object; Set: new () => object };
const otherConstructorsIndex = new custom.Map();
const otherConstructorsSelected = new custom.Set();
const weakIndex = new WeakMap<object, string>();
const weakSelected = new WeakSet<object>();
const otherConstructorsReady = Effect.succeed(true);

const cache = new Map<object, string>();
const referenceKeysReady = Effect.succeed(true);

const keyString = (key: { id: string }) => key.id;
const records = new Map<ReturnType<typeof keyString>, string>();
const scalarFactorySelected = new Set<ReturnType<typeof keyString>>();
const view = { ready: true };

const scalarKeysById = new Map<string, number>();
const selectedIds = new Set(["a", "b"]);
const scalarKeysReady = Effect.succeed(true);

const stringIndexItems = [{ id: "first", value: 1 }];
const stringIndexById = new Map(Arr.map(stringIndexItems, (item) => [item.id, item.value]));

const untypedCollectionSelected = new Set();
const equal = Equal.equals;
