import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/**
 * fingerprintFile returns a file's content hash so a watcher can compare it
 * with the previous hash to detect a change. The caller receives undefined if
 * the file cannot be read or hashed. This version catches those exceptions
 * with try/catch. The preset requires Result.try for synchronous exceptions
 * so the hash attempt and its fallback form one Result expression.
 */
export const fingerprintFile = (file: string): string | undefined => {
  // It incorrectly handles synchronous exceptions with try/catch.
  try {
    return createHash("sha256").update(readFileSync(file)).digest("base64url");
  } catch {
    return undefined;
  }
};
