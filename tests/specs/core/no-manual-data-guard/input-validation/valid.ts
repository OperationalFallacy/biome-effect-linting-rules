import { Schema } from "effect";

const User = Schema.Struct({ id: Schema.String, active: Schema.Boolean });
const decodeUser = Schema.decodeUnknownEffect(User);
