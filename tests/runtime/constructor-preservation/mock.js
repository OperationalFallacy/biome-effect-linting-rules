const MakeWidget = vi.fn(function () {
  return { value: 1 };
});

globalThis.widget = new MakeWidget();
