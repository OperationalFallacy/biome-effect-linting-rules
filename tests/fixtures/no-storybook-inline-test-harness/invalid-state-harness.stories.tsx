import { useArgs } from "storybook/preview-api";
import type { Meta } from "@storybook/nextjs-vite";

export default { title: "Shared/Input" } satisfies Meta;
export const Controlled = {
  render: () => {
    const [args] = useArgs();
    return <input value={args.value} />;
  },
};
