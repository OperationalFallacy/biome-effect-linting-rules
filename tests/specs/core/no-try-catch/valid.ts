import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { Result } from "effect";

/**
 * fingerprintFile returns a file's content hash so a watcher can compare it
 * with the previous hash to detect a change. The caller receives undefined if
 * the file cannot be read or hashed. Result.try captures those exceptions,
 * and Result.getOrUndefined converts a failure to undefined. The hash attempt
 * and its fallback form one Result expression, as the preset requires.
 */
export const fingerprintFile = (file: string): string | undefined =>
  // It correctly handles synchronous exceptions with Result.try.
  Result.try(() =>
    createHash("sha256").update(readFileSync(file)).digest("base64url"),
  ).pipe(Result.getOrUndefined);
