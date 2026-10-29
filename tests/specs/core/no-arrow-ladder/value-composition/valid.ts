import { pipe } from "effect";

const total = (price: number, quantity: number) => price * quantity;
const describeTotal = (value: number) => pipe(value, formatCurrency, addLabel);
