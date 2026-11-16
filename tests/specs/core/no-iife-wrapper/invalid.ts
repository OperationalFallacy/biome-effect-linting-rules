import { Array as Arr, Effect, Schema } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";

const InventoryRows = Schema.Array(
  Schema.Struct({
    id: Schema.String,
    quantity: Schema.Int,
    archived: Schema.Boolean,
  }),
);

/**
 * prepareExport incorrectly introduces another function body just to
 * calculate the payload field. The extra scope separates the active rows and
 * their total from the construction of the export that uses them.
 */
export const prepareExport = Effect.fn("Inventory.prepareExport")(
  (title: string, inventoryUrl: string) =>
    HttpClient.get(inventoryUrl).pipe(
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.flatMap(HttpClientResponse.schemaBodyJson(InventoryRows)),
      Effect.map((rows) => ({
        title,
        // payload incorrectly isolates active rows and totalQuantity in an invoked function.
        payload: (() => {
          const active = Arr.filter(rows, (row) => !row.archived);
          const totalQuantity = Arr.reduce(
            active,
            0,
            (total, row) => total + row.quantity,
          );

          return {
            rowCount: active.length,
            totalQuantity,
            rows: Arr.map(active, ({ id, quantity }) => ({
              id,
              quantity,
            })),
          };
        })(),
      })),
    ),
);
