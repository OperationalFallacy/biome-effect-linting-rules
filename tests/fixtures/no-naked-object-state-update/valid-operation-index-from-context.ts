import { Option } from "effect";

declare const LambdaDurableStateSchema: {
  readonly fields: {
    readonly operations: {
      readonly make: (value: unknown) => unknown;
    };
  };
};

type LambdaDurableOperation = {
  readonly Id?: string | null;
};

export const operationIndexFromContext = (
  operations: ReadonlyArray<LambdaDurableOperation>,
) =>
  LambdaDurableStateSchema.fields.operations.make(
    Object.fromEntries(
      operations.flatMap((operation) =>
        Option.match(Option.fromNullable(operation.Id), {
          onNone: () => [],
          onSome: (id) => [[id, operation]],
        }),
      ),
    ),
  );
