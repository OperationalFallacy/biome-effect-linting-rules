import "effect";

const namedCallback = [1].map(function increment(n) {
  return n + 1;
});

{
  const namedConstructorMock = vi.fn(function Widget() {
    return { value: 1 };
  });
}

{
  const anonymousConstructorMock = vi.fn(function () {
    return { value: 1 };
  });
}

{
  const callbackBindings = items.map(function normalize(item) {
    const value = item.trim();
    return value;
  });
}

{
  const argumentDependentCallback = items.map(function current() {
    return arguments[0];
  });
}

{
  const expressionCallback = [1].map((n) => n + 1);
}
