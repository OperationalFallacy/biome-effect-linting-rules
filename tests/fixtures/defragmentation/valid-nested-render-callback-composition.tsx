import { Match, Option, Result } from "effect";

type Item = {
  readonly id: string;
};

type LoadState = Result.Result<
  {
    readonly items: readonly Item[];
    readonly waiting: boolean;
  },
  Error
>;

export function ItemPanel(props: { readonly loadState: LoadState; readonly id: string }) {
  const content = Result.match(props.loadState, {
    onFailure: () => <div>Unable to load item</div>,
    onInitial: () => <div>Loading item</div>,
    onSuccess(success) {
      const isWaiting = success.waiting;
      const itemOption = Option.fromNullable(
        success.items.find((item) => item.id === props.id),
      );
      const missingItemView = <div>Item record not found</div>;

      return Option.match(itemOption, {
        onNone: () =>
          Match.value(isWaiting).pipe(
            Match.when(true, () => <div>Loading item</div>),
            Match.orElse(() => missingItemView),
          ),
        onSome: (item) => <div>{item.id}</div>,
      });
    },
  });

  return content;
}
