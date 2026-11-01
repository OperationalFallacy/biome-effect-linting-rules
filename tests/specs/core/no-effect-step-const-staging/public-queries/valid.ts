import { Config, Effect } from "effect";

/**
 * Correctly exports a reusable configuration query as a public operation.
 * The query reads through the runtime's configuration provider.
 */
export const readRegion = Config.String("REGION").pipe(
  Config.withDefault("local"),
  Effect.map((region) => region.toUpperCase()),
);
