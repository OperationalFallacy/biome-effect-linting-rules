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
 * prepareExport correctly calculates the active rows and their total in the
 * Effect.map callback that constructs the export. Both values remain
 * available when the callback builds the payload, so the field needs no
 * immediately invoked function.
 */
export const prepareExport = Effect.fn("Inventory.prepareExport")(
  (title: string, inventoryUrl: string) =>
    HttpClient.get(inventoryUrl).pipe(
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.flatMap(HttpClientResponse.schemaBodyJson(InventoryRows)),
      Effect.map((rows) => {
        const active = Arr.filter(rows, (row) => !row.archived);
        const totalQuantity = Arr.reduce(
          active,
          0,
          (total, row) => total + row.quantity,
        );

        return {
          title,
          // payload correctly uses active and totalQuantity from the export callback's scope.
          payload: {
            rowCount: active.length,
            totalQuantity,
            rows: Arr.map(active, ({ id, quantity }) => ({
              id,
              quantity,
            })),
          },
        };
      }),
    ),
);
