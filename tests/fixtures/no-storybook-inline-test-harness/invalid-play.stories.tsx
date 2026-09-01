import type { Meta } from "@storybook/nextjs-vite";

export default { title: "Shared/Input" } satisfies Meta;
export const Keyboard = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    canvas.getByRole("textbox");
  },
};
