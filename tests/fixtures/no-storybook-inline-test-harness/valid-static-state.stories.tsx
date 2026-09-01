import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Shared/Input",
  component: "input",
  args: { disabled: true },
} satisfies Meta<"input">;

export default meta;
export const Disabled: StoryObj<typeof meta> = {};
