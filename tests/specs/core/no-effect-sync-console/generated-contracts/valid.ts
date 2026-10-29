import type { Effect } from "effect";

export interface CatalogItem {
  readonly id: string;
  readonly title: string;
}

export interface CatalogPage {
  readonly items: ReadonlyArray<CatalogItem>;
  readonly nextCursor?: string;
}

/**
 * Correctly describes effectful client operations in a type-only contract.
 * An Effect return type declares the operation without executing a side effect.
 */
export interface CatalogClient {
  readonly list: (cursor?: string) => Effect.Effect<CatalogPage>;
}
