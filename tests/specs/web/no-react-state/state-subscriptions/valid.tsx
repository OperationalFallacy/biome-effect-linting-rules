import { useAtomValue } from "@effect/atom-react";

export const Count = () => <span>{useAtomValue(countAtom)}</span>;
