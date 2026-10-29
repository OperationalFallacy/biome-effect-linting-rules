import "effect";

const labels = rows.map((row) => row.name);
const normalized = rows.map(function normalize(row) {
  const name = row.name.trim();
  return name.toUpperCase();
});
const constructor = vi.fn(function Widget() {
  return { name: "Widget" };
});
const dynamicContext = rows.map(function current() {
  return this.name;
});
const argument = rows.map(function first() {
  return arguments[0];
});
