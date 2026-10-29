import { Schema } from "effect";

const Input = Schema.Struct({ enabled: Schema.Boolean });
const decodeInput = Schema.decodeUnknownEffect(Input);
