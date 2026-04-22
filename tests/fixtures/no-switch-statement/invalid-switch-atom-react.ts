import { useAtom } from "@effect-atom/atom-react";

declare const statusAtom: unknown;

export const useStatus = () => {
  const [state] = useAtom(statusAtom as never) as ["idle" | "busy" | "done"];
  switch (state) {
    case "idle":
      return "waiting";
    case "busy":
      return "working";
    default:
      return "finished";
  }
};
