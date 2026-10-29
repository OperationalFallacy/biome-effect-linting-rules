import { Schema } from "effect";

const decodeProfile = Schema.decodeUnknownEffect(Profile);
const modes = ["loading", "ready"] as const;
