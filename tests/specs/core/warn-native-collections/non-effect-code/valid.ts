import { format } from "node:util";

/**
 * Correctly uses native object identity in a module outside Effect composition.
 * Callers use the same object instances to retrieve their stored values.
 */
export const index = new Map<{ readonly id: string }, string>();
export const selected = new Set<{ readonly id: string }>();

/**
 * Correctly treats a package name as ordinary text for display.
 */
export const packageName = format("%s", "effect");
