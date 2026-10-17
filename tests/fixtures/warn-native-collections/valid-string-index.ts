import { Array as Arr } from "effect";

const items = [{ id: "first", value: 1 }];
export const byId = new Map(Arr.map(items, (item) => [item.id, item.value]));
