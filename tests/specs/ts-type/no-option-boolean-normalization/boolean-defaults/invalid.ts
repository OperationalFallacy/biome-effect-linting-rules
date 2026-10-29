import { Option, Schema } from "effect";

const localBooleanDefaultValue = Option.match(input, {
  onSome: (flag) => flag === true,
  onNone: () => false,
});

const booleanSchemaValue = Schema.decodeUnknownEffect(Schema.Boolean)(input);
